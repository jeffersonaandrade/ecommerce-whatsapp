import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/admin/content/benefits" className="text-sm text-mute hover:text-ink">
        ← Benefícios
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-ink">Editar benefício</h1>
      <div className="mt-8">
        <BenefitForm mode="edit" benefit={benefit} />
      </div>
    </div>
  )
}
