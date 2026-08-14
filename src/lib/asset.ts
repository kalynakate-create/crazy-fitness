/**
 * Prefix a public asset path with the deployment's base path.
 *
 * Needed because of a real gap: with `output: export` and `images.unoptimized`,
 * next/image hands the `src` straight to the default loader, which does NOT
 * apply `basePath`. On a project Pages site served from /crazy-fitness/ that
 * turns every `/instagram/post-00.jpg` into a 404 — and only there, so it looks
 * perfect locally and on Vercel and breaks on the one deployment people were
 * sent to look at.
 *
 * On Vercel NEXT_PUBLIC_BASE_PATH is unset and this is the identity function.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!BASE) return path;
  if (!path.startsWith("/")) return path;
  if (path.startsWith(BASE + "/")) return path;
  return BASE + path;
}
