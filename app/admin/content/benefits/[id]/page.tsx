import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { BenefitForm } from '@/components/admin/benefit-form'
import { getBenefitItemById } from '@/lib/benefits'
import { getDataProvider } from '@/lib/data/provider'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const item = await getBenefitItemById(id)
  return { title: item ? `Editar: ${item.title}` : 'Benefício' }
}

export default async function EditBenefitPage({ params }: PageProps) {
  if (getDataProvider() !== 'supabase') {
    redirect('/admin/content/benefits')
  }

  const { id } = await params
  const benefit = await getBenefitItemById(id)
  if (!benefit) notFound()

  return (
    <div className="w-full">
      <AdminPageHeader
        title="Editar benefício"
        subtitle="Ajuste o texto e a exibição deste card da home."
        back={{ href: '/admin/content/benefits', label: 'Benefícios' }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <BenefitForm mode="edit" benefit={benefit} />
        </div>
      </div>
    </div>
  )
}
