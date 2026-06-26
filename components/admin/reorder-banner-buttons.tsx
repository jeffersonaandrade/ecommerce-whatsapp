'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reorderBannerSlideAction } from '@/lib/banners/banner-actions'

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
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => reorder('up')}
        aria-label="Mover para cima"
        className="rounded px-1 text-mute hover:text-ink disabled:opacity-40"
      >
        ▲
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => reorder('down')}
        aria-label="Mover para baixo"
        className="rounded px-1 text-mute hover:text-ink disabled:opacity-40"
      >
        ▼
      </button>
    </div>
  )
}
