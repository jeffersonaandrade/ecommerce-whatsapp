import 'server-only'

import {
  CommercialRule,
  CommercialRuleInput,
  CommercialRuleUpdateInput,
} from '@/types/commercial-rule'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  commercialRuleToRow,
  inputToCommercialRuleRow,
  rowToCommercialRule,
  type CommercialRuleRow,
} from './commercial-rule-mapper'
import { CommercialRuleRepository } from './commercial-rule-repository'
import { isRuleStorefrontEligible } from './rule-eligibility'

function nowIso(): string {
  return new Date().toISOString()
}

function isMissingCommercialRulesTable(message: string): boolean {
  return (
    message.includes('commercial_rules') &&
    (message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('Could not find the table'))
  )
}

export const supabaseCommercialRuleRepository: CommercialRuleRepository = {
  async getAll(): Promise<CommercialRule[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('commercial_rules')
      .select('*')
      .neq('status', 'archived')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      if (isMissingCommercialRulesTable(error.message)) {
        console.warn(
          '[commercial_rules] read: tabela indisponível no PostgREST. Retornando [].'
        )
        return []
      }
      throw new Error(`commercial_rules read failed: ${error.message}`)
    }
    return (data as CommercialRuleRow[]).map(rowToCommercialRule)
  },

  async getStorefrontEligible(): Promise<CommercialRule[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('commercial_rules')
      .select('*')
      .in('status', ['active', 'scheduled'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      if (isMissingCommercialRulesTable(error.message)) {
        console.warn(
          '[commercial_rules] storefront read: tabela indisponível no PostgREST. Retornando [].'
        )
        return []
      }
      throw new Error(`commercial_rules storefront read failed: ${error.message}`)
    }

    const now = new Date()
    return (data as CommercialRuleRow[])
      .map(rowToCommercialRule)
      .filter((r) => isRuleStorefrontEligible(r, now))
  },

  async getById(id: string): Promise<CommercialRule | undefined> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('commercial_rules')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      if (isMissingCommercialRulesTable(error.message)) return undefined
      throw new Error(`commercial_rules getById failed: ${error.message}`)
    }
    if (!data) return undefined
    return rowToCommercialRule(data as CommercialRuleRow)
  },

  async create(input: CommercialRuleInput): Promise<CommercialRule> {
    const supabase = createAdminClient()
    const now = nowIso()
    const id = crypto.randomUUID()
    const row = inputToCommercialRuleRow(id, input, now)
    const { error } = await supabase.from('commercial_rules').insert(row)
    if (error) throw new Error(`commercial_rules create failed: ${error.message}`)
    return rowToCommercialRule(row)
  },

  async update(id: string, input: CommercialRuleUpdateInput): Promise<CommercialRule> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Regra comercial não encontrada')

    const merged: CommercialRule = {
      ...existing,
      ...input,
      config: input.config ?? existing.config,
      conditions: input.conditions ?? existing.conditions,
      actions: input.actions ?? existing.actions,
      usageCount: input.usageCount ?? existing.usageCount,
      updatedAt: nowIso(),
    }

    const supabase = createAdminClient()
    const row = commercialRuleToRow(merged)
    const { error } = await supabase.from('commercial_rules').update(row).eq('id', id)
    if (error) throw new Error(`commercial_rules update failed: ${error.message}`)
    return merged
  },
}
