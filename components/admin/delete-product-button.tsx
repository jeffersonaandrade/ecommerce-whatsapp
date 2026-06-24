'use client'

import { useTransition } from 'react'
import { deleteProductAction } from '@/lib/catalog/actions'

type DeleteProductButtonProps = {
  productId: string
  productName: string
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          !window.confirm(
            `Remover "${productName}"? Esta ação não pode ser desfeita.`
          )
        ) {
          return
        }
        startTransition(() => deleteProductAction(productId))
      }}
      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
    >
      {isPending ? 'Removendo...' : 'Deletar'}
    </button>
  )
}
