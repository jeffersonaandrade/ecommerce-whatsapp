import { describe, expect, it } from 'vitest'
import { validatePersonalizationAddon } from './validate-personalization'
import { PersonalizationSettings } from '@/types/personalization-settings'

const settings: PersonalizationSettings = {
  enabled: true,
  defaultPrice: 30,
  nameMaxLength: 15,
  numberMin: 1,
  numberMax: 99,
  notesRequired: false,
  notesMaxLength: 200,
  updatedAt: '',
}

describe('validatePersonalizationAddon', () => {
  it('aceita personalização sem observação quando notesRequired é false', () => {
    const error = validatePersonalizationAddon(
      { name: 'Jefferson', number: '10' },
      settings
    )
    expect(error).toBeNull()
  })

  it('exige observação apenas quando notesRequired é true', () => {
    const error = validatePersonalizationAddon(
      { name: 'Jefferson', number: '10' },
      { ...settings, notesRequired: true }
    )
    expect(error).toBe('Observação é obrigatória.')
  })

  it('valida tamanho máximo da observação quando informada', () => {
    const error = validatePersonalizationAddon(
      { name: 'Jefferson', number: '10', notes: 'x'.repeat(201) },
      settings
    )
    expect(error).toBe('Observação deve ter no máximo 200 caracteres.')
  })
})
