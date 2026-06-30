import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Alert } from '@/components/ui/alert'
import { PolicyForm } from '@/components/admin/commercial/policy-form'
import { getCommercialPolicyById } from '@/lib/commercial/commercial-policies'

export const metadata: Metadata = {
  title: 'Editar política comercial',
}

export default async function EditPoliticaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const { id } = await params
  const { created } = await searchParams
  const policy = await getCommercialPolicyById(id)
  if (!policy) notFound()

  return (
    <div className="w-full">
      <AdminPageHeader
        title={policy.name}
        subtitle="Edite a política de canal e desconto."
        back={{ href: '/admin/comercial/politicas', label: 'Políticas' }}
      />
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        {created === '1' && (
          <Alert type="success" message="Política criada com sucesso." />
        )}
        <PolicyForm mode="edit" policy={policy} />
      </div>
    </div>
  )
}
