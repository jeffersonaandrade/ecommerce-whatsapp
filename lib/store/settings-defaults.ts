import { StoreSettings } from '@/types/store-settings'
import { DEFAULT_HEADER_BRAND_DISPLAY } from './header-brand-display'
import {
  DEFAULT_BENEFITS_EYEBROW,
  DEFAULT_BENEFITS_TITLE,
} from '@/lib/benefits/constants'

export const DEFAULT_PRIMARY_COLOR = '#111111'
export const DEFAULT_SECONDARY_COLOR = '#f5f5f5'

/** Sem imagem padrão no core — hero vem do preset do deploy ou do admin. */
export const DEFAULT_HERO_IMAGE: string | null = null

export function createDefaultStoreSettings(): StoreSettings {
  return {
    storeName: 'Store',
    description: '',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    whatsappPhone: '5511999999999',
    whatsappMessagePrefix: '',
    email: '',
    instagram: '',
    facebook: '',
    phone: '',
    logoPath: null,
    ogImagePath: null,
    primaryColor: DEFAULT_PRIMARY_COLOR,
    secondaryColor: DEFAULT_SECONDARY_COLOR,
    heroImagePath: null,
    heroHeadline: '',
    heroHeadlineLine2: '',
    heroSubheadline: '',
    heroCtaLabel: 'Ver produtos',
    heroCtaHref: '/products',
    aboutText: '',
    address: '',
    cityState: '',
    businessHours: 'Seg–Sex, 9h–18h',
    exchangePolicyText:
      'Trocas em até 7 dias para produtos sem uso, com etiqueta e nota fiscal. Entre em contato pelo WhatsApp ou e-mail da loja.',
    importStatusPolicy: 'draft',
    headerBrandDisplay: DEFAULT_HEADER_BRAND_DISPLAY,
    benefitsEyebrow: DEFAULT_BENEFITS_EYEBROW,
    benefitsTitle: DEFAULT_BENEFITS_TITLE,
    personalizationEnabled: false,
    personalizationDefaultPrice: 0,
    personalizationNameMaxLength: 15,
    personalizationNumberMin: 0,
    personalizationNumberMax: 99,
    personalizationNotesRequired: false,
    personalizationNotesMaxLength: 200,
    commercialSalesChannels: { retail: true, wholesale: false, distributor: false },
    commercialDefaultPolicyId: null,
    updatedAt: new Date(0).toISOString(),
  }
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}
