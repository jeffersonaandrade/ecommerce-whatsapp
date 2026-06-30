import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminEmptyState } from '@/components/admin/admin-empty-state'
import { getButtonClassName } from '@/components/ui/button'
import { getAllCommercialRulesAdmin } from '@/lib/commercial/commercial-rules'
import { formatPrice } from '@/lib/formatters'
import {
  COMMERCIAL_RULE_STATUS_LABELS,
  commercialRuleStatusClass,
} from '@/lib/commercial/commercial-rule-labels'

export const metadata: Metadata = {
  title: 'Promoções',
  description: 'Gerenciar promoções comerciais',
}

export default async function AdminPromocoesPage() {
  const rules = (await getAllCommercialRulesAdmin()).filter(
    (r) => (r.trigger ?? 'auto') === 'auto'
  )

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Promoções"
        subtitle="Desconto fixo por grupo de produtos. Prioridade define qual regra vence."
        back={{ href: '/admin/comercial', label: 'Comercial' }}
        actions={
          <Link
            href="/admin/comercial/promocoes/new"
            className={getButtonClassName('secondary', 'md', '!text-ink')}
          >
            + Nova promoção
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {rules.length === 0 ? (
          <AdminEmptyState
            message="Nenhuma promoção cadastrada."
            action={{
              href: '/admin/comercial/promocoes/new',
              label: 'Criar primeira promoção',
            }}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full text-sm">
              <thead className="bg-soft-cloud">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-mute">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-mute">Regra</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Prioridade</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-mute">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline bg-canvas">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-soft-cloud/50">
                    <td className="px-4 py-3 font-medium text-ink">{rule.name}</td>
                    <td className="px-4 py-3 text-mute">
                      A cada {rule.config.requiredQuantity} →{' '}
                      {formatPrice(rule.config.discountAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">{rule.priority}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${commercialRuleStatusClass(rule.status)}`}
                      >
                        {COMMERCIAL_RULE_STATUS_LABELS[rule.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/comercial/promocoes/${rule.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
