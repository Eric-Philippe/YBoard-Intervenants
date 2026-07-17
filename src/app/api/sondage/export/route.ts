import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "~/server/jwt";
import { sanitizeCell } from "~/server/spreadsheet";
import { db } from "~/server/db";


function verifyToken(req: NextRequest): boolean {
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

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const perimeterSlug = searchParams.get("perimeter");
  const promoId = searchParams.get("promo") ?? undefined;

  if (!perimeterSlug) {
    return NextResponse.json(
      { error: "Paramètre 'perimeter' requis" },
      { status: 400 },
    );
  }

  const perimeter = await db.perimeter.findUnique({
    where: { slug: perimeterSlug },
  });
  if (!perimeter) {
    return NextResponse.json(
      { error: "Périmètre introuvable" },
      { status: 404 },
    );
  }

  const submissions = await db.surveySubmission.findMany({
    where: {
      perimeterId: perimeter.id,
      ...(promoId
        ? {
            responses: {
              some: {
                promoModules: { promoId },
                response: { in: ["oui", "peut_etre"] },
              },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      responses: {
        where: { response: { in: ["oui", "peut_etre"] } },
        include: {
          promoModules: {
            include: { module: true, promo: true },
          },
        },
      },
    },
  });

  const rows: string[][] = [
    [
      "ID",
      "Date d'enregistrement",
      "Origine",
      "Nom",
      "Prenom",
      "Email",
      "Telephone",
      "Niveau academique",
      "Autre niveau",
      "Intitule diplome",
      "Annees experience",
      "Domaines exercice",
      "Projets personnels",
      "Lien profil",
      "Remarques",
      "Choix final",
      "Reponses matieres",
    ],
  ];

  for (const s of submissions) {
    const responseParts = s.responses
      .filter((r) => (promoId ? r.promoModules?.promoId === promoId : true))
      .map((r) => {
        const cond = r.conditionText ? ` (${r.conditionText})` : "";
        const label = r.promoModules
          ? r.promoModules.module.name
          : (r.moduleLabelSnapshot ?? "Module supprime");
        return `${label}: ${r.response}${cond}`;
      });

    rows.push([
      s.id,
      s.createdAt.toISOString().replace("T", " ").substring(0, 19),
      s.origin ?? "",
      s.nom,
      s.prenom,
      s.email,
      s.telephone,
      s.niveauAcademique,
      s.niveauAcademiqueAutre ?? "",
      s.intituleDiplome,
      s.anneesExperience,
      s.domainesExercice,
      s.projetsPersonnels,
      s.lienProfil,
      s.remarques,
      s.finalChoice,
      responseParts.join(" | "),
    ]);
  }

  // Les réponses proviennent d'un formulaire public : tout champ est contrôlé
  // par un tiers. Le quoting CSV ne suffit pas, il faut aussi neutraliser les
  // formules, sinon une valeur comme `=cmd|...` s'exécute chez la personne qui
  // ouvre l'export.
  const csv = rows
    .map((row) =>
      row
        .map(
          (cell) =>
            `"${String(sanitizeCell(cell)).replace(/"/g, '""')}"`,
        )
        .join(","),
    )
    .join("\r\n");

  const date = new Date().toISOString().split("T")[0];
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export_${date}.csv"`,
    },
  });
}
