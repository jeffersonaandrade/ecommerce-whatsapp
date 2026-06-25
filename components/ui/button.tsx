import React from 'react'

export type ButtonVariant = 'default' | 'secondary' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * DS §9.1 — primary/secondary/outline, pill CTAs.
 * default = primary (ink bg).
 */
export function getButtonClassName(
  variant: ButtonVariant = 'default',
  size: ButtonSize = 'md',
  className = ''
): string {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    default:
      'bg-[var(--color-store-primary,#111111)] text-canvas hover:opacity-90',
    secondary:
      'bg-[var(--color-store-secondary,#f5f5f5)] text-ink hover:opacity-90',
    outline:
      'border border-hairline text-ink bg-transparent hover:bg-soft-cloud',
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim()
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={getButtonClassName(variant, size, className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
