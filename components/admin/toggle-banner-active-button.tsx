'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBannerSlideAction } from '@/lib/banners/banner-actions'
import { AdminToggleSwitch } from '@/components/admin/admin-toggle-switch'

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
    <AdminToggleSwitch
      active={active}
      disabled={isPending}
      onToggle={toggle}
      ariaLabel={active ? 'Desativar slide' : 'Ativar slide'}
    />
  )
}
