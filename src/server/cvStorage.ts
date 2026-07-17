import path from "path";

export const CV_DIR = path.join(process.cwd(), "uploads", "cv");

/** A stored CV is always named `<teacherId>_<timestamp>.pdf`. */
const CV_FILENAME = /^[A-Za-z0-9._-]+\.pdf$/;

/**
 * Resolve a client-supplied CV filename to an absolute path inside CV_DIR,
 * or null when it does not designate a PDF stored there.
 *
 * The name arrives straight from the URL, so it is treated as hostile: any
 * separator, any traversal such as "../../.env", and any non-PDF target is
 * rejected before it can reach the filesystem.
 */
export function resolveCvPath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename) return null;
  if (!CV_FILENAME.test(base)) return null;

  const resolved = path.resolve(CV_DIR, base);
  if (!resolved.startsWith(CV_DIR + path.sep)) return null;

  return resolved;
}
