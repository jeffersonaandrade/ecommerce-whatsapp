import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { CouponForm } from '@/components/admin/commercial/coupon-form'
import { getAllCategoriesAdmin } from '@/lib/categories'

export const metadata: Metadata = {
  title: 'Novo cupom',
}

export default async function NewCupomPage() {
  const categories = await getAllCategoriesAdmin()

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Novo cupom"
        subtitle="Cupom manual com código único. Aplica após promoções automáticas."
        back={{ href: '/admin/comercial/cupons', label: 'Cupons' }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <CouponForm mode="create" categories={categories} />
      </div>
    </div>
  )
}
