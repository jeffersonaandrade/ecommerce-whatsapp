import React from 'react'

type AdminListPageProps = {
  header: React.ReactNode
  toolbar?: React.ReactNode
  content: React.ReactNode
  footer?: React.ReactNode
}

export function AdminListPage({ header, toolbar, content, footer }: AdminListPageProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">{header}</div>
      {toolbar && <div className="space-y-3">{toolbar}</div>}
      <div>{content}</div>
      {footer && <div>{footer}</div>}
    </div>
  )
}
