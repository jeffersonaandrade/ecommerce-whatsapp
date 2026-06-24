import React from 'react'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/** DS §9.4 — caption-style label above inputs. */
export function getLabelClassName(className = ''): string {
  return [
    'text-sm font-medium leading-snug text-charcoal',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <label ref={ref} className={getLabelClassName(className)} {...props} />
    )
  }
)

Label.displayName = 'Label'

export { Label }
