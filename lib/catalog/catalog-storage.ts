import 'server-only'

import fs from 'fs'
import path from 'path'
import { Product } from '@/types/product'
import { mockProducts } from '@/data/mock-products'

const STORAGE_DIR = path.join(process.cwd(), 'storage')
const CATALOG_PATH = path.join(STORAGE_DIR, 'catalog.json')
const SEED_PATH = path.join(STORAGE_DIR, 'catalog.seed.json')

let memoryCache: Product[] | null = null

function ensureStorage(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
  if (!fs.existsSync(CATALOG_PATH)) {
    const seed = fs.existsSync(SEED_PATH)
      ? fs.readFileSync(SEED_PATH, 'utf-8')
      : JSON.stringify(mockProducts, null, 2)
    fs.writeFileSync(CATALOG_PATH, seed, 'utf-8')
  }
}

function readFromDisk(): Product[] {
  ensureStorage()
  const raw = fs.readFileSync(CATALOG_PATH, 'utf-8')
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) return []
  return parsed as Product[]
}

function writeToDisk(products: Product[]): void {
  ensureStorage()
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(products, null, 2), 'utf-8')
  memoryCache = products
}

export function loadCatalogFromDisk(): Product[] {
  if (memoryCache) return memoryCache
  memoryCache = readFromDisk()
  return memoryCache
}

export function persistCatalog(products: Product[]): void {
  writeToDisk(products)
}

export function getCatalogStoragePath(): string {
  return CATALOG_PATH
}
