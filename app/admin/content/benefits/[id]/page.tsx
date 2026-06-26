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
    <div className="w-full">
      <div className="bg-ink py-8 text-canvas sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/content/benefits"
            className="text-sm text-mute transition-colors hover:text-canvas"
          >
            ← Benefícios
          </Link>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Editar benefício</h1>
          <p className="mt-2 text-mute">
            Ajuste o texto e a exibição deste card da home.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <BenefitForm mode="edit" benefit={benefit} />
        </div>
      </div>
    </div>
  )
}
