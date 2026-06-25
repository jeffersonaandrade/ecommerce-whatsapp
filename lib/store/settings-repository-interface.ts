import { StoreSettings, StoreSettingsInput } from '@/types/store-settings'

export interface StoreSettingsRepository {
  get(): Promise<StoreSettings>
  update(input: StoreSettingsInput): Promise<StoreSettings>
}
