import 'server-only'

import { StoreSettings, StoreSettingsInput } from '@/types/store-settings'
import { getSettingsRepository } from './get-settings-repository'

export async function getStoreSettings(): Promise<StoreSettings> {
  return getSettingsRepository().get()
}

export async function updateStoreSettings(
  input: StoreSettingsInput
): Promise<StoreSettings> {
  return getSettingsRepository().update(input)
}
