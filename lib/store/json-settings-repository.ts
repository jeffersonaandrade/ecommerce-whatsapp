import 'server-only'

import { StoreSettings, StoreSettingsInput } from '@/types/store-settings'
import { mergeStoreSettings } from './settings-merge'
import { StoreSettingsRepository } from './settings-repository-interface'
import {
  loadStoreSettingsFromDisk,
  persistStoreSettings,
} from './settings-storage'

export const jsonSettingsRepository: StoreSettingsRepository = {
  async get(): Promise<StoreSettings> {
    return loadStoreSettingsFromDisk()
  },

  async update(input: StoreSettingsInput): Promise<StoreSettings> {
    const current = loadStoreSettingsFromDisk()
    const next = mergeStoreSettings(current, input)
    persistStoreSettings(next)
    return next
  },
}
