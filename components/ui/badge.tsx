import React from 'react'

/** Legacy names kept; DS §9.3 semantic aliases included. */
export type BadgeVariant =
  | 'default'
  | 'category'
  | 'success'
  | 'stock-in'
  | 'warning'
  | 'error'
  | 'stock-out'
  | 'sale'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-soft-cloud text-charcoal',
  category: 'bg-soft-cloud text-charcoal',
  success: 'bg-success/10 text-success',
  'stock-in': 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  'stock-out': 'bg-error/10 text-error',
  sale: 'bg-sale text-canvas',
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantStyles[variant]} ${className}`}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
