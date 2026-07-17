/**
 * Neutralise l'injection de formules ("CSV injection") dans un export.
 *
 * Excel et LibreOffice interprètent toute cellule commençant par =, +, - ou @
 * comme une formule. Comme les noms d'enseignants, de modules et de périmètres
 * proviennent de saisies utilisateur, une valeur telle que
 * `=cmd|'/c calc'!A1` s'exécuterait à l'ouverture du fichier chez le
 * destinataire. On préfixe donc ces valeurs d'une apostrophe, qui force le
 * tableur à les traiter comme du texte.
 */
export function sanitizeCell<T>(value: T): T | string {
  if (typeof value !== "string" || value.length === 0) return value;
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}
