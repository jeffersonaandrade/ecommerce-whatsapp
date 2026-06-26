import { BenefitItemInput } from '@/types/benefit-item'
import {
  BENEFIT_DESCRIPTION_MAX,
  BENEFIT_TITLE_MAX,
  MAX_BENEFIT_ITEMS,
} from './constants'

export function validateBenefitInput(input: BenefitItemInput): string | null {
  const title = input.title.trim()
  if (!title) return 'Informe o título do benefício.'
  if (title.length > BENEFIT_TITLE_MAX)
    return `Título deve ter no máximo ${BENEFIT_TITLE_MAX} caracteres.`

  const description = input.description.trim()
  if (description.length > BENEFIT_DESCRIPTION_MAX)
    return `Descrição deve ter no máximo ${BENEFIT_DESCRIPTION_MAX} caracteres.`

  return null
}

export function validateBenefitCreateCount(currentCount: number): string | null {
  if (currentCount >= MAX_BENEFIT_ITEMS)
    return `Máximo de ${MAX_BENEFIT_ITEMS} benefícios por loja.`
  return null
}
