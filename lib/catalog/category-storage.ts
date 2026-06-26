import 'server-only'

import fs from 'fs'
import path from 'path'
import { Category } from '@/types/category'

const STORAGE_DIR = path.join(process.cwd(), 'storage')
const CATEGORIES_PATH = path.join(STORAGE_DIR, 'categories.json')

let memoryCache: Category[] | null = null

function ensureStorage(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
}

function readFromDisk(): Category[] {
  ensureStorage()
  if (!fs.existsSync(CATEGORIES_PATH)) return []
  const raw = fs.readFileSync(CATEGORIES_PATH, 'utf-8')
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) return []
  return parsed as Category[]
}

function writeToDisk(categories: Category[]): void {
  ensureStorage()
  fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(categories, null, 2), 'utf-8')
  memoryCache = categories
}

export function loadCategoriesFromDisk(): Category[] {
  if (memoryCache) return memoryCache
  memoryCache = readFromDisk()
  return memoryCache
}

export function persistCategories(categories: Category[]): void {
  writeToDisk(categories)
}

export function resetCategoriesMemoryCache(): void {
  memoryCache = null
}

export function getCategoriesStoragePath(): string {
  return CATEGORIES_PATH
}
