export const siteConfig = {
  name: 'Sports Store',
  description: 'Sua loja esportiva de confiança',
  currency: 'BRL',
  currencySymbol: 'R$',
  /** Número WhatsApp da loja (DDI + DDD + número, só dígitos). */
  whatsappPhone: '5511999999999',
  /** URL pública da loja para links na mensagem WhatsApp. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  navigation: [
    {
      title: 'Produtos',
      href: '/products',
    },
    {
      title: 'Sobre',
      href: '#',
    },
    {
      title: 'Contato',
      href: '#',
    },
  ],
  categories: [
    'Camisas',
    'Shorts',
    'Meias',
    'Jaquetas',
    'Acessórios',
  ],
  productPageSize: 12,
}
