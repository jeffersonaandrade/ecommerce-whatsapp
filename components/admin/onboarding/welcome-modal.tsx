'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { getButtonClassName } from '@/components/ui/button'
import type { AdminOnboardingState } from '@/types/admin-onboarding'
import {
  skipOnboardingAction,
  startOnboardingAction,
} from '@/lib/admin/onboarding/actions'

type WelcomeModalProps = {
  open: boolean
  storeMature: boolean
  onStateChange: (state: AdminOnboardingState) => void
  onClose: () => void
}

export function WelcomeModal({
  open,
  storeMature,
  onStateChange,
  onClose,
}: WelcomeModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!open) return null

  function handleSkip() {
    startTransition(async () => {
      const result = await skipOnboardingAction()
      if (result.ok) {
        onStateChange(result.state)
        onClose()
        router.refresh()
      }
    })
  }

  function handleStart() {
    startTransition(async () => {
      const result = await startOnboardingAction()
      if (result.ok) {
        onStateChange(result.state)
        onClose()
        router.refresh()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="presentation"
      onClick={handleSkip}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-onboarding-title"
        className="w-full max-w-md rounded-xl border border-hairline bg-canvas p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="welcome-onboarding-title" className="text-xl font-semibold text-ink">
          {storeMature ? 'Loja parcialmente configurada' : 'Sua loja está quase pronta.'}
        </h2>
        <p className="mt-3 text-sm text-mute">
          {storeMature
            ? 'Deseja continuar a implantação e revisar os próximos passos?'
            : 'Vamos concluir a implantação em poucos minutos para que você possa começar a vender.'}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSkip}
            className={getButtonClassName('outline', 'sm')}
          >
            Pular por enquanto
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleStart}
            className={getButtonClassName('default', 'sm')}
          >
            Começar implantação
          </button>
        </div>
      </div>
    </div>
  )
}
