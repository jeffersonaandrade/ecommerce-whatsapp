import { getButtonClassName } from '@/components/ui/button'
import { getReferralWhatsAppUrl } from '@/lib/referral/referral-whatsapp'

export function ReferralPromptCard() {
  const whatsappUrl = getReferralWhatsAppUrl()
  if (!whatsappUrl) return null

  return (
    <section
      className="mb-10 rounded-lg border border-hairline bg-soft-cloud/50 p-6"
      data-testid="referral-prompt-card"
    >
      <h2 className="text-base font-semibold text-ink">
        Indique uma loja e ganhe uma comissão
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-mute">
        Conhece outra loja que poderia usar nossa plataforma? Se a sua indicação
        contratar a implantação e o pagamento for confirmado, você poderá receber
        uma comissão conforme as regras do programa.
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={getButtonClassName('outline', 'sm', 'mt-4')}
      >
        Indicar uma loja
      </a>
    </section>
  )
}
