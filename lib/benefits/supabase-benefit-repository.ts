import 'server-only'

import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { BenefitItem, BenefitItemInput } from '@/types/benefit-item'
import { BenefitRepository } from './benefit-repository'
import { benefitInputToRow, BenefitItemRow, rowToBenefitItem } from './supabase-benefit-mapper'

const TABLE = 'benefit_items'

export const supabaseBenefitRepository: BenefitRepository = {
  async getAll(): Promise<BenefitItem[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as BenefitItemRow[]).map(rowToBenefitItem)
  },

  async getActive(): Promise<BenefitItem[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as BenefitItemRow[]).map(rowToBenefitItem)
  },

  async getById(id: string): Promise<BenefitItem | undefined> {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? rowToBenefitItem(data as BenefitItemRow) : undefined
  },

  async count(): Promise<number> {
    const supabase = createAdminClient()
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true })
    if (error) throw new Error(error.message)
    return count ?? 0
  },

  async create(input: BenefitItemInput): Promise<BenefitItem> {
    const supabase = createAdminClient()
    const row = {
      id: randomUUID(),
      ...benefitInputToRow(input),
      title: input.title.trim(),
      description: input.description.trim(),
      sort_order: input.sortOrder ?? 0,
      active: input.active ?? true,
    }
    const { data, error } = await supabase.from(TABLE).insert(row).select().single()
    if (error) throw new Error(error.message)
    return rowToBenefitItem(data as BenefitItemRow)
  },

  async update(id: string, input: Partial<BenefitItemInput>): Promise<BenefitItem> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update(benefitInputToRow(input))
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToBenefitItem(data as BenefitItemRow)
  },

  async delete(id: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
