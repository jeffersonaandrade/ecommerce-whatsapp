import 'server-only'

import fs from 'fs'
import path from 'path'
import { StoreSettings } from '@/types/store-settings'
import { createDefaultStoreSettings } from './settings-defaults'

const STORAGE_DIR = path.join(process.cwd(), 'storage')
const SETTINGS_PATH = path.join(STORAGE_DIR, 'store-settings.json')
const SEED_PATH = path.join(STORAGE_DIR, 'store-settings.seed.json')
const BRANDING_DIR = path.join(STORAGE_DIR, 'branding')

let memoryCache: StoreSettings | null = null

const DEFAULT_SETTINGS = createDefaultStoreSettings()

function ensureStorage(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
  if (!fs.existsSync(BRANDING_DIR)) {
    fs.mkdirSync(BRANDING_DIR, { recursive: true })
  }
  if (!fs.existsSync(SETTINGS_PATH)) {
    const seed = fs.existsSync(SEED_PATH)
      ? fs.readFileSync(SEED_PATH, 'utf-8')
      : JSON.stringify(DEFAULT_SETTINGS, null, 2)
    fs.writeFileSync(SETTINGS_PATH, seed, 'utf-8')
  }
}

function readFromDisk(): StoreSettings {
  ensureStorage()
  const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8')
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS
  return { ...DEFAULT_SETTINGS, ...(parsed as StoreSettings) }
}

function writeToDisk(settings: StoreSettings): void {
  ensureStorage()
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8')
  memoryCache = settings
}

export function loadStoreSettingsFromDisk(): StoreSettings {
  if (memoryCache) return memoryCache
  memoryCache = readFromDisk()
  return memoryCache
}

export function persistStoreSettings(settings: StoreSettings): void {
  writeToDisk(settings)
}

export function getBrandingDir(): string {
  ensureStorage()
  return BRANDING_DIR
}

export function getBrandingFilePath(filename: string): string {
  return path.join(getBrandingDir(), path.basename(filename))
}
