import { StoreSettings } from '@/types/store-settings'
import { PersonalizationSettings } from '@/types/personalization-settings'

export function storeSettingsToPersonalization(
  settings: StoreSettings
): PersonalizationSettings {
  return {
    enabled: settings.personalizationEnabled,
    defaultPrice: settings.personalizationDefaultPrice,
    nameMaxLength: settings.personalizationNameMaxLength,
    numberMin: settings.personalizationNumberMin,
    numberMax: settings.personalizationNumberMax,
    notesRequired: settings.personalizationNotesRequired,
    notesMaxLength: settings.personalizationNotesMaxLength,
    updatedAt: settings.updatedAt,
  }
}

export function personalizationToStoreSettingsInput(
  input: Partial<PersonalizationSettings>
): Partial<StoreSettings> {
  return {
    personalizationEnabled: input.enabled,
    personalizationDefaultPrice: input.defaultPrice,
    personalizationNameMaxLength: input.nameMaxLength,
    personalizationNumberMin: input.numberMin,
    personalizationNumberMax: input.numberMax,
    personalizationNotesRequired: input.notesRequired,
    personalizationNotesMaxLength: input.notesMaxLength,
  }
}
