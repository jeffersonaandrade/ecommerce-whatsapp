import { BannerSlide, BannerSlideInput } from '@/types/banner-slide'

export type BannerSlideRow = {
  id: string
  desktop_image_path: string | null
  mobile_image_path: string | null
  title: string | null
  subtitle: string | null
  cta_label: string | null
  cta_href: string | null
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export function rowToSlide(row: BannerSlideRow): BannerSlide {
  return {
    id: row.id,
    desktopImagePath: row.desktop_image_path,
    mobileImagePath: row.mobile_image_path ?? undefined,
    title: row.title ?? undefined,
    subtitle: row.subtitle ?? undefined,
    ctaLabel: row.cta_label ?? undefined,
    ctaHref: row.cta_href ?? undefined,
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function slideInputToRow(input: Partial<BannerSlideInput>): Partial<BannerSlideRow> {
  const row: Partial<BannerSlideRow> = {}
  if (input.desktopImagePath !== undefined) row.desktop_image_path = input.desktopImagePath
  if (input.mobileImagePath !== undefined) row.mobile_image_path = input.mobileImagePath ?? null
  if (input.title !== undefined) row.title = input.title ?? null
  if (input.subtitle !== undefined) row.subtitle = input.subtitle ?? null
  if (input.ctaLabel !== undefined) row.cta_label = input.ctaLabel ?? null
  if (input.ctaHref !== undefined) row.cta_href = input.ctaHref ?? null
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder
  if (input.active !== undefined) row.active = input.active
  return row
}
