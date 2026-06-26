'use client'

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useState,
} from 'react'
import { formatBrlMoneyInput, parseBrlMoney } from '@/lib/money/brl-money'

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
    const [text, setText] = useState(() => formatBrlMoneyInput(value))
    const [focused, setFocused] = useState(false)

    useEffect(() => {
      if (!focused) {
        setText(formatBrlMoneyInput(value))
      }
    }, [value, focused])

    function commitInput(): number | null {
      const parsed = parseBrlMoney(text)
      onChange(parsed)
      setText(parsed == null ? text.trim() : formatBrlMoneyInput(parsed))
      return parsed
    }

    useImperativeHandle(ref, () => ({
      commit: commitInput,
    }))

    return (
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          commitInput()
        }}
        onChange={(e) => setText(e.target.value)}
        className={
          className ??
          'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-600'
        }
      />
    )
  }
)
