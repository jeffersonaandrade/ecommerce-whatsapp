'use client'

import { forwardRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, XCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertType = 'success' | 'error' | 'warning' | 'info'
export type AlertSize = 'default' | 'sm'

const typeStyles: Record<AlertType, { container: string; icon: LucideIcon; iconClass: string }> =
  {
    success: {
      container: 'border-success/30 bg-success/5 text-success',
      icon: CheckCircle,
      iconClass: 'text-success',
    },
    error: {
      container: 'border-error/30 bg-error/5 text-error',
      icon: XCircle,
      iconClass: 'text-error',
    },
    warning: {
      container: 'border-warning/30 bg-warning/5 text-warning',
      icon: AlertTriangle,
      iconClass: 'text-warning',
    },
    info: {
      container: 'border-hairline bg-soft-cloud/50 text-ink',
      icon: Info,
      iconClass: 'text-mute',
    },
  }

const sizeStyles: Record<AlertSize, { container: string; icon: string }> = {
  default: { container: 'px-4 py-3 text-sm', icon: 'size-5' },
  sm: { container: 'px-3 py-2 text-xs', icon: 'size-4' },
}

export interface AlertProps {
  type: AlertType
  message?: string
  size?: AlertSize
  children?: ReactNode
  className?: string
  tabIndex?: number
  id?: string
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ type, message, children, size = 'default', className, tabIndex, id }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const styles = typeStyles[type]
    const Icon = styles.icon
    const content = children ?? message
    const isLive = type === 'error' || type === 'success'

    return (
      <motion.div
        ref={ref}
        id={id}
        tabIndex={tabIndex}
        role="alert"
        aria-live={isLive ? 'polite' : undefined}
        initial={prefersReducedMotion ? false : { opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.25 }}
        className={cn(
          'flex gap-3 rounded-lg border',
          styles.container,
          sizeStyles[size].container,
          className
        )}
      >
        <Icon
          className={cn('mt-0.5 shrink-0', sizeStyles[size].icon, styles.iconClass)}
          aria-hidden
        />
        <div className="min-w-0 flex-1">{content}</div>
      </motion.div>
    )
  }
)

Alert.displayName = 'Alert'

export default Alert
