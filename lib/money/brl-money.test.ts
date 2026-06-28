import { describe, expect, it } from 'vitest'
import { formatBrlMoneyInput, parseBrlMoney, reaisToCentsDigits } from './brl-money'

describe('parseBrlMoney', () => {
  it('parseia "129,90"', () => {
    expect(parseBrlMoney('129,90')).toBe(129.9)
  })

  it('parseia "R$ 129,90"', () => {
    expect(parseBrlMoney('R$ 129,90')).toBe(129.9)
  })

  it('parseia dígitos puros como reais (não centavos)', () => {
    expect(parseBrlMoney('30')).toBe(30)
    expect(parseBrlMoney('12990')).toBe(12990)
  })

  it('parseia preço promocional com espaços', () => {
    expect(parseBrlMoney('  49,99  ')).toBe(49.99)
  })

  it('parseia ponto como separador decimal com 2 casas', () => {
    expect(parseBrlMoney('129.90')).toBe(129.9)
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

  it('retorna string vazia para null', () => {
    expect(formatBrlMoneyInput(null)).toBe('')
  })
})

describe('reaisToCentsDigits', () => {
  it('converte reais para dígitos de centavos', () => {
    expect(reaisToCentsDigits(129.9)).toBe('12990')
  })

  it('converte 30 reais para "3000"', () => {
    expect(reaisToCentsDigits(30)).toBe('3000')
  })
})

describe('lógica de máscara ATM (digitsToReais via reaisToCentsDigits)', () => {
  function atm(digits: string): number | null {
    if (!digits) return null
    return parseInt(digits, 10) / 100
  }

  it('"3" → R$ 0,03 (0.03)', () => expect(atm('3')).toBe(0.03))
  it('"30" → R$ 0,30 (0.30)', () => expect(atm('30')).toBeCloseTo(0.3))
  it('"300" → R$ 3,00 (3.00)', () => expect(atm('300')).toBe(3))
  it('"3000" → R$ 30,00 (30.00)', () => expect(atm('3000')).toBe(30))
  it('"15990" → R$ 159,90 (159.90)', () => expect(atm('15990')).toBeCloseTo(159.9))
  it('string vazia → null', () => expect(atm('')).toBeNull())
})
