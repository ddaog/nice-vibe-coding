/** OAuth redirect용 사이트 URL. NEXT_PUBLIC_SITE_URL(https) 우선, 없으면 현재 origin */
export function getSiteOrigin(): string {
  if (
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
    process.env.NEXT_PUBLIC_SITE_URL.startsWith("https://")
  ) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
}
