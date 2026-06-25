import { Metadata } from 'next'
import { StatusPage } from '@/components/layout/status-page'

export const metadata: Metadata = {
  title: 'Manutenção',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <StatusPage
      code="503"
      title="Estamos em manutenção"
      description="Voltamos em breve. Enquanto isso, você pode retornar mais tarde ou falar conosco pelo WhatsApp."
    />
  )
}
