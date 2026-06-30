/**
 * Incrementa usage_count de um cupom após confirmação de pedido/intenção.
 * NÃO chamar durante simulação de carrinho (resolveCommercialPricing).
 *
 * Fase 3: preparado para PurchaseIntent/checkout confirmado — wire quando existir pedido real.
 */
import 'server-only'

import { getCommercialRuleRepository } from './get-commercial-rule-repository'

export async function incrementCouponUsage(ruleId: string): Promise<void> {
  const repo = getCommercialRuleRepository()
  const rule = await repo.getById(ruleId)
  if (!rule || rule.trigger !== 'manual') return

  const nextCount = rule.usageCount + 1
  if (rule.usageLimit != null && nextCount > rule.usageLimit) {
    throw new Error('Limite de uso do cupom excedido.')
  }

  await repo.update(ruleId, { usageCount: nextCount })
}
