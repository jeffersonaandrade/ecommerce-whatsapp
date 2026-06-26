import { Metadata } from 'next'
import Link from 'next/link'
import { BenefitForm } from '@/components/admin/benefit-form'
import { getDataProvider } from '@/lib/data/provider'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Novo benefício',
}

export default function NewBenefitPage() {
  if (getDataProvider() !== 'supabase') {
    redirect('/admin/content/benefits')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/admin/content/benefits" className="text-sm text-mute hover:text-ink">
        ← Benefícios
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-ink">Novo benefício</h1>
      <div className="mt-8">
        <BenefitForm mode="create" />
      </div>
    </div>
  )
}
