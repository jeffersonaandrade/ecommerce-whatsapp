import { Category, CategoryInput } from '@/types/category'

export interface CategoryRepository {
  getAll(): Promise<Category[]>
  getById(id: string): Promise<Category | undefined>
  getBySlug(slug: string): Promise<Category | undefined>
  getStorefront(): Promise<Category[]>
  create(input: CategoryInput): Promise<Category>
  update(id: string, input: CategoryInput): Promise<Category>
  delete(id: string): Promise<void>
}
