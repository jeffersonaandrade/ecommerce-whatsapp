import {
  CommercialRule,
  CommercialRuleConfig,
  CommercialRuleInput,
  CommercialRuleStatus,
  CommercialRuleType,
} from '@/types/commercial-rule'

export type CommercialRuleRow = {
  id: string
  kind: string
  name: string
  type: string
  status: string
  priority: number
  stackable: boolean
  applies_to: string
  config: CommercialRuleConfig
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

function parseStatus(value: string): CommercialRuleStatus {
  const allowed: CommercialRuleStatus[] = [
    'draft',
    'scheduled',
    'active',
    'expired',
    'archived',
  ]
  return allowed.includes(value as CommercialRuleStatus)
    ? (value as CommercialRuleStatus)
    : 'draft'
}

function parseType(value: string): CommercialRuleType {
  return value === 'quantity_discount' ? 'quantity_discount' : 'quantity_discount'
}

export function rowToCommercialRule(row: CommercialRuleRow): CommercialRule {
  return {
    id: row.id,
    kind: 'promotion',
    name: row.name,
    type: parseType(row.type),
    status: parseStatus(row.status),
    priority: row.priority,
    stackable: false,
    appliesTo: 'all_products',
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    config: row.config,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function commercialRuleToRow(
  rule: CommercialRule | (CommercialRuleInput & { id: string; createdAt: string; updatedAt: string })
): CommercialRuleRow {
  return {
    id: rule.id,
    kind: 'promotion',
    name: rule.name,
    type: rule.type,
    status: rule.status,
    priority: rule.priority,
    stackable: false,
    applies_to: rule.appliesTo ?? 'all_products',
    config: rule.config,
    starts_at: rule.startsAt ?? null,
    ends_at: rule.endsAt ?? null,
    created_at: rule.createdAt,
    updated_at: rule.updatedAt,
  }
}

export function inputToCommercialRuleRow(
  id: string,
  input: CommercialRuleInput,
  now: string
): CommercialRuleRow {
  return {
    id,
    kind: 'promotion',
    name: input.name,
    type: input.type,
    status: input.status,
    priority: input.priority,
    stackable: false,
    applies_to: input.appliesTo ?? 'all_products',
    config: input.config,
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null,
    created_at: now,
    updated_at: now,
  }
}
