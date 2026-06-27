'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { AdminOnboardingState } from '@/types/admin-onboarding'
import {
  addManualStep,
  resetDeploymentState,
  restartTourState,
} from './merge-onboarding-state'
import { getOnboardingRepository } from './get-onboarding-repository'

type ActionResult =
  | { ok: true; state: AdminOnboardingState }
  | { ok: false; error: string }

async function persist(partial: Partial<AdminOnboardingState>): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const state = await getOnboardingRepository().update(partial)
    revalidatePath('/admin')
    return { ok: true, state }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao salvar implantação'
    return { ok: false, error: message }
  }
}

export async function updateOnboardingStateAction(
  partial: Partial<AdminOnboardingState>
): Promise<ActionResult> {
  return persist(partial)
}

export async function skipOnboardingAction(): Promise<ActionResult> {
  return persist({ skipped: true })
}

export async function startOnboardingAction(): Promise<ActionResult> {
  return persist({ skipped: false, tourStarted: true, currentStep: 'store-settings' })
}

export async function restartTourAction(): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getOnboardingRepository()
    const current = await repo.get()
    const state = await repo.update(restartTourState(current))
    revalidatePath('/admin')
    return { ok: true, state }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao reiniciar tour'
    return { ok: false, error: message }
  }
}

export async function resetDeploymentAction(): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const state = await getOnboardingRepository().update(resetDeploymentState())
    revalidatePath('/admin')
    return { ok: true, state }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao resetar implantação'
    return { ok: false, error: message }
  }
}

export async function markStorefrontReviewedAction(): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getOnboardingRepository()
    const current = await repo.get()
    const next = addManualStep(current, 'review-storefront')
    const state = await repo.update(next)
    revalidatePath('/admin')
    return { ok: true, state }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao marcar revisão'
    return { ok: false, error: message }
  }
}

export async function markFirstSaleStepAction(): Promise<ActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false, error: auth.error }

  try {
    const repo = getOnboardingRepository()
    const current = await repo.get()
    const next = addManualStep(current, 'first-sale')
    const state = await repo.update(next)
    revalidatePath('/admin')
    return { ok: true, state }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha ao marcar primeira venda'
    return { ok: false, error: message }
  }
}

export async function completeOnboardingIfReadyAction(
  percentComplete: number
): Promise<ActionResult> {
  if (percentComplete < 100) {
    return { ok: false, error: 'Implantação incompleta' }
  }
  return persist({ tourCompleted: true })
}
