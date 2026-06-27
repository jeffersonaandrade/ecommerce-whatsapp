import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BenefitForm } from '@/components/admin/benefit-form'
import { getDataProvider } from '@/lib/data/provider'

export const metadata: Metadata = {
  title: 'Novo benefício',
}

export default function NewBenefitPage() {
  if (getDataProvider() !== 'supabase') {
    redirect('/admin/content/benefits')
  }

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Novo benefício"
        subtitle="Crie um card de confiança para a home."
        back={{ href: '/admin/content/benefits', label: 'Benefícios' }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <BenefitForm mode="create" />
        </div>
      </div>
    </div>
  )
}
