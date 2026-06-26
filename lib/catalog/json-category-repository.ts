import 'server-only'

import { siteConfig } from '@/config/site'
import { Category, CategoryInput } from '@/types/category'
import { loadCatalogFromDisk } from './catalog-storage'
import {
  generateCategorySlug,
  isStorefrontCategoryEntity,
  normalizeCategorySlug,
  sortCategories,
} from './category-utils'
import { CategoryRepository } from './category-repository'
import {
  loadCategoriesFromDisk,
  persistCategories,
} from './category-storage'

function nowIso(): string {
  return new Date().toISOString()
}

function deriveCategoriesFromProductNames(names: string[]): Category[] {
  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  )
  const timestamp = nowIso()
  return unique.map((name, index) => ({
    id: `cat-${generateCategorySlug(name)}`,
    name,
    slug: generateCategorySlug(name),
    description: '',
    sortOrder: (index + 1) * 10,
    visible: !/^qa$/i.test(name) && !/^qa$/i.test(generateCategorySlug(name)),
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}

function seedFromSiteConfig(): Category[] {
  const timestamp = nowIso()
  return siteConfig.categories.map((name, index) => ({
    id: `cat-${generateCategorySlug(name)}`,
    name,
    slug: generateCategorySlug(name),
    description: '',
    sortOrder: (index + 1) * 10,
    visible: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}

function ensureCategoriesLoaded(): Category[] {
  const existing = loadCategoriesFromDisk()
  if (existing.length > 0) return existing

  const fromProducts = deriveCategoriesFromProductNames(
    loadCatalogFromDisk().map((p) => p.category)
  )
  if (fromProducts.length > 0) {
    persistCategories(fromProducts)
    return fromProducts
  }

  const seeded = seedFromSiteConfig()
  persistCategories(seeded)
  return seeded
}

function buildCategory(input: CategoryInput, existing: Category[]): Category {
  const name = input.name.trim()
  const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))
  const timestamp = nowIso()
  return {
    id: `cat-${slug}`,
    name,
    slug,
    description: input.description?.trim() ?? '',
    sortOrder: input.sortOrder ?? (existing.length + 1) * 10,
    visible: input.visible ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export const jsonCategoryRepository: CategoryRepository = {
  async getAll(): Promise<Category[]> {
    return sortCategories(ensureCategoriesLoaded())
  },

  async getById(id: string): Promise<Category | undefined> {
    return ensureCategoriesLoaded().find((c) => c.id === id)
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    const normalized = normalizeCategorySlug(slug)
    return ensureCategoriesLoaded().find(
      (c) => normalizeCategorySlug(c.slug) === normalized
    )
  },

  async getStorefront(): Promise<Category[]> {
    return sortCategories(
      ensureCategoriesLoaded().filter((c) => isStorefrontCategoryEntity(c))
    )
  },

  async create(input: CategoryInput): Promise<Category> {
    const categories = ensureCategoriesLoaded()
    const category = buildCategory(input, categories)
    persistCategories([...categories, category])
    return category
  },

  async update(id: string, input: CategoryInput): Promise<Category> {
    const categories = ensureCategoriesLoaded()
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Categoria não encontrada')

    const name = input.name.trim()
    const slug = normalizeCategorySlug(input.slug?.trim() || generateCategorySlug(name))
    const updated: Category = {
      ...categories[index],
      name,
      slug,
      description: input.description?.trim() ?? '',
      sortOrder: input.sortOrder ?? categories[index].sortOrder,
      visible: input.visible ?? categories[index].visible,
      updatedAt: nowIso(),
    }
    const next = [...categories]
    next[index] = updated
    persistCategories(next)
    return updated
  },

  async delete(id: string): Promise<void> {
    const categories = ensureCategoriesLoaded()
    persistCategories(categories.filter((c) => c.id !== id))
  },
}
