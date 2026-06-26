'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBenefitItemAction } from '@/lib/benefits/benefit-actions'

export function ToggleBenefitActiveButton({
  benefitId,
  active,
}: {
  benefitId: string
  active: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await updateBenefitItemAction(benefitId, { active: !active })
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={toggle}
      aria-label={active ? 'Desativar benefício' : 'Ativar benefício'}
      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-40 ${
        active ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-6' : ''
        }`}
      />
    </button>
  )
}
