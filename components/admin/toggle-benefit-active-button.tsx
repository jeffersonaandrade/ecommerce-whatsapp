'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBenefitItemAction } from '@/lib/benefits/benefit-actions'
import { AdminToggleSwitch } from '@/components/admin/admin-toggle-switch'

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
    <AdminToggleSwitch
      active={active}
      disabled={isPending}
      onToggle={toggle}
      ariaLabel={active ? 'Desativar benefício' : 'Ativar benefício'}
    />
  )
}
