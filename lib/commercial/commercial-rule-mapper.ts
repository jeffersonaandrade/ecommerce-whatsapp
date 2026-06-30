import {
  CommercialAction,
  CommercialRule,
  CommercialRuleConditions,
  CommercialRuleConfig,
  CommercialRuleInput,
  CommercialRuleStatus,
  CommercialRuleTrigger,
  CommercialRuleType,
} from '@/types/commercial-rule'

export type CommercialRuleRow = {
  id: string
  kind: string
  name: string
  trigger: string
  code: string | null
  type: string
  status: string
  priority: number
  stackable: boolean
  applies_to: string
  config: CommercialRuleConfig
  conditions: CommercialRuleConditions
  actions: CommercialAction[]
  usage_limit: number | null
  usage_count: number
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

const DEFAULT_CONFIG: CommercialRuleConfig = {
  requiredQuantity: 3,
  discountAmount: 0,
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

function parseTrigger(value: string | null | undefined): CommercialRuleTrigger {
  return value === 'manual' ? 'manual' : 'auto'
}

function parseConditions(value: unknown): CommercialRuleConditions {
  const raw = value as CommercialRuleConditions | null | undefined
  return {
    minSubtotal: raw?.minSubtotal,
    minQty: raw?.minQty,
    categoryIds: Array.isArray(raw?.categoryIds) ? raw.categoryIds : undefined,
    productIds: Array.isArray(raw?.productIds) ? raw.productIds : undefined,
  }
}

function parseActions(value: unknown): CommercialAction[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (a): a is CommercialAction =>
      a != null &&
      typeof a === 'object' &&
      (a.type === 'discount_percent' || a.type === 'discount_fixed') &&
      typeof a.value === 'number'
  )
}

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase()
}

export function rowToCommercialRule(row: CommercialRuleRow): CommercialRule {
  return {
    id: row.id,
    kind: 'promotion',
    name: row.name,
    trigger: parseTrigger(row.trigger),
    code: row.code,
    type: parseType(row.type),
    status: parseStatus(row.status),
    priority: row.priority,
    stackable: false,
    appliesTo: 'all_products',
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    config: row.config ?? DEFAULT_CONFIG,
    conditions: parseConditions(row.conditions),
    actions: parseActions(row.actions),
    usageLimit: row.usage_limit,
    usageCount: row.usage_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function commercialRuleToRow(
  rule: CommercialRule | (CommercialRuleInput & { id: string; createdAt: string; updatedAt: string; usageCount?: number })
): CommercialRuleRow {
  return {
    id: rule.id,
    kind: 'promotion',
    name: rule.name,
    trigger: rule.trigger ?? 'auto',
    code: rule.code ?? null,
    type: rule.type ?? 'quantity_discount',
    status: rule.status,
    priority: rule.priority,
    stackable: false,
    applies_to: rule.appliesTo ?? 'all_products',
    config: rule.config ?? DEFAULT_CONFIG,
    conditions: rule.conditions ?? {},
    actions: rule.actions ?? [],
    usage_limit: rule.usageLimit ?? null,
    usage_count: 'usageCount' in rule && rule.usageCount != null ? rule.usageCount : 0,
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
  const trigger = input.trigger ?? 'auto'
  return {
    id,
    kind: 'promotion',
    name: input.name,
    trigger,
    code: trigger === 'manual' ? normalizeCouponCode(input.code ?? '') : null,
    type: input.type ?? 'quantity_discount',
    status: input.status,
    priority: input.priority,
    stackable: false,
    applies_to: input.appliesTo ?? 'all_products',
    config: input.config ?? DEFAULT_CONFIG,
    conditions: input.conditions ?? {},
    actions: input.actions ?? [],
    usage_limit: input.usageLimit ?? null,
    usage_count: 0,
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null,
    created_at: now,
    updated_at: now,
  }
}
