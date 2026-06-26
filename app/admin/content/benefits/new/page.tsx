import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
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
      <div className="bg-ink py-8 text-canvas sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/content/benefits"
            className="text-sm text-mute transition-colors hover:text-canvas"
          >
            ← Benefícios
          </Link>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Novo benefício</h1>
          <p className="mt-2 text-mute">
            Crie um card de confiança para a home.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <BenefitForm mode="create" />
        </div>
      </div>
    </div>
  )
}
