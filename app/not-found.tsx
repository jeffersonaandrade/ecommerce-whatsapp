import { StatusPage } from '@/components/layout/status-page'

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Página não encontrada"
      description="O endereço que você acessou não existe ou foi movido. Volte ao início ou explore o catálogo."
    />
  )
}
