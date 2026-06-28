import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { DemoAdminToolbar } from '@/components/admin/demo-admin-toolbar'
import { DeploymentCenterCard } from '@/components/admin/onboarding/deployment-center-card'
import { OnboardingMenuActions } from '@/components/admin/onboarding/onboarding-menu-actions'
import { getButtonClassName } from '@/components/ui/button'
import { fetchProductStatusCounts } from '@/lib/catalog/product-aggregates'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Painel de administração da loja',
}

function NavCard({
  href,
  emoji,
  title,
  description,
  buttonLabel,
  disabled,
}: {
  href?: string
  emoji: string
  title: string
  description: string
  buttonLabel: string
  disabled?: boolean
}) {
  const inner = (
    <div
      className={`bg-canvas border border-hairline rounded-lg p-6 text-center h-full ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-lg transition-shadow'
      }`}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-mute text-sm mb-4 min-h-10">{description}</p>
      <span
        className={getButtonClassName(
          'outline',
          'sm',
          `w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
        )}
      >
        {buttonLabel}
      </span>
    </div>
  )

  if (disabled || !href) return inner
  return <Link href={href}>{inner}</Link>
}

export default async function AdminPage() {
  const counts = await fetchProductStatusCounts()
  const totalProducts = counts.all
  const activeProducts = counts.active

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Gerencie sua loja esportiva"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <OnboardingMenuActions />
            <Link
              href="/"
              className="text-sm text-mute transition-colors hover:text-canvas"
            >
              ← Voltar ao site
            </Link>
            <DemoAdminToolbar />
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-canvas border border-hairline rounded-lg p-6">
            <div className="text-3xl font-bold text-ink mb-2">
              {totalProducts}
            </div>
            <p className="text-mute">Total de Produtos</p>
          </div>
          <div className="bg-canvas border border-hairline rounded-lg p-6">
            <div className="text-3xl font-bold text-accent mb-2">
              {activeProducts}
            </div>
            <p className="text-mute">Produtos Ativos</p>
          </div>
          <div className="bg-canvas border border-hairline rounded-lg p-6">
            <div className="text-3xl font-bold text-mute mb-2">0</div>
            <p className="text-mute">Pedidos (V2)</p>
          </div>
        </div>

        <DeploymentCenterCard />

        <section className="mb-10" data-onboarding="nav-produtos">
          <h2 className="text-sm font-semibold text-mute uppercase tracking-wide mb-4">
            Produtos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NavCard
              href="/admin/products"
              emoji="📋"
              title="Lista"
              description="Ver e gerenciar produtos do catálogo"
              buttonLabel="Ir para lista"
            />
            <NavCard
              href="/admin/products/new"
              emoji="➕"
              title="Novo Produto"
              description="Cadastro manual — Fase 4"
              buttonLabel="Criar produto"
            />
            <NavCard
              href="/admin/import"
              emoji="📥"
              title="Importar CSV"
              description="Carga em massa via planilha"
              buttonLabel="Importar"
            />
            <NavCard
              href="/admin/products/media"
              emoji="🖼️"
              title="Central de Mídia"
              description="Inventário e upload de imagens em lote"
              buttonLabel="Abrir central"
            />
          </div>
        </section>

        <section data-onboarding="nav-loja">
          <h2 className="text-sm font-semibold text-mute uppercase tracking-wide mb-4">
            Loja
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NavCard
              href="/admin/comercial"
              emoji="🏷️"
              title="Comercial"
              description="Promoções, personalização e regras"
              buttonLabel="Comercial"
            />
            <NavCard
              href="/admin/categories"
              emoji="📂"
              title="Categorias"
              description="Organização do catálogo — Fase 4"
              buttonLabel="Categorias"
            />
            <NavCard
              href="/admin/banners"
              emoji="🖼️"
              title="Banners"
              description="Slides do carrossel na home"
              buttonLabel="Banners"
            />
            <NavCard
              href="/admin/orders"
              emoji="📦"
              title="Pedidos"
              description="Placeholder até checkout online (V2)"
              buttonLabel="Ver pedidos"
            />
            <NavCard
              href="/admin/content"
              emoji="📝"
              title="Conteúdo"
              description="Benefícios e textos do template"
              buttonLabel="Conteúdo"
            />
            <NavCard
              href="/admin/settings"
              emoji="⚙️"
              title="Configurações"
              description="Finalização via WhatsApp e dados da loja"
              buttonLabel="Configurar"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
