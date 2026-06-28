import { CartAddons, PersonalizationAddon } from '@/types/cart-addons'
import { PersonalizationSettings } from '@/types/personalization-settings'

export function validatePersonalizationAddon(
  addon: PersonalizationAddon,
  settings: PersonalizationSettings
): string | null {
  const name = addon.name.trim()
  const number = addon.number.trim()
  const notes = addon.notes?.trim() ?? ''

  if (!name) return 'Informe o nome para personalização.'
  if (name.length > settings.nameMaxLength) {
    return `Nome deve ter no máximo ${settings.nameMaxLength} caracteres.`
  }

  if (!number) return 'Informe o número para personalização.'
  const numberValue = Number.parseInt(number, 10)
  if (!Number.isFinite(numberValue)) return 'Número inválido.'
  if (numberValue < settings.numberMin || numberValue > settings.numberMax) {
    return `Número deve estar entre ${settings.numberMin} e ${settings.numberMax}.`
  }

  if (settings.notesRequired && !notes) {
    return 'Observação é obrigatória.'
  }
  if (notes.length > settings.notesMaxLength) {
    return `Observação deve ter no máximo ${settings.notesMaxLength} caracteres.`
  }

  return null
}

export function hasPersonalizationAddons(addons?: CartAddons): boolean {
  return Boolean(addons?.personalization)
}

export function canonicalAddonsKey(addons?: CartAddons): string {
  if (!addons?.personalization) return '-'
  const p = addons.personalization
  return JSON.stringify({
    name: p.name.trim(),
    number: p.number.trim(),
    notes: (p.notes ?? '').trim(),
  })
}
