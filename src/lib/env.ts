/**
 * True only in the GitHub Pages preview build.
 *
 * Pages has no server, so the API routes do not exist there. Rather than let a
 * visitor fill in three steps and hit a button that 404s, the forms check this
 * and say up front that submissions are not live in the preview. A demo that
 * quietly loses a real enquiry is worse than one that admits what it is.
 */
export const IS_STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";
