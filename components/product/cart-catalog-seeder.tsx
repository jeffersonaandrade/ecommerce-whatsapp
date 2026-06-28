'use client'

import { useEffect } from 'react'
import { mergeCatalogCache } from '@/lib/catalog/client-catalog-cache'
import { Product } from '@/types/product'

type CartCatalogSeederProps = {
  products: Product[]
}

export function CartCatalogSeeder({ products }: CartCatalogSeederProps) {
  useEffect(() => {
    mergeCatalogCache(products)
  }, [products])

  return null
}
