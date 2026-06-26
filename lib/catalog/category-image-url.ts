export function categoryImageUrl(categoryId: string, updatedAt: string): string {
  return `/api/branding/categories/${categoryId}.webp?v=${encodeURIComponent(updatedAt)}`
}
