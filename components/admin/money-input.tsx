'use client'

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useState,
} from 'react'
import { formatBrlMoneyInput } from '@/lib/money/brl-money'

export type MoneyInputHandle = {
  commit: () => number | null
}

type MoneyInputProps = {
  id?: string
  value: number | null
  onChange: (value: number | null) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  'aria-label'?: string
}

function reaisToDigits(reais: number | null): string {
  if (reais == null || !Number.isFinite(reais)) return ''
  if (reais < 0) return ''
  if (reais === 0) return '0'
  return String(Math.round(reais * 100))
}

function digitsToReais(digits: string): number | null {
  if (!digits) return null
  const cents = parseInt(digits, 10)
  return Number.isFinite(cents) ? cents / 100 : null
}

function digitsToDisplay(digits: string): string {
  if (!digits) return ''
  return formatBrlMoneyInput(parseInt(digits, 10) / 100)
}

export const MoneyInput = forwardRef<MoneyInputHandle, MoneyInputProps>(
  function MoneyInput(
    {
      id,
      value,
      onChange,
      required,
      disabled,
      placeholder = 'R$ 0,00',
      className,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const autoId = useId()
    const inputId = id ?? autoId
    const [centsStr, setCentsStr] = useState<string>(() => reaisToDigits(value))
    const [focused, setFocused] = useState(false)

    // Sync from parent when not focused (e.g. form reset or initial load)
    useEffect(() => {
      if (!focused) {
        setCentsStr(reaisToDigits(value))
      }
    }, [value, focused])

    function updateCents(digits: string) {
      const capped = digits.slice(0, 10) // max R$ 99.999.999,99
      setCentsStr(capped)
      onChange(digitsToReais(capped))
    }

    useImperativeHandle(ref, () => ({
      commit: () => digitsToReais(centsStr),
    }))

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        updateCents(centsStr.slice(0, -1))
      }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const digits = e.target.value.replace(/\D/g, '')
      updateCents(digits)
    }

    return (
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={digitsToDisplay(centsStr)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        className={
          className ??
          'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-600'
        }
      />
    )
  }
)
