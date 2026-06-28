import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Alert } from '@/components/ui/alert'
import { PromotionForm } from '@/components/admin/commercial/promotion-form'
import { getCommercialRuleById } from '@/lib/commercial/commercial-rules'

export const metadata: Metadata = {
  title: 'Editar promoção',
}

export default async function EditPromocaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const { id } = await params
  const { created } = await searchParams
  const rule = await getCommercialRuleById(id)
  if (!rule) notFound()

  return (
    <div className="w-full">
      <AdminPageHeader
        title={rule.name}
        subtitle="Edite a regra comercial e simule o resultado."
        back={{ href: '/admin/comercial/promocoes', label: 'Promoções' }}
      />
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        {created === '1' && (
          <Alert type="success" message="Promoção criada com sucesso." />
        )}
        <PromotionForm mode="edit" rule={rule} />
      </div>
    </div>
  )
}
