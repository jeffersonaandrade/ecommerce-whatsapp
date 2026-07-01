import 'server-only'

import { cache } from 'react'
import { StoreSettings, StoreSettingsInput } from '@/types/store-settings'
import { getSettingsRepository } from './get-settings-repository'

/** Dedup por request (layout + generateMetadata); não persiste entre requests. */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  return getSettingsRepository().get()
})

export async function updateStoreSettings(
  input: StoreSettingsInput
): Promise<StoreSettings> {
  return getSettingsRepository().update(input)
}
