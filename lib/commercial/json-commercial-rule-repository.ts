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

function load(): CommercialRule[] {
  if (!fs.existsSync(STORAGE_PATH)) return []
  try {
    return JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf-8')) as CommercialRule[]
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
    const rule: CommercialRule = {
      id: randomUUID(),
      kind: 'promotion',
      stackable: false,
      appliesTo: input.appliesTo ?? 'all_products',
      ...input,
      createdAt: now,
      updatedAt: now,
    }
    save([...rules, rule])
    return rule
  },

  async update(id: string, input: CommercialRuleUpdateInput): Promise<CommercialRule> {
    const rules = load()
    const index = rules.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('Regra comercial não encontrada')
    const updated: CommercialRule = {
      ...rules[index],
      ...input,
      config: input.config ?? rules[index].config,
      updatedAt: nowIso(),
    }
    const next = [...rules]
    next[index] = updated
    save(next)
    return updated
  },
}
