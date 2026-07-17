import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "~/server/jwt";

/**
 * Ce fichier doit rester dans `src/`, au même niveau que `app/`. Placé à la
 * racine du projet alors que l'application vit dans `src/`, Next ne le charge
 * pas et toutes les pages deviennent accessibles sans redirection.
 */

/** Le jeton est-il réellement valide, et pas seulement présent ? */
function hasValidSession(request: NextRequest): boolean {
  const token =
    request.cookies.get("token")?.value ??
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return false;

  try {
    jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    return true;
  } catch {
    // Jeton expiré, falsifié, ou signé avec un autre secret.
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // Le questionnaire de candidature est public, à l'exception de son
  // administration. Le `replace` neutralise un éventuel slash final, qui
  // laisserait autrement `/sondage/x/admin/` passer pour une page publique.
  const normalized = pathname.replace(/\/+$/, "");
  const isSurveyPublicPage =
    normalized === "/sondage" ||
    (normalized.startsWith("/sondage/") && !normalized.endsWith("/admin"));

  const isPublicPage = isAuthPage || isSurveyPublicPage;
  const authenticated = hasValidSession(request);

  // Page protégée sans session valide : on renvoie vers la connexion plutôt
  // que d'afficher une coquille vide dont les appels API échoueront en 401.
  if (!authenticated && !isPublicPage) {
    const loginUrl = new URL("/login", request.url);
    // Permet de revenir là où l'utilisateur voulait aller après connexion.
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Un jeton invalide ne sert à rien : on le purge pour éviter que
    // l'utilisateur reste bloqué avec un cookie périmé.
    if (request.cookies.has("token")) response.cookies.delete("token");
    return response;
  }

  if (authenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Le runtime Node est nécessaire pour vérifier la signature du jeton :
  // jsonwebtoken s'appuie sur le module crypto, absent du runtime Edge.
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, protégées individuellement côté serveur)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
