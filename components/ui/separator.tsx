import React from 'react'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}

/** DS §8 — hairline divider, flat (no shadow). */
export function getSeparatorClassName(
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  className = ''
): string {
  const orientationStyles =
    orientation === 'vertical'
      ? 'h-full w-px shrink-0'
      : 'h-px w-full shrink-0'

  return ['bg-hairline', orientationStyles, className]
    .filter(Boolean)
    .join(' ')
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = '', orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={getSeparatorClassName(orientation, className)}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
