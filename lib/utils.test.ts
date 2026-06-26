import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges tailwind classes with last-wins for conflicts', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
  })

  it('handles conditional classes', () => {
    expect(cn('text-sm', false && 'hidden', 'text-ink')).toBe('text-sm text-ink')
  })
})
