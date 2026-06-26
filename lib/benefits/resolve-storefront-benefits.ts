import { BenefitItem } from '@/types/benefit-item'
import {
  DEFAULT_BENEFIT_ITEMS,
  DEFAULT_BENEFITS_EYEBROW,
  DEFAULT_BENEFITS_TITLE,
} from './constants'

export type StorefrontBenefitsSection = {
  eyebrow: string
  title: string
  items: Pick<BenefitItem, 'id' | 'title' | 'description'>[]
}

export function resolveStorefrontBenefits(
  activeItems: BenefitItem[],
  settings: { benefitsEyebrow?: string; benefitsTitle?: string }
): StorefrontBenefitsSection {
  const items =
    activeItems.length > 0
      ? activeItems.map(({ id, title, description }) => ({ id, title, description }))
      : DEFAULT_BENEFIT_ITEMS

  return {
    eyebrow: settings.benefitsEyebrow?.trim() || DEFAULT_BENEFITS_EYEBROW,
    title: settings.benefitsTitle?.trim() || DEFAULT_BENEFITS_TITLE,
    items,
  }
}
