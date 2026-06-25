export function brandingAssetUrl(filename: string | null | undefined): string | null {
  if (!filename) return null
  return `/api/branding/${encodeURIComponent(filename)}`
}
