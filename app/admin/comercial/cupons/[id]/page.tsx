import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CouponForm } from '@/components/admin/commercial/coupon-form'
import { getAllCategoriesAdmin } from '@/lib/categories'
import { getCommercialRuleById } from '@/lib/commercial/commercial-rules'

export const metadata: Metadata = {
  title: 'Editar cupom',
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditCupomPage({ params }: PageProps) {
  const { id } = await params
  const [rule, categories] = await Promise.all([
    getCommercialRuleById(id),
    getAllCategoriesAdmin(),
  ])

  if (!rule || rule.trigger !== 'manual') notFound()

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Editar cupom"
        subtitle={rule.code ?? ''}
        back={{ href: '/admin/comercial/cupons', label: 'Cupons' }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <CouponForm mode="edit" rule={rule} categories={categories} />
      </div>
    </div>
  )
}
