import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";

const JWT_SECRET = process.env.JWT_SECRET ?? "your-secret-key";

function verifyToken(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
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
  const categorySlug = searchParams.get("category") ?? undefined;

  const submissions = await db.surveySubmission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subjectResponses: {
        where: { response: { in: ["oui", "peut_etre"] } },
        include: {
          subject: {
            include: { category: true },
          },
        },
        orderBy: [
          { subject: { category: { sortOrder: "asc" } } },
          { subject: { sortOrder: "asc" } },
        ],
      },
    },
    where: categorySlug
      ? {
          subjectResponses: {
            some: {
              subject: { category: { slug: categorySlug } },
              response: { in: ["oui", "peut_etre"] },
            },
          },
        }
      : undefined,
  });

  const rows: string[][] = [
    [
      "ID",
      "Date d'enregistrement",
      "Origine",
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Niveau académique",
      "Autre niveau",
      "Intitulé diplôme",
      "Années expérience",
      "Domaines exercice",
      "Projets personnels",
      "Lien profil",
      "Remarques",
      "Choix final",
      "Réponses matières",
    ],
  ];

  for (const s of submissions) {
    const responseParts = s.subjectResponses
      .filter((r) => {
        if (!categorySlug) return true;
        return r.subject.category.slug === categorySlug;
      })
      .map((r) => {
        const cond = r.conditionText ? ` (${r.conditionText})` : "";
        return `${r.subject.title}: ${r.response}${cond}`;
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

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
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
