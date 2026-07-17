import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "~/server/jwt";
import { sanitizeCell } from "~/server/spreadsheet";
import ExcelJS from "exceljs";
import { db } from "~/server/db";
import { calculateAssignationCost } from "~/lib/utils";


const MAX_PERIMETERS = 20;

function verifyUserId(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return false;
  try {
    jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "toNumber" in value) {
    try {
      return (value as { toNumber: () => number }).toNumber();
    } catch {
      return null;
    }
  }
  return null;
}

function sanitizeSheetName(name: string): string {
  // Excel sheet names: max 31 chars, no \ / ? * [ ] : and can't be empty.
  const cleaned = name.replace(/[\\/?*[\]:]/g, "-").trim();
  return (cleaned || "Feuille").slice(0, 31);
}

function uniqueSheetName(base: string, used: Set<string>): string {
  let candidate = sanitizeSheetName(base);
  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }
  let suffix = 2;
  while (used.has(candidate)) {
    const suffixStr = ` (${suffix})`;
    candidate = sanitizeSheetName(base).slice(0, 31 - suffixStr.length) + suffixStr;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function sanitizeFilenamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 40) || "Perimetre";
}

const BRAND_DARK = "FF1A8880";
const BRAND = "FF24B2A6";
const BRAND_LIGHT = "FFECFBF9";
const STATUS_STAFFED = "FFD1F4EF";
const STATUS_POTENTIAL = "FFFEF3C7";
const STATUS_EMPTY = "FFFEE2E2";
const HEADER_FONT_COLOR = "FFFFFFFF";

type SelectedRelation = {
  teacher: { id: string; firstname: string; lastname: string; rate: unknown };
  rate: unknown;
  rateTDP: unknown;
  rateFFP: unknown;
  workload: number;
};

