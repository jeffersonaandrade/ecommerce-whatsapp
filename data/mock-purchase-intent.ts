import type { PurchaseIntentLine, PurchaseIntent } from '@/types/purchase-intent'

export type { PurchaseIntentLine, PurchaseIntent }

/** Dados fixos para protótipo /order-intent/demo — não é canal de produção. */
export const mockPurchaseIntent: PurchaseIntent = {
  id: 'TEMP-20260624-0001',
  createdAt: '2026-06-24T14:30:00.000Z',
  lines: [
    {
      productName: 'Camisa Flamengo 2024',
      slug: 'camisa-flamengo-2024',
      productUrl: '/products/camisa-flamengo-2024',
      size: 'G',
      color: 'Vermelha',
      sku: 'CAM-FLA-G',
      quantity: 2,
      lineSubtotal: 379.8,
    },
    {
      productName: 'Camisa Brasil 2024',
      slug: 'camisa-brasil-2024',
      productUrl: '/products/camisa-brasil-2024',
      size: 'M',
      color: 'Amarela',
      sku: 'CAM-BRA-M',
      quantity: 1,
      lineSubtotal: 159.9,
    },
  ],
  cartTotal: 539.7,
}
