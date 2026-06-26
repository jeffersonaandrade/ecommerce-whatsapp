import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { BannerSlide, BannerSlideCreateInput, BannerSlideInput } from '@/types/banner-slide'
import { BannerRepository } from './banner-repository'
import { rowToSlide, slideInputToRow, BannerSlideRow } from './supabase-banner-mapper'
import { assertBannerDesktopPath } from './banner-validation'

const TABLE = 'banner_slides'

export const supabaseBannerRepository: BannerRepository = {
  async getAll(): Promise<BannerSlide[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as BannerSlideRow[]).map(rowToSlide)
  },

  async getActive(): Promise<BannerSlide[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as BannerSlideRow[]).map(rowToSlide)
  },

  async getById(id: string): Promise<BannerSlide | undefined> {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? rowToSlide(data as BannerSlideRow) : undefined
  },

  async create(input: BannerSlideCreateInput): Promise<BannerSlide> {
    assertBannerDesktopPath(input.desktopImagePath)
    const supabase = createAdminClient()
    const row = {
      ...(input.id ? { id: input.id } : {}),
      ...slideInputToRow(input),
      desktop_image_path: input.desktopImagePath.trim(),
    }
    const { data, error } = await supabase.from(TABLE).insert(row).select().single()
    if (error) throw new Error(error.message)
    return rowToSlide(data as BannerSlideRow)
  },

  async update(id: string, input: Partial<BannerSlideInput>): Promise<BannerSlide> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update(slideInputToRow(input))
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToSlide(data as BannerSlideRow)
  },

  async delete(id: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
