import { Metadata } from 'next'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { getButtonClassName } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Cupons',
}

export default function AdminCuponsPage() {
  return (
    <div className="w-full">
      <AdminPageHeader
        title="Cupons"
        subtitle="Em breve."
        back={{ href: '/admin/comercial', label: 'Comercial' }}
      />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-mute">Módulo previsto para uma próxima fase.</p>
        <Link
          href="/admin/comercial"
          className={`mt-6 inline-flex ${getButtonClassName('outline', 'md')}`}
        >
          Voltar ao Comercial
        </Link>
      </div>
    </div>
  )
}