export async function POST(req: NextRequest) {
  if (!verifyUserId(req)) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { perimeterIds?: unknown; includePromoSheets?: unknown };
  try {
    body = (await req.json()) as { perimeterIds?: unknown; includePromoSheets?: unknown };
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const perimeterIds = Array.isArray(body.perimeterIds)
    ? body.perimeterIds.filter((id): id is string => typeof id === "string")
    : [];
  const includePromoSheets = body.includePromoSheets !== false;

  if (perimeterIds.length === 0) {
    return NextResponse.json({ error: "Aucun périmètre sélectionné" }, { status: 400 });
  }
  if (perimeterIds.length > MAX_PERIMETERS) {
    return NextResponse.json(
      { error: `Vous ne pouvez pas exporter plus de ${MAX_PERIMETERS} périmètres à la fois` },
      { status: 400 },
    );
  }

  const perimeters = await db.perimeter.findMany({
    where: { id: { in: perimeterIds } },
    orderBy: { title: "asc" },
    include: {
      promos: {
        orderBy: [{ level: "asc" }, { specialty: "asc" }],
        include: {
          promoModules: {
            orderBy: { module: { name: "asc" } },
            include: {
              module: true,
              selected: { include: { teacher: true } },
              potential: { select: { teacherId: true } },
            },
          },
        },
      },
    },
  });

  if (perimeters.length === 0) {
    return NextResponse.json({ error: "Aucun périmètre trouvé" }, { status: 404 });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "YBoard";
  workbook.created = new Date();

  // ─── Sheet 1: Vue d'ensemble ───────────────────────────────────────────
  const overviewSheet = workbook.addWorksheet("Vue d'ensemble", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  overviewSheet.columns = [
    { header: "Nom Périmètre", key: "title", width: 28 },
    { header: "Coor", key: "coor", width: 22 },
    { header: "% Staffé", key: "staffed", width: 12 },
    { header: "% Potentiel", key: "potential", width: 12 },
    { header: "% Vide", key: "empty", width: 12 },
    { header: "Nb Modules", key: "moduleCount", width: 12 },
    { header: "Charge financière", key: "cost", width: 18 },
  ];

  const overviewHeaderRow = overviewSheet.getRow(1);
  overviewHeaderRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_DARK } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  overviewHeaderRow.height = 22;

  let overallModules = 0;
  let overallStaffed = 0;
  let overallPotential = 0;
  let overallCost = 0;

  const usedSheetNames = new Set<string>([sanitizeSheetName("Vue d'ensemble")]);

  for (const perimeter of perimeters) {
    const allPromoModules = perimeter.promos.flatMap((p) => p.promoModules);
    const totalModules = allPromoModules.length;
    const staffedModules = allPromoModules.filter((pm) => pm.selected.length > 0).length;
    const potentialModules = allPromoModules.filter(
      (pm) => pm.selected.length === 0 && pm.potential.length > 0,
    ).length;
    const emptyModules = totalModules - staffedModules - potentialModules;

    const perimeterCost = allPromoModules.reduce((sum, pm) => {
      const relationsCost = pm.selected.reduce((relSum, sel) => {
        const teacherRate = toNumber(sel.teacher.rate);
        const { cost } = calculateAssignationCost({
          workload: sel.workload,
          rate: toNumber(sel.rate),
          rateTDP: toNumber(sel.rateTDP),
          rateFFP: toNumber(sel.rateFFP),
          teacherRate,
          moduleNombreHeureTDP: pm.module.nombreHeureTDP,
          moduleNombreHeureFFP: pm.module.nombreHeureFFP,
        });
        return relSum + cost;
      }, 0);
      return sum + relationsCost;
    }, 0);

    overallModules += totalModules;
    overallStaffed += staffedModules;
    overallPotential += potentialModules;
    overallCost += perimeterCost;

    const row = overviewSheet.addRow({
      title: sanitizeCell(perimeter.title),
      coor: sanitizeCell(perimeter.origin),
      staffed: totalModules > 0 ? staffedModules / totalModules : 0,
      potential: totalModules > 0 ? potentialModules / totalModules : 0,
      empty: totalModules > 0 ? emptyModules / totalModules : 0,
      moduleCount: totalModules,
      cost: perimeterCost,
    });
    row.getCell("staffed").numFmt = "0.0%";
    row.getCell("potential").numFmt = "0.0%";
    row.getCell("empty").numFmt = "0.0%";
    row.getCell("cost").numFmt = '#,##0.00 "€"';
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
    });

    // ─── One sheet per Promo for this perimeter (optional, can be large) ──
    if (!includePromoSheets) continue;
    for (const promo of perimeter.promos) {
      const sheetTitleBase =
        perimeters.length > 1
          ? `${promo.level} ${promo.specialty} (${perimeter.title})`
          : `${promo.level} ${promo.specialty}`;
      const sheetName = uniqueSheetName(sheetTitleBase, usedSheetNames);
      const promoSheet = workbook.addWorksheet(sheetName, {
        views: [{ state: "frozen", ySplit: 1 }],
      });

      promoSheet.columns = [
        { header: "Module", key: "module", width: 32 },
        { header: "Intervenant(s) sélectionné(s)", key: "teachers", width: 30 },
        { header: "VH Total", key: "vhTotal", width: 11 },
        { header: "VH FFP", key: "vhFfp", width: 10 },
        { header: "VH TDP", key: "vhTdp", width: 10 },
        { header: "Mode de calcul", key: "mode", width: 15 },
        { header: "Taux horaire", key: "rate", width: 22 },
        { header: "Coût total", key: "cost", width: 14 },
        { header: "Statut", key: "status", width: 12 },
      ];

      const promoHeaderRow = promoSheet.getRow(1);
      promoHeaderRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      promoHeaderRow.height = 22;
      promoSheet.autoFilter = { from: "A1", to: "I1" };

      for (const pm of promo.promoModules) {
        const selectedRelations = pm.selected as SelectedRelation[];
        const teacherNames = selectedRelations
          .map((s) => `${s.teacher.firstname} ${s.teacher.lastname}`)
          .join(", ");

        let totalCost = 0;
        const modes = new Set<string>();
        const rateLabels: string[] = [];

        for (const sel of selectedRelations) {
          const teacherRate = toNumber(sel.teacher.rate);
          const rateTDP = toNumber(sel.rateTDP);
          const rateFFP = toNumber(sel.rateFFP);
          const rate = toNumber(sel.rate);
          const { cost, mode } = calculateAssignationCost({
            workload: sel.workload,
            rate,
            rateTDP,
            rateFFP,
            teacherRate,
            moduleNombreHeureTDP: pm.module.nombreHeureTDP,
            moduleNombreHeureFFP: pm.module.nombreHeureFFP,
          });
          totalCost += cost;
          modes.add(mode);
          if (mode === "tdp_ffp") {
            rateLabels.push(`TDP ${rateTDP ?? 0}€/h · FFP ${rateFFP ?? 0}€/h`);
          } else {
            rateLabels.push(`${rate ?? teacherRate ?? 0}€/h`);
          }
        }

        const modeLabel =
          modes.size === 0
            ? "-"
            : modes.size > 1
              ? "Mixte"
              : modes.has("tdp_ffp")
                ? "TDP/FFP"
                : "Standard";

        const status =
          selectedRelations.length > 0
            ? "Staffé"
            : pm.potential.length > 0
              ? "Potentiel"
              : "Vide";

        const row = promoSheet.addRow({
          module: sanitizeCell(pm.module.name),
          teachers: sanitizeCell(teacherNames) || "-",
          vhTotal: pm.workload,
          vhFfp: pm.module.nombreHeureFFP ?? "-",
          vhTdp: pm.module.nombreHeureTDP ?? "-",
          mode: modeLabel,
          rate: rateLabels.length > 0 ? rateLabels.join(" | ") : "-",
          cost: totalCost,
          status,
        });
        row.getCell("cost").numFmt = '#,##0.00 "€"';
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", wrapText: true };
        });

        const statusCell = row.getCell("status");
        statusCell.alignment = { vertical: "middle", horizontal: "center" };
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb:
              status === "Staffé"
                ? STATUS_STAFFED
                : status === "Potentiel"
                  ? STATUS_POTENTIAL
                  : STATUS_EMPTY,
          },
        };
      }

      if (promo.promoModules.length === 0) {
        const emptyRow = promoSheet.addRow({ module: "Aucun module dans cette promo" });
        emptyRow.getCell("module").font = { italic: true, color: { argb: "FF9CA3AF" } };
      }
    }
  }

  if (perimeters.length > 1) {
    const totalRow = overviewSheet.addRow({
      title: "Total",
      coor: "",
      staffed: overallModules > 0 ? overallStaffed / overallModules : 0,
      potential: overallModules > 0 ? overallPotential / overallModules : 0,
      empty:
        overallModules > 0
          ? (overallModules - overallStaffed - overallPotential) / overallModules
          : 0,
      moduleCount: overallModules,
      cost: overallCost,
    });
    totalRow.getCell("staffed").numFmt = "0.0%";
    totalRow.getCell("potential").numFmt = "0.0%";
    totalRow.getCell("empty").numFmt = "0.0%";
    totalRow.getCell("cost").numFmt = '#,##0.00 "€"';
    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_LIGHT } };
      cell.border = { top: { style: "thin", color: { argb: "FF9CA3AF" } } };
    });
  }

  overviewSheet.autoFilter = { from: "A1", to: "G1" };

  const buffer = await workbook.xlsx.writeBuffer();

  const datePart = new Date().toISOString().slice(0, 10);
  const perimeterPart =
    perimeters.length === 1
      ? sanitizeFilenamePart(perimeters[0]!.title)
      : `${perimeters.length}Perimetres`;
  const filename = `Export_${datePart}_YBoard_${perimeterPart}_Completion.xlsx`;

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
