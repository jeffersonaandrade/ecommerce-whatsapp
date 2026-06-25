import 'server-only'

import { StoreSettings } from '@/types/store-settings'
import { createDefaultStoreSettings } from './settings-defaults'
import { mergeStoreSettings } from './settings-merge'
import { StoreSettingsRepository } from './settings-repository-interface'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  rowToStoreSettings,
  storeSettingsToRow,
  type StoreSettingsRow,
} from './supabase-settings-mapper'

const SETTINGS_ID = 'default'

export const supabaseSettingsRepository: StoreSettingsRepository = {
  async get(): Promise<StoreSettings> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle()

    if (error) throw new Error(`store_settings read failed: ${error.message}`)
    if (!data) return createDefaultStoreSettings()
    return rowToStoreSettings(data as StoreSettingsRow)
  },

  async update(input): Promise<StoreSettings> {
    const current = await this.get()
    const next = mergeStoreSettings(current, input)
    const supabase = createAdminClient()
    const row = storeSettingsToRow(next)

    const { error } = await supabase.from('store_settings').upsert(row, {
      onConflict: 'id',
    })

    if (error) throw new Error(`store_settings write failed: ${error.message}`)
    return next
  },
}
