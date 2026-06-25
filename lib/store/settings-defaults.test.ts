import { describe, expect, it } from 'vitest'
import { isValidHexColor } from './settings-defaults'

describe('isValidHexColor', () => {
  it('accepts valid hex colors', () => {
    expect(isValidHexColor('#111111')).toBe(true)
    expect(isValidHexColor('#F5F5F5')).toBe(true)
  })

  it('rejects invalid values', () => {
    expect(isValidHexColor('111111')).toBe(false)
    expect(isValidHexColor('#111')).toBe(false)
    expect(isValidHexColor('red')).toBe(false)
  })
})
