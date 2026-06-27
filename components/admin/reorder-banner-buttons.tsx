'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reorderBannerSlideAction } from '@/lib/banners/banner-actions'
import { AdminReorderButtons } from '@/components/admin/admin-reorder-buttons'

export function ReorderBannerButtons({ slideId }: { slideId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function reorder(dir: 'up' | 'down') {
    startTransition(async () => {
      await reorderBannerSlideAction(slideId, dir)
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
