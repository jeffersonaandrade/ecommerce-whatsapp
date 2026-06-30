import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminEmptyState } from '@/components/admin/admin-empty-state'
import { getButtonClassName } from '@/components/ui/button'
import { getAllCommercialPoliciesAdmin } from '@/lib/commercial/commercial-policies'
import {
  formatPolicySummary,
  POLICY_CHANNEL_LABELS,
  policyChannelClass,
} from '@/lib/commercial/commercial-policy-labels'

export const metadata: Metadata = {
  title: 'Políticas comerciais',
  description: 'Políticas de canal (varejo, atacado, distribuidor)',
}

function getPrimaryAction(policy: Awaited<ReturnType<typeof getAllCommercialPoliciesAdmin>>[0]) {
  const percent = policy.actions.find((a) => a.type === 'discount_percent')
  if (percent?.value) return { type: 'discount_percent' as const, value: percent.value }
  const fixed = policy.actions.find((a) => a.type === 'discount_fixed')
  if (fixed?.value) return { type: 'discount_fixed' as const, value: fixed.value }
  return { type: 'discount_percent' as const, value: 0 }
}

export default async function AdminPoliticasPage() {
  const policies = await getAllCommercialPoliciesAdmin()

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Políticas comerciais"
        subtitle="Descontos por canal e quantidade. A vitrine V1 usa canal varejo."
        back={{ href: '/admin/comercial', label: 'Comercial' }}
        actions={
          <Link
            href="/admin/comercial/politicas/new"
            className={getButtonClassName('secondary', 'md', '!text-ink')}
          >
            + Nova política
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {policies.length === 0 ? (
          <AdminEmptyState
            message="Nenhuma política cadastrada."
            action={{
              href: '/admin/comercial/politicas/new',
              label: 'Criar primeira política',
            }}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full text-sm">
              <thead className="bg-soft-cloud">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-mute">Nome</th>
                  <th className="px-4 py-3 text-left font-medium text-mute">Canal</th>
                  <th className="px-4 py-3 text-left font-medium text-mute">Regra</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Prioridade</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-mute">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline bg-canvas">
                {policies.map((policy) => {
                  const action = getPrimaryAction(policy)
                  return (
                    <tr key={policy.id} className="hover:bg-soft-cloud/50">
                      <td className="px-4 py-3 font-medium text-ink">{policy.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${policyChannelClass(policy.channel)}`}
                        >
                          {POLICY_CHANNEL_LABELS[policy.channel]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-mute">
                        {formatPolicySummary(
                          policy.conditions.minQty,
                          action.type,
                          action.value
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{policy.priority}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            policy.enabled
                              ? 'bg-green-50 text-green-800'
                              : 'bg-soft-cloud text-mute'
                          }`}
                        >
                          {policy.enabled ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/comercial/politicas/${policy.id}`}
                          className="font-medium text-ink hover:underline"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
