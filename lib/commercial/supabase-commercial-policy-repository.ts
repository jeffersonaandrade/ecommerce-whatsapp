import 'server-only'

import {
  CommercialPolicy,
  CommercialPolicyInput,
  CommercialPolicyUpdateInput,
  CommercialProductPolicyOverride,
  CommercialProductPolicyOverrideInput,
} from '@/types/commercial-policy'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  commercialPolicyToRow,
  inputToCommercialPolicyRow,
  inputToProductPolicyOverrideRow,
  rowToCommercialPolicy,
  rowToProductPolicyOverride,
  type CommercialPolicyRow,
  type CommercialProductPolicyOverrideRow,
} from './commercial-policy-mapper'
import { CommercialPolicyRepository } from './commercial-policy-repository'
import { isPolicyStorefrontEligible } from './policy-eligibility'

function nowIso(): string {
  return new Date().toISOString()
}

function isMissingTable(message: string, table: string): boolean {
  return (
    message.includes(table) &&
    (message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('Could not find the table'))
  )
}

export const supabaseCommercialPolicyRepository: CommercialPolicyRepository = {
  async getAll(): Promise<CommercialPolicy[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('commercial_policies')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      if (isMissingTable(error.message, 'commercial_policies')) {
        console.warn(
          '[commercial_policies] read: tabela indisponível no PostgREST. Retornando [].'
        )
        return []
      }
      throw new Error(`commercial_policies read failed: ${error.message}`)
    }
    return (data as CommercialPolicyRow[]).map(rowToCommercialPolicy)
  },

  async getStorefrontEligible(
    channel: CommercialPolicy['channel']
  ): Promise<CommercialPolicy[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('commercial_policies')
      .select('*')
      .eq('enabled', true)
      .eq('channel', channel)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      if (isMissingTable(error.message, 'commercial_policies')) {
        console.warn(
          '[commercial_policies] storefront read: tabela indisponível. Retornando [].'
        )
        return []
      }
      throw new Error(`commercial_policies storefront read failed: ${error.message}`)
    }

    const now = new Date()
    return (data as CommercialPolicyRow[])
      .map(rowToCommercialPolicy)
      .filter((p) => isPolicyStorefrontEligible(p, now))
  },

  async getById(id: string): Promise<CommercialPolicy | undefined> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('commercial_policies')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      if (isMissingTable(error.message, 'commercial_policies')) return undefined
      throw new Error(`commercial_policies getById failed: ${error.message}`)
    }
    if (!data) return undefined
    return rowToCommercialPolicy(data as CommercialPolicyRow)
  },

  async create(input: CommercialPolicyInput): Promise<CommercialPolicy> {
    const supabase = createAdminClient()
    const now = nowIso()
    const id = crypto.randomUUID()
    const row = inputToCommercialPolicyRow(id, input, now)
    const { error } = await supabase.from('commercial_policies').insert(row)
    if (error) throw new Error(`commercial_policies create failed: ${error.message}`)
    return rowToCommercialPolicy(row)
  },

  async update(id: string, input: CommercialPolicyUpdateInput): Promise<CommercialPolicy> {
    const existing = await this.getById(id)
    if (!existing) throw new Error('Política comercial não encontrada')

    const merged: CommercialPolicy = {
      ...existing,
      ...input,
      conditions: input.conditions ?? existing.conditions,
      actions: input.actions ?? existing.actions,
      updatedAt: nowIso(),
    }

    const supabase = createAdminClient()
    const row = commercialPolicyToRow(merged)
    const { error } = await supabase.from('commercial_policies').update(row).eq('id', id)
    if (error) throw new Error(`commercial_policies update failed: ${error.message}`)
    return merged
  },

  async getOverridesForProducts(
    productIds: string[]
  ): Promise<CommercialProductPolicyOverride[]> {
    if (productIds.length === 0) return []

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('commercial_product_policy_overrides')
      .select('*')
      .in('product_id', productIds)

    if (error) {
      if (isMissingTable(error.message, 'commercial_product_policy_overrides')) {
        return []
      }
      throw new Error(
        `commercial_product_policy_overrides read failed: ${error.message}`
      )
    }

    return (data as CommercialProductPolicyOverrideRow[]).map(rowToProductPolicyOverride)
  },

  async createOverride(
    input: CommercialProductPolicyOverrideInput
  ): Promise<CommercialProductPolicyOverride> {
    const supabase = createAdminClient()
    const now = nowIso()
    const id = crypto.randomUUID()
    const row = inputToProductPolicyOverrideRow(id, input, now)
    const { error } = await supabase.from('commercial_product_policy_overrides').insert(row)
    if (error) {
      throw new Error(`commercial_product_policy_overrides create failed: ${error.message}`)
    }
    return rowToProductPolicyOverride(row)
  },

  async deleteOverride(id: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('commercial_product_policy_overrides')
      .delete()
      .eq('id', id)
    if (error) {
      throw new Error(`commercial_product_policy_overrides delete failed: ${error.message}`)
    }
  },
}
