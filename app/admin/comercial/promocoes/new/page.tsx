import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PromotionForm } from '@/components/admin/commercial/promotion-form'

export const metadata: Metadata = {
  title: 'Nova promoção',
}

export default function NewPromocaoPage() {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Nova promoção"
        subtitle="Desconto fixo por quantidade de produtos elegíveis."
        back={{ href: '/admin/comercial/promocoes', label: 'Promoções' }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <PromotionForm mode="create" />
      </div>
    </div>
  )
}
