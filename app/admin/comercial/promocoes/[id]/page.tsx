import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PromotionForm } from '@/components/admin/commercial/promotion-form'
import { getCommercialRuleById } from '@/lib/commercial/commercial-rules'

export const metadata: Metadata = {
  title: 'Editar promoção',
}

export default async function EditPromocaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const rule = await getCommercialRuleById(id)
  if (!rule) notFound()

  return (
    <div className="w-full">
      <AdminPageHeader
        title={rule.name}
        subtitle="Edite a regra comercial e simule o resultado."
        back={{ href: '/admin/comercial/promocoes', label: 'Promoções' }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <PromotionForm mode="edit" rule={rule} />
      </div>
    </div>
  )
}
