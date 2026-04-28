/**
 * Derive a short human-readable label from a company website or LinkedIn URL.
 * Used server-side for prompts; keep logic in sync with display fallbacks in the app.
 */
function humanizeSlug(segment) {
  if (!segment) return "";
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function deriveProspectCompanyLabel(urlString) {
  if (!urlString?.trim()) return "";
  try {
    const u = new URL(urlString.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("linkedin.com")) {
      const segs = u.pathname.split("/").filter(Boolean);
      if (segs[0] === "in" && segs[1]) {
        return humanizeSlug(segs[1]);
      }
      if (segs[0] === "company" && segs[1]) {
        return humanizeSlug(segs[1]);
      }
      if (segs[0] === "school" && segs[1]) {
        return humanizeSlug(segs[1]);
      }
      return "LinkedIn";
    }
    const parts = host.split(".");
    const base =
      parts.length >= 2 ? parts[parts.length - 2] : parts[0] || host;
    return humanizeSlug(base);
  } catch {
    return "";
  }
}
