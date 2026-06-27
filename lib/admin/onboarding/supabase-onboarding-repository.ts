import 'server-only'

import type { AdminOnboardingState } from '@/types/admin-onboarding'
import { createAdminClient } from '@/lib/supabase/admin'
import { createDefaultOnboardingState } from './defaults'
import { mergeOnboardingState } from './merge-onboarding-state'
import { OnboardingRepository } from './onboarding-repository-interface'
import { onboardingStateToJson, parseOnboardingState } from './onboarding-mapper'

const ONBOARDING_ID = 'default'

type StoreOnboardingRow = {
  id: string
  state: unknown
  updated_at: string
}

function isMissingOnboardingTable(error: { message?: string; code?: string }): boolean {
  const message = error.message ?? ''
  return (
    error.code === 'PGRST205' ||
    message.includes("Could not find the table 'public.store_onboarding'") ||
    message.includes('relation "public.store_onboarding" does not exist')
  )
}

export const supabaseOnboardingRepository: OnboardingRepository = {
  async get(): Promise<AdminOnboardingState> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('store_onboarding')
      .select('state')
      .eq('id', ONBOARDING_ID)
      .maybeSingle()

    if (error) {
      if (isMissingOnboardingTable(error)) return createDefaultOnboardingState()
      throw new Error(`store_onboarding read failed: ${error.message}`)
    }
    if (!data) return createDefaultOnboardingState()
    return parseOnboardingState((data as StoreOnboardingRow).state)
  },

  async update(partial: Partial<AdminOnboardingState>): Promise<AdminOnboardingState> {
    const current = await this.get()
    const next = mergeOnboardingState(current, partial)
    const supabase = createAdminClient()

    const { error } = await supabase.from('store_onboarding').upsert(
      {
        id: ONBOARDING_ID,
        state: onboardingStateToJson(next),
        updated_at: next.updatedAt ?? new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    if (error) {
      if (isMissingOnboardingTable(error)) {
        throw new Error(
          'store_onboarding table missing — apply migration 20260627210000_store_onboarding in Supabase'
        )
      }
      throw new Error(`store_onboarding write failed: ${error.message}`)
    }
    return next
  },
}
