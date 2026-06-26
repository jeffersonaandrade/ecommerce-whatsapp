import { ProductStatus } from '@/types/product'
import { isStorefrontTestResidue } from './storefront-categories'

export type StorefrontVisibility = {
  visible: boolean
  tone: 'success' | 'warning' | 'info'
  title: string
  detail: string
}

export function getStorefrontVisibility(input: {
  status: ProductStatus
  name: string
  slug: string
  category: string
  club?: string
}): StorefrontVisibility {
  if (input.status === 'draft') {
    return {
      visible: false,
      tone: 'warning',
      title: 'Este produto ainda não aparece na loja',
      detail:
        'Ele está em Rascunho. Para publicar, altere Status para Ativo e clique em Salvar alterações.',
    }
  }

  if (input.status === 'unavailable') {
    return {
      visible: false,
      tone: 'info',
      title: 'Este produto está oculto na vitrine',
      detail:
        'Status Indisponível mantém o cadastro no admin, mas o cliente não vê na loja.',
    }
  }

  if (isStorefrontTestResidue(input)) {
    return {
      visible: false,
      tone: 'warning',
      title: 'Ativo no admin, mas oculto na vitrine pública',
      detail:
        'Produtos de teste/QA (nome ou slug com padrão QA) não são exibidos na loja.',
    }
  }

  return {
    visible: true,
    tone: 'success',
    title: 'Visível na loja',
    detail: 'Clientes podem ver este produto em /products e na página do item.',
  }
}
