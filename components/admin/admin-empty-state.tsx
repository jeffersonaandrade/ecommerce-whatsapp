import Link from 'next/link'
import React from 'react'
import { getButtonClassName } from '@/components/ui/button'

type AdminEmptyStateProps = {
  message: string
  action?: {
    href: string
    label: string
    variant?: 'default' | 'secondary'
  }
  children?: React.ReactNode
}

export function AdminEmptyState({ message, action, children }: AdminEmptyStateProps) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas px-6 py-12 text-center">
      <p className="text-mute">{message}</p>
      {action && (
        <Link
          href={action.href}
          className={getButtonClassName(
            action.variant ?? 'default',
            'sm',
            'mt-4 inline-flex'
          )}
        >
          {action.label}
        </Link>
      )}
      {children}
    </div>
  )
}
