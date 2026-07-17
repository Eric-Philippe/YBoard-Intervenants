import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "~/server/jwt";
import * as XLSX from "xlsx";
import { db } from "~/server/db";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SHEETS = 30;
const MAX_ROWS_PER_SHEET = 500;

const LEVEL_PREFIXES = ["B1", "B2", "B3", "M1", "M2"] as const;

const NAME_MAX_LEN = 255;
const SPECIALTY_MAX_LEN = 50;
const PERIODE_MAX_LEN = 100;

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

function cellToRawString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value instanceof Date) return value.toISOString();
  return "";
}

function normalizeHeader(value: unknown): string {
  return cellToRawString(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const COLUMN_SYNONYMS = {
  matiere: [
    "matiere",
    "nom matiere",
    "nom de la matiere",
    "intitule",
    "intitule matiere",
  ],
  description: [
    "description",
    "objectifs pedagogiques",
    "objectif pedagogique",
    "objectifs",
    "contenu",
  ],
  vh: [
    "vh",
    "volume horaire",
    "volume horaire total",
    "vh total",
    "volume horaire global",
  ],
  mentor: ["mentor", "mentorat", "avec mentor"],
  periode: ["periode", "period"],
  vhFfp: ["vh ffp", "vhffp", "volume horaire ffp", "ffp"],
  vhTdp: ["vh tdp", "vhtdp", "volume horaire tdp", "tdp"],
};

type ColumnKey = keyof typeof COLUMN_SYNONYMS;

function detectColumns(
  headerRow: unknown[],
): Partial<Record<ColumnKey, number>> {
  const found: Partial<Record<ColumnKey, number>> = {};
  headerRow.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    if (!normalized) return;
    for (const [key, synonyms] of Object.entries(COLUMN_SYNONYMS) as [
      ColumnKey,
      readonly string[],
    ][]) {
      if (found[key] !== undefined) continue;
      if (synonyms.includes(normalized)) {
        found[key] = index;
      }
    }
  });
  return found;
}

function cellToString(value: unknown): string {
  return cellToRawString(value).trim();
}

function parseMentor(value: unknown): boolean {
  const normalized = cellToString(value).toLowerCase();
  return normalized === "oui" || normalized === "yes";
}

function parseWorkload(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const asString = cellToString(value).replace(",", ".");
  const num = Number(asString);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num);
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const asString = cellToString(value).replace(",", ".");
  const num = Number(asString);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num);
}

function detectLevel(
  sheetName: string,
): { level: string; specialty: string } | null {
  const trimmed = sheetName.trim();
  const upper = trimmed.toUpperCase();
  const prefix = LEVEL_PREFIXES.find((p) => upper.startsWith(p));
  if (!prefix) return null;

  const rest = trimmed
    .slice(prefix.length)
    .replace(/^[\s\-_:]+/, "")
    .trim();
  const specialty = rest.length > 0 ? rest : "Général";
  return { level: prefix, specialty };
}

interface SheetReport {
  name: string;
  status: "ok" | "skipped" | "error";
  reason?: string;
  level?: string;
  specialty?: string;
  promoStatus?: "created" | "reused";
  modulesCreated: number;
  rowErrors: string[];
}

