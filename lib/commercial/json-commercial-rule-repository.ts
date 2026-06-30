import 'server-only'

import fs from 'fs'
import path from 'path';
import { randomUUID } from 'crypto'
import {
  CommercialRule,
  CommercialRuleInput,
  CommercialRuleUpdateInput,
} from '@/types/commercial-rule'
import { CommercialRuleRepository } from './commercial-rule-repository'
import { isRuleStorefrontEligible } from './rule-eligibility'

const STORAGE_PATH = path.join(process.cwd(), 'storage', 'commercial-rules.json')

const DEFAULT_CONFIG = { requiredQuantity: 3, discountAmount: 0 }

function normalizeRule(rule: CommercialRule): CommercialRule {
  return {
    ...rule,
    trigger: rule.trigger ?? 'auto',
    conditions: rule.conditions ?? {},
    actions: rule.actions ?? [],
    usageCount: rule.usageCount ?? 0,
    config: rule.config ?? DEFAULT_CONFIG,
    type: rule.type ?? 'quantity_discount',
  }
}

function load(): CommercialRule[] {
  if (!fs.existsSync(STORAGE_PATH)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf-8')) as CommercialRule[]
    return raw.map(normalizeRule)
  } catch {
    return []
  }
}

function save(rules: CommercialRule[]): void {
  fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true })
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(rules, null, 2), 'utf-8')
}

function nowIso(): string {
  return new Date().toISOString()
}

function sortRules(rules: CommercialRule[]): CommercialRule[] {
  return [...rules].sort(
    (a, b) =>
      b.priority - a.priority ||
      a.createdAt.localeCompare(b.createdAt)
  )
}

function buildRule(id: string, input: CommercialRuleInput, now: string): CommercialRule {
  return {
    id,
    kind: 'promotion',
    trigger: input.trigger ?? 'auto',
    code: input.code ?? null,
    name: input.name,
    type: input.type ?? 'quantity_discount',
    status: input.status,
    priority: input.priority,
    stackable: false,
    appliesTo: input.appliesTo ?? 'all_products',
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    config: input.config ?? DEFAULT_CONFIG,
    conditions: input.conditions ?? {},
    actions: input.actions ?? [],
    usageLimit: input.usageLimit ?? null,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export const jsonCommercialRuleRepository: CommercialRuleRepository = {
  async getAll(): Promise<CommercialRule[]> {
    return sortRules(load().filter((r) => r.status !== 'archived'))
  },

  async getStorefrontEligible(): Promise<CommercialRule[]> {
    const now = new Date()
    return sortRules(load().filter((r) => isRuleStorefrontEligible(r, now)))
  },

  async getById(id: string): Promise<CommercialRule | undefined> {
    return load().find((r) => r.id === id)
  },

  async create(input: CommercialRuleInput): Promise<CommercialRule> {
    const rules = load()
    const now = nowIso()
    const rule = buildRule(randomUUID(), input, now)
    save([...rules, rule])
    return rule
  },

  async update(id: string, input: CommercialRuleUpdateInput): Promise<CommercialRule> {
    const rules = load()
    const index = rules.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Regra comercial não encontrada')
    const updated: CommercialRule = normalizeRule({
      ...rules[index],
      ...input,
      config: input.config ?? rules[index].config,
      conditions: input.conditions ?? rules[index].conditions,
      actions: input.actions ?? rules[index].actions,
      usageCount: input.usageCount ?? rules[index].usageCount,
      updatedAt: nowIso(),
    })
    const next = [...rules]
    next[index] = updated
    save(next)
    return updated
  },
}
