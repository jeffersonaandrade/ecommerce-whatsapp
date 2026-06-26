import { BenefitItem, BenefitItemInput } from '@/types/benefit-item'

export type BenefitItemRow = {
  id: string
  title: string
  description: string
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export function rowToBenefitItem(row: BenefitItemRow): BenefitItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function benefitInputToRow(
  input: Partial<BenefitItemInput>
): Partial<BenefitItemRow> {
  const row: Partial<BenefitItemRow> = {}
  if (input.title !== undefined) row.title = input.title.trim()
  if (input.description !== undefined) row.description = input.description.trim()
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder
  if (input.active !== undefined) row.active = input.active
  return row
}
