'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBannerSlideAction } from '@/lib/banners/banner-actions'

export function ToggleBannerActiveButton({
  slideId,
  active,
}: {
  slideId: string
  active: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await updateBannerSlideAction(slideId, { active: !active })
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={toggle}
      aria-label={active ? 'Desativar slide' : 'Ativar slide'}
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
