import 'server-only'

import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import {
  CommercialPolicy,
  CommercialPolicyInput,
  CommercialPolicyUpdateInput,
  CommercialProductPolicyOverride,
  CommercialProductPolicyOverrideInput,
} from '@/types/commercial-policy'
import { CommercialPolicyRepository } from './commercial-policy-repository'
import { isPolicyStorefrontEligible } from './policy-eligibility'

const POLICIES_PATH = path.join(process.cwd(), 'storage', 'commercial-policies.json')
const OVERRIDES_PATH = path.join(
  process.cwd(),
  'storage',
  'commercial-policy-overrides.json'
)

function loadPolicies(): CommercialPolicy[] {
  if (!fs.existsSync(POLICIES_PATH)) return []
  try {
    return JSON.parse(fs.readFileSync(POLICIES_PATH, 'utf-8')) as CommercialPolicy[]
  } catch {
    return []
  }
}

function savePolicies(policies: CommercialPolicy[]): void {
  fs.mkdirSync(path.dirname(POLICIES_PATH), { recursive: true })
  fs.writeFileSync(POLICIES_PATH, JSON.stringify(policies, null, 2), 'utf-8')
}

function loadOverrides(): CommercialProductPolicyOverride[] {
  if (!fs.existsSync(OVERRIDES_PATH)) return []
  try {
    return JSON.parse(
      fs.readFileSync(OVERRIDES_PATH, 'utf-8')
    ) as CommercialProductPolicyOverride[]
  } catch {
    return []
  }
}

function saveOverrides(overrides: CommercialProductPolicyOverride[]): void {
  fs.mkdirSync(path.dirname(OVERRIDES_PATH), { recursive: true })
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2), 'utf-8')
}

function nowIso(): string {
  return new Date().toISOString()
}

function sortPolicies(policies: CommercialPolicy[]): CommercialPolicy[] {
  return [...policies].sort(
    (a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt)
  )
}

export const jsonCommercialPolicyRepository: CommercialPolicyRepository = {
  async getAll(): Promise<CommercialPolicy[]> {
    return sortPolicies(loadPolicies())
  },

  async getStorefrontEligible(
    channel: CommercialPolicy['channel']
  ): Promise<CommercialPolicy[]> {
    const now = new Date()
    return sortPolicies(
      loadPolicies().filter(
        (p) => p.channel === channel && isPolicyStorefrontEligible(p, now)
      )
    )
  },

  async getById(id: string): Promise<CommercialPolicy | undefined> {
    return loadPolicies().find((p) => p.id === id)
  },

  async create(input: CommercialPolicyInput): Promise<CommercialPolicy> {
    const policies = loadPolicies()
    const now = nowIso()
    const policy: CommercialPolicy = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }
    savePolicies([...policies, policy])
    return policy
  },

  async update(id: string, input: CommercialPolicyUpdateInput): Promise<CommercialPolicy> {
    const policies = loadPolicies()
    const index = policies.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Política comercial não encontrada')
    const updated: CommercialPolicy = {
      ...policies[index],
      ...input,
      conditions: input.conditions ?? policies[index].conditions,
      actions: input.actions ?? policies[index].actions,
      updatedAt: nowIso(),
    }
    const next = [...policies]
    next[index] = updated
    savePolicies(next)
    return updated
  },

  async getOverridesForProducts(
    productIds: string[]
  ): Promise<CommercialProductPolicyOverride[]> {
    const ids = new Set(productIds)
    return loadOverrides().filter((o) => ids.has(o.productId))
  },

  async createOverride(
    input: CommercialProductPolicyOverrideInput
  ): Promise<CommercialProductPolicyOverride> {
    const overrides = loadOverrides()
    const now = nowIso()
    const override: CommercialProductPolicyOverride = {
      id: randomUUID(),
      productId: input.productId,
      policyId: input.policyId,
      conditions: input.conditions ?? {},
      actions: input.actions,
      createdAt: now,
      updatedAt: now,
    }
    saveOverrides([...overrides, override])
    return override
  },

  async deleteOverride(id: string): Promise<void> {
    saveOverrides(loadOverrides().filter((o) => o.id !== id))
  },
}
