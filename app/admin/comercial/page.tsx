import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getButtonClassName } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Comercial',
  description: 'Promoções, personalização e regras comerciais',
}

function HubCard({
  href,
  title,
  description,
  badge,
}: {
  href: string
  title: string
  description: string
  badge?: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-hairline bg-canvas p-6 transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {badge && (
          <span className="rounded-full bg-soft-cloud px-2 py-0.5 text-xs font-medium text-mute">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-mute">{description}</p>
    </Link>
  )
}

export default function AdminComercialPage() {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Comercial"
        subtitle="Promoções, personalização e futuras regras comerciais."
        back={{ href: '/admin', label: 'Voltar ao Admin' }}
      />

      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:px-8">
        <HubCard
          href="/admin/comercial/promocoes"
          title="Promoções"
          description="Desconto fixo por quantidade de produtos no carrinho."
        />
        <HubCard
          href="/admin/comercial/politicas"
          title="Políticas comerciais"
          description="Descontos por canal (varejo, atacado) e quantidade mínima."
        />
        <HubCard
          href="/admin/comercial/personalizacao"
          title="Personalização"
          description="Preço padrão e limites para nome, número e observação."
        />
        <HubCard
          href="/admin/comercial/cupons"
          title="Cupons"
          description="Códigos manuais com desconto percentual ou fixo."
        />
        <HubCard
          href="/admin/comercial/frete"
          title="Frete"
          description="Em breve."
          badge="Em breve"
        />
        <HubCard
          href="/admin/comercial/campanhas"
          title="Campanhas"
          description="Em breve."
          badge="Em breve"
        />
      </div>
    </div>
  )
}
