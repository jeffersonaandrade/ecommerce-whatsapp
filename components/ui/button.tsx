import React from 'react'

export type ButtonVariant = 'default' | 'secondary' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export function getButtonClassName(
  variant: ButtonVariant = 'default',
  size: ButtonSize = 'md',
  className = ''
): string {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    default: 'bg-black text-white hover:bg-gray-900 focus:ring-black',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200 focus:ring-gray-300',
    outline:
      'border border-gray-300 text-black hover:bg-gray-50 focus:ring-gray-300',
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
