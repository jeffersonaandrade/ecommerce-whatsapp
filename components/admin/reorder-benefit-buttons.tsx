'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reorderBenefitItemAction } from '@/lib/benefits/benefit-actions'
import { AdminReorderButtons } from '@/components/admin/admin-reorder-buttons'

export function ReorderBenefitButtons({ benefitId }: { benefitId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function reorder(dir: 'up' | 'down') {
    startTransition(async () => {
      await reorderBenefitItemAction(benefitId, dir)
      router.refresh()
    })
  }

  return (
    <AdminReorderButtons
      disabled={isPending}
      onMoveUp={() => reorder('up')}
      onMoveDown={() => reorder('down')}
    />
  )
}