export async function POST(req: NextRequest) {
  if (!verifyUserId(req)) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const perimeterId = formData.get("perimeterId") as string | null;

  if (!file || !perimeterId) {
    return NextResponse.json(
      { error: "Fichier et périmètre requis" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse la taille maximale autorisée (5 Mo)" },
      { status: 400 },
    );
  }

  const perimeter = await db.perimeter.findUnique({
    where: { id: perimeterId },
  });
  if (!perimeter) {
    return NextResponse.json(
      { error: "Périmètre introuvable" },
      { status: 404 },
    );
  }

  let workbook: XLSX.WorkBook;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return NextResponse.json(
      {
        error:
          "Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un fichier Excel (.xlsx).",
      },
      { status: 400 },
    );
  }

  const sheetNames = workbook.SheetNames.slice(0, MAX_SHEETS);
  const skippedForTooManySheets =
    workbook.SheetNames.length - sheetNames.length;

  const reports: SheetReport[] = [];

  for (const sheetName of sheetNames) {
    const report: SheetReport = {
      name: sheetName,
      status: "ok",
      modulesCreated: 0,
      rowErrors: [],
    };

    const detected = detectLevel(sheetName);
    if (!detected) {
      report.status = "skipped";
      report.reason =
        "Nom de feuille ignoré : doit commencer par B1, B2, B3, M1 ou M2 pour être importée.";
      reports.push(report);
      continue;
    }
    report.level = detected.level;
    report.specialty = detected.specialty;

    if (detected.specialty.length > SPECIALTY_MAX_LEN) {
      report.status = "error";
      report.reason = `Le nom de spécialité derivé du nom de feuille dépasse ${SPECIALTY_MAX_LEN} caractères.`;
      reports.push(report);
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      report.status = "error";
      report.reason = "Feuille illisible.";
      reports.push(report);
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
    });
    if (rows.length === 0) {
      report.status = "error";
      report.reason = "Feuille vide.";
      reports.push(report);
      continue;
    }

    const headerRow = rows[0] ?? [];
    const columns = detectColumns(headerRow);

    const missing: string[] = [];
    if (columns.matiere === undefined)
      missing.push('"Matière" / "Nom matière"');
    if (columns.description === undefined)
      missing.push('"Description" / "OBJECTIFS PEDAGOGIQUES"');
    if (columns.vh === undefined) missing.push('"VH" / "Volume Horaire"');

    if (missing.length > 0) {
      report.status = "error";
      report.reason = `Colonne(s) manquante(s) : ${missing.join(", ")}.`;
      reports.push(report);
      continue;
    }

    const dataRows = rows.slice(1, 1 + MAX_ROWS_PER_SHEET);
    const truncated = rows.length - 1 - dataRows.length;

    type ParsedModule = {
      name: string;
      description: string;
      workload: number;
      avecMentor: boolean;
      periode: string | null;
      vhFfp: number | null;
      vhTdp: number | null;
    };
    const parsedModules: ParsedModule[] = [];

    dataRows.forEach((row, idx) => {
      const rowNumber = idx + 2; // +1 for header, +1 for 1-based display
      if (!row || row.every((c) => cellToString(c) === "")) return;

      const name = cellToString(row[columns.matiere!]);
      if (!name) {
        report.rowErrors.push(
          `Ligne ${rowNumber} : nom de matière manquant, ligne ignorée.`,
        );
        return;
      }
      if (name.length > NAME_MAX_LEN) {
        report.rowErrors.push(
          `Ligne ${rowNumber} : nom de matière trop long (max ${NAME_MAX_LEN} caractères), ligne ignorée.`,
        );
        return;
      }

      const workload = parseWorkload(row[columns.vh!]);
      if (workload === null) {
        report.rowErrors.push(
          `Ligne ${rowNumber} ("${name}") : volume horaire manquant ou invalide, ligne ignorée.`,
        );
        return;
      }

      const description =
        columns.description !== undefined
          ? cellToString(row[columns.description])
          : "";
      const periodeRaw =
        columns.periode !== undefined ? cellToString(row[columns.periode]) : "";
      if (periodeRaw.length > PERIODE_MAX_LEN) {
        report.rowErrors.push(
          `Ligne ${rowNumber} ("${name}") : période trop longue (max ${PERIODE_MAX_LEN} caractères), ligne ignorée.`,
        );
        return;
      }

      parsedModules.push({
        name,
        description,
        workload,
        avecMentor:
          columns.mentor !== undefined
            ? parseMentor(row[columns.mentor])
            : false,
        periode: periodeRaw || null,
        vhFfp:
          columns.vhFfp !== undefined
            ? parseOptionalNumber(row[columns.vhFfp])
            : null,
        vhTdp:
          columns.vhTdp !== undefined
            ? parseOptionalNumber(row[columns.vhTdp])
            : null,
      });
    });

    if (truncated > 0) {
      report.rowErrors.push(
        `${truncated} ligne(s) supplementaire(s) ignorée(s) (limite de ${MAX_ROWS_PER_SHEET} lignes par feuille).`,
      );
    }

    if (parsedModules.length === 0) {
      report.status = "error";
      report.reason = "Aucune matière valide trouvée dans cette feuille.";
      reports.push(report);
      continue;
    }

    try {
      const result = await db.$transaction(async (tx) => {
        let promo = await tx.promos.findFirst({
          where: {
            perimeterId,
            level: detected.level,
            specialty: { equals: detected.specialty, mode: "insensitive" },
          },
        });
        const promoStatus: "created" | "reused" = promo ? "reused" : "created";
        promo ??= await tx.promos.create({
          data: {
            perimeterId,
            level: detected.level,
            specialty: detected.specialty,
          },
        });

        for (const mod of parsedModules) {
          const createdModule = await tx.modules.create({
            data: {
              perimeterId,
              name: mod.name,
              description: mod.description || null,
              periode: mod.periode,
              avecMentor: mod.avecMentor,
              nombreHeureFFP: mod.vhFfp,
              nombreHeureTDP: mod.vhTdp,
            },
          });
          await tx.promoModules.create({
            data: {
              moduleId: createdModule.id,
              promoId: promo.id,
              workload: mod.workload,
            },
          });
        }

        return { promoId: promo.id, promoStatus };
      });

      report.promoStatus = result.promoStatus;
      report.modulesCreated = parsedModules.length;
    } catch (error) {
      console.error(`Import error on sheet "${sheetName}":`, error);
      report.status = "error";
      report.reason =
        "Erreur lors de l'enregistrement en base pour cette feuille.";
      reports.push(report);
      continue;
    }

    reports.push(report);
  }

  const summary = {
    sheetsTotal: workbook.SheetNames.length,
    sheetsProcessed: reports.filter((r) => r.status === "ok").length,
    sheetsSkipped: reports.filter((r) => r.status === "skipped").length,
    sheetsErrored: reports.filter((r) => r.status === "error").length,
    modulesCreated: reports.reduce((sum, r) => sum + r.modulesCreated, 0),
    extraSheetsIgnored: skippedForTooManySheets,
  };

  return NextResponse.json({ success: true, summary, sheets: reports });
}
