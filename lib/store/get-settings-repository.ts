import 'server-only'

import { getDataProvider } from '@/lib/data/provider'
import { jsonSettingsRepository } from './json-settings-repository'
import { StoreSettingsRepository } from './settings-repository-interface'
import { supabaseSettingsRepository } from './supabase-settings-repository'

export function getSettingsRepository(): StoreSettingsRepository {
  return getDataProvider() === 'supabase'
    ? supabaseSettingsRepository
    : jsonSettingsRepository
}
