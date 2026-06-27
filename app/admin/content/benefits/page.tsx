import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { AdminEmptyState } from '@/components/admin/admin-empty-state'
import { getButtonClassName } from '@/components/ui/button'
import { BenefitsSectionForm } from '@/components/admin/benefits-section-form'
import { ReorderBenefitButtons } from '@/components/admin/reorder-benefit-buttons'
import { ToggleBenefitActiveButton } from '@/components/admin/toggle-benefit-active-button'
import { getAllBenefitItems } from '@/lib/benefits'
import { MAX_BENEFIT_ITEMS } from '@/lib/benefits/constants'
import { getDataProvider } from '@/lib/data/provider'
import { getStoreSettings } from '@/lib/store/settings-repository'

export const metadata: Metadata = {
  title: 'Benefícios',
  description: 'Gerenciar cards de benefícios na home',
}

export default async function AdminBenefitsPage() {
  const isSupabase = getDataProvider() === 'supabase'

  if (!isSupabase) {
    return (
      <div className="w-full">
        <AdminPageHeader
          title="Benefícios"
          subtitle="Cards de benefícios exibidos na home."
          back={{ href: '/admin/content', label: 'Conteúdo' }}
        />

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-hairline bg-canvas px-6 py-8">
            <p className="text-sm text-mute">
              Disponível apenas com Supabase. Configure DATA_PROVIDER=supabase para editar benefícios.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const [settings, items] = await Promise.all([getStoreSettings(), getAllBenefitItems()])
  const canCreate = items.length < MAX_BENEFIT_ITEMS

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Benefícios"
        subtitle={`Até ${MAX_BENEFIT_ITEMS} cards na home. Se nenhum estiver ativo, usa o fallback padrão.`}
        back={{ href: '/admin/content', label: 'Conteúdo' }}
        actions={
          canCreate ? (
            <Link
              href="/admin/content/benefits/new"
              className={getButtonClassName('secondary', 'md', '!text-ink')}
            >
              + Novo benefício
            </Link>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <BenefitsSectionForm
          benefitsEyebrow={settings.benefitsEyebrow}
          benefitsTitle={settings.benefitsTitle}
        />

        {items.length === 0 ? (
          <AdminEmptyState
            message="Nenhum benefício cadastrado."
            action={
              canCreate
                ? { href: '/admin/content/benefits/new', label: 'Criar primeiro benefício' }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full text-sm">
              <thead className="bg-soft-cloud">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-mute">Título</th>
                  <th className="px-4 py-3 text-left font-medium text-mute">Descrição</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Ordem</th>
                  <th className="px-4 py-3 text-center font-medium text-mute">Ativo</th>
                  <th className="px-4 py-3 text-right font-medium text-mute">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline bg-canvas">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-soft-cloud/50">
                    <td className="px-4 py-3 font-medium text-ink">{item.title}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-mute">{item.description}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-8 text-center tabular-nums">{item.sortOrder}</span>
                        <ReorderBenefitButtons benefitId={item.id} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ToggleBenefitActiveButton benefitId={item.id} active={item.active} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/content/benefits/${item.id}`}
                        className="text-sm font-medium text-accent hover:underline"
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
