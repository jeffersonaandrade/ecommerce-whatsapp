import { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PolicyForm } from '@/components/admin/commercial/policy-form'

export const metadata: Metadata = {
  title: 'Nova política comercial',
}

export default function NewPoliticaPage() {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Nova política"
        subtitle="Desconto por canal e quantidade mínima."
        back={{ href: '/admin/comercial/politicas', label: 'Políticas' }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <PolicyForm mode="create" />
      </div>
    </div>
  )
}
