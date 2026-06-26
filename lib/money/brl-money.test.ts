import { describe, expect, it } from 'vitest'
import { formatBrlMoneyInput, parseBrlMoney, reaisToCentsDigits } from './brl-money'

describe('parseBrlMoney', () => {
  it('parseia "129,90"', () => {
    expect(parseBrlMoney('129,90')).toBe(129.9)
  })

  it('parseia "R$ 129,90"', () => {
    expect(parseBrlMoney('R$ 129,90')).toBe(129.9)
  })

  it('trata "12990" somente dígitos como centavos (129,90)', () => {
    expect(parseBrlMoney('12990')).toBe(129.9)
  })

  it('parseia preço promocional com espaços', () => {
    expect(parseBrlMoney('  49,99  ')).toBe(49.99)
  })

  it('retorna null para vazio', () => {
    expect(parseBrlMoney('')).toBeNull()
    expect(parseBrlMoney('   ')).toBeNull()
  })
})

describe('formatBrlMoneyInput', () => {
  it('formata número em BRL', () => {
    expect(formatBrlMoneyInput(129.9)).toMatch(/129,90/)
  })
})

describe('reaisToCentsDigits', () => {
  it('converte reais para dígitos de centavos', () => {
    expect(reaisToCentsDigits(129.9)).toBe('12990')
  })
})
