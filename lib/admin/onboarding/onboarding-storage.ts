import 'server-only'

import fs from 'fs'
import path from 'path'
import type { AdminOnboardingState } from '@/types/admin-onboarding'
import { createDefaultOnboardingState } from './defaults'
import { onboardingStateToJson, parseOnboardingState } from './onboarding-mapper'

const STORAGE_DIR = path.join(process.cwd(), 'storage')
const ONBOARDING_PATH = path.join(STORAGE_DIR, 'store-onboarding.json')
const SEED_PATH = path.join(STORAGE_DIR, 'store-onboarding.seed.json')

type OnboardingFile = {
  state: Record<string, unknown>
}

let memoryCache: AdminOnboardingState | null = null

function ensureStorage(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
  if (!fs.existsSync(ONBOARDING_PATH)) {
    const seed = fs.existsSync(SEED_PATH)
      ? fs.readFileSync(SEED_PATH, 'utf-8')
      : JSON.stringify({ state: {} }, null, 2)
    fs.writeFileSync(ONBOARDING_PATH, seed, 'utf-8')
  }
}

function readFromDisk(): AdminOnboardingState {
  ensureStorage()
  const raw = fs.readFileSync(ONBOARDING_PATH, 'utf-8')
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') return createDefaultOnboardingState()
  const file = parsed as OnboardingFile
  return parseOnboardingState(file.state)
}

function writeToDisk(state: AdminOnboardingState): void {
  ensureStorage()
  const payload: OnboardingFile = { state: onboardingStateToJson(state) }
  fs.writeFileSync(ONBOARDING_PATH, JSON.stringify(payload, null, 2), 'utf-8')
  memoryCache = state
}

export function loadOnboardingFromDisk(): AdminOnboardingState {
  if (memoryCache) return memoryCache
  memoryCache = readFromDisk()
  return memoryCache
}

export function persistOnboarding(state: AdminOnboardingState): void {
  writeToDisk(state)
}
