import Link from 'next/link'
import React from 'react'

type AdminPageHeaderProps = {
  title: string
  subtitle?: string
  back?: {
    href: string
    label: string
  }
  actions?: React.ReactNode
}

export function AdminPageHeader({ title, subtitle, back, actions }: AdminPageHeaderProps) {
  return (
    <div className="bg-ink py-8 text-canvas sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {back && (
          <Link
            href={back.href}
            className="text-sm text-mute transition-colors hover:text-canvas"
          >
            ← {back.label}
          </Link>
        )}
        <div className={`flex flex-wrap items-end justify-between gap-4 ${back ? 'mt-4' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-mute">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </div>
    </div>
  )
}
