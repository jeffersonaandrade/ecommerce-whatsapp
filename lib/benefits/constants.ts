import { BenefitItem } from '@/types/benefit-item'

export const MAX_BENEFIT_ITEMS = 6
export const BENEFIT_TITLE_MAX = 80
export const BENEFIT_DESCRIPTION_MAX = 240

export const DEFAULT_BENEFITS_EYEBROW = 'Por que comprar conosco'
export const DEFAULT_BENEFITS_TITLE = 'Benefícios'

export const DEFAULT_BENEFIT_ITEMS: Pick<BenefitItem, 'id' | 'title' | 'description'>[] = [
  {
    id: 'benefit-default-1',
    title: 'Envio rápido',
    description: 'Entrega em até 5 dias úteis em todo o Brasil.',
  },
  {
    id: 'benefit-default-2',
    title: 'Produtos originais',
    description: '100% autênticos com garantia de qualidade.',
  },
  {
    id: 'benefit-default-3',
    title: 'Suporte dedicado',
    description: 'Atendimento quando você precisar.',
  },
]
