import React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * DS §9.4 — admin forms; min 44px touch target, hairline border, rounded-sm.
 */
export function getInputClassName(className = ''): string {
  return [
    'flex h-11 w-full min-h-11 rounded-sm border border-hairline bg-canvas px-3 py-2 text-base text-ink',
    'placeholder:text-mute',
    'focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={getInputClassName(className)}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
