import { Metadata } from 'next'
import Link from 'next/link'
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
        <div className="bg-ink py-8 text-canvas sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/admin/content"
              className="text-sm text-mute transition-colors hover:text-canvas"
            >
              ← Conteúdo
            </Link>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Benefícios</h1>
            <p className="mt-2 text-mute">Cards de benefícios exibidos na home.</p>
          </div>
        </div>

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
      <div className="bg-ink py-8 text-canvas sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/content"
            className="text-sm text-mute transition-colors hover:text-canvas"
          >
            ← Conteúdo
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">Benefícios</h1>
              <p className="mt-2 text-mute">
                Até {MAX_BENEFIT_ITEMS} cards na home. Se nenhum estiver ativo, usa o fallback padrão.
              </p>
            </div>
            {canCreate && (
              <Link
                href="/admin/content/benefits/new"
                className={getButtonClassName('secondary', 'md', '!text-ink')}
              >
                + Novo benefício
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <BenefitsSectionForm
          benefitsEyebrow={settings.benefitsEyebrow}
          benefitsTitle={settings.benefitsTitle}
        />

        {items.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-canvas px-6 py-12 text-center">
            <p className="text-mute">Nenhum benefício cadastrado.</p>
            {canCreate && (
              <Link
                href="/admin/content/benefits/new"
                className={getButtonClassName('default', 'sm', 'mt-4 inline-flex')}
              >
                Criar primeiro benefício
              </Link>
            )}
          </div>
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
