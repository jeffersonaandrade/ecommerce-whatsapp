import { describe, expect, it } from 'vitest'
import { validateBenefitCreateCount, validateBenefitInput } from './benefit-validation'
import { MAX_BENEFIT_ITEMS } from './constants'

describe('validateBenefitInput', () => {
  it('rejeita título vazio', () => {
    expect(validateBenefitInput({ title: '  ', description: 'ok' })).toMatch(/título/i)
  })

  it('rejeita título longo', () => {
    expect(
      validateBenefitInput({ title: 'a'.repeat(81), description: 'ok' })
    ).toMatch(/80/)
  })

  it('rejeita descrição longa', () => {
    expect(
      validateBenefitInput({ title: 'Ok', description: 'a'.repeat(241) })
    ).toMatch(/240/)
  })

  it('aceita input válido', () => {
    expect(validateBenefitInput({ title: 'Envio', description: 'Rápido' })).toBeNull()
  })
})

describe('validateBenefitCreateCount', () => {
  it('bloqueia acima do máximo', () => {
    expect(validateBenefitCreateCount(MAX_BENEFIT_ITEMS)).toMatch(/6/)
  })

  it('permite abaixo do máximo', () => {
    expect(validateBenefitCreateCount(MAX_BENEFIT_ITEMS - 1)).toBeNull()
  })
})
