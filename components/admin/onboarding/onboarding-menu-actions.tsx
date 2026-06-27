'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getButtonClassName } from '@/components/ui/button'
import {
  resetDeploymentAction,
  restartTourAction,
} from '@/lib/admin/onboarding/actions'
import { useAdminOnboarding } from '@/hooks/use-admin-onboarding'

export function OnboardingMenuActions() {
  const router = useRouter()
  const { setState, openWelcomeModal } = useAdminOnboarding()
  const [confirmReset, setConfirmReset] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleRestartTour() {
    startTransition(async () => {
      const result = await restartTourAction()
      if (result.ok) {
        setState(result.state)
        openWelcomeModal()
        router.refresh()
      }
    })
  }

  function handleResetDeployment() {
    startTransition(async () => {
      const result = await resetDeploymentAction()
      if (result.ok) {
        setState(result.state)
        setConfirmReset(false)
        openWelcomeModal()
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleRestartTour}
        className={getButtonClassName('outline', 'sm', '!text-canvas !border-canvas/40 hover:!bg-canvas/10')}
      >
        Reiniciar tour
      </button>
      {!confirmReset ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirmReset(true)}
          className={getButtonClassName('outline', 'sm', '!text-canvas !border-canvas/40 hover:!bg-canvas/10')}
        >
          Resetar implantação
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-mute">Confirmar reset?</span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleResetDeployment}
            className={getButtonClassName('default', 'sm')}
          >
            Sim, resetar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmReset(false)}
            className={getButtonClassName('outline', 'sm', '!text-canvas !border-canvas/40')}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
