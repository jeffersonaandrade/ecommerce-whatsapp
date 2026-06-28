import type { Product } from '@/types/product'

export type PublicationError =
  | 'sem_nome'
  | 'sem_slug'
  | 'sem_preco'
  | 'sem_categoria'
  | 'sem_imagem'
  | 'sem_variacao'
  | 'sem_estoque'

export const PUBLICATION_ERROR_LABELS: Record<PublicationError, string> = {
  sem_nome: 'Sem nome',
  sem_slug: 'Sem slug',
  sem_preco: 'Sem preço válido',
  sem_categoria: 'Sem categoria',
  sem_imagem: 'Sem imagem',
  sem_variacao: 'Sem variação',
  sem_estoque: 'Sem estoque',
}

export type ProductValidationResult = {
  productId: string
  productName: string
  errors: PublicationError[]
}

export type BulkValidationSummary = {
  total: number
  validIds: string[]
  invalid: ProductValidationResult[]
}

export function validateProductForPublication(product: Product): PublicationError[] {
  const errors: PublicationError[] = []
  if (!product.name?.trim()) errors.push('sem_nome')
  if (!product.slug?.trim()) errors.push('sem_slug')
  if (!(product.price > 0)) errors.push('sem_preco')
  if (!product.category?.trim()) errors.push('sem_categoria')
  if (!product.images?.length) errors.push('sem_imagem')
  if (!product.variations?.length) errors.push('sem_variacao')
  if (!product.variations?.some((v) => v.stock > 0)) errors.push('sem_estoque')
  return errors
}

export function validateProductsForBulkActivation(
  products: Product[]
): BulkValidationSummary {
  const validIds: string[] = []
  const invalid: ProductValidationResult[] = []

  for (const product of products) {
    const errors = validateProductForPublication(product)
    if (errors.length === 0) {
      validIds.push(product.id)
    } else {
      invalid.push({ productId: product.id, productName: product.name, errors })
    }
  }

  return { total: products.length, validIds, invalid }
}
