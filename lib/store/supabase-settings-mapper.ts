import { StoreSettings } from '@/types/store-settings'
import { normalizeHeaderBrandDisplay } from './header-brand-display'
import {
  DEFAULT_BENEFITS_EYEBROW,
  DEFAULT_BENEFITS_TITLE,
} from '@/lib/benefits/constants'

export type StoreSettingsRow = {
  id: string
  store_name: string
  description: string
  site_url: string
  whatsapp_phone: string
  whatsapp_message_prefix: string
  email: string
  instagram: string
  facebook: string
  phone: string
  logo_path: string | null
  og_image_path: string | null
  primary_color: string
  secondary_color: string
  hero_image_path: string | null
  hero_headline: string
  hero_headline_line2: string
  hero_subheadline: string
  hero_cta_label: string
  hero_cta_href: string
  about_text: string
  address: string
  city_state: string
  business_hours: string
  exchange_policy_text: string
  import_status_policy: string
  header_brand_display?: string | null
  benefits_eyebrow?: string | null
  benefits_title?: string | null
  updated_at: string
}

export function rowToStoreSettings(row: StoreSettingsRow): StoreSettings {
  return {
    storeName: row.store_name,
    description: row.description,
    siteUrl: row.site_url,
    whatsappPhone: row.whatsapp_phone,
    whatsappMessagePrefix: row.whatsapp_message_prefix,
    email: row.email,
    instagram: row.instagram,
    facebook: row.facebook,
    phone: row.phone,
    logoPath: row.logo_path,
    ogImagePath: row.og_image_path,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    heroImagePath: row.hero_image_path,
    heroHeadline: row.hero_headline,
    heroHeadlineLine2: row.hero_headline_line2,
    heroSubheadline: row.hero_subheadline,
    heroCtaLabel: row.hero_cta_label,
    heroCtaHref: row.hero_cta_href,
    aboutText: row.about_text,
    address: row.address,
    cityState: row.city_state,
    businessHours: row.business_hours,
    exchangePolicyText: row.exchange_policy_text,
    importStatusPolicy: row.import_status_policy === 'active' ? 'active' : 'draft',
    headerBrandDisplay: normalizeHeaderBrandDisplay(row.header_brand_display),
    benefitsEyebrow: row.benefits_eyebrow?.trim() || DEFAULT_BENEFITS_EYEBROW,
    benefitsTitle: row.benefits_title?.trim() || DEFAULT_BENEFITS_TITLE,
    updatedAt: row.updated_at,
  }
}

export function storeSettingsToRow(settings: StoreSettings): StoreSettingsRow {
  return {
    id: 'default',
    store_name: settings.storeName,
    description: settings.description,
    site_url: settings.siteUrl,
    whatsapp_phone: settings.whatsappPhone,
    whatsapp_message_prefix: settings.whatsappMessagePrefix,
    email: settings.email,
    instagram: settings.instagram,
    facebook: settings.facebook,
    phone: settings.phone,
    logo_path: settings.logoPath,
    og_image_path: settings.ogImagePath,
    primary_color: settings.primaryColor,
    secondary_color: settings.secondaryColor,
    hero_image_path: settings.heroImagePath,
    hero_headline: settings.heroHeadline,
    hero_headline_line2: settings.heroHeadlineLine2,
    hero_subheadline: settings.heroSubheadline,
    hero_cta_label: settings.heroCtaLabel,
    hero_cta_href: settings.heroCtaHref,
    about_text: settings.aboutText,
    address: settings.address,
    city_state: settings.cityState,
    business_hours: settings.businessHours,
    exchange_policy_text: settings.exchangePolicyText,
    import_status_policy: settings.importStatusPolicy,
    header_brand_display: settings.headerBrandDisplay,
    benefits_eyebrow: settings.benefitsEyebrow,
    benefits_title: settings.benefitsTitle,
    updated_at: settings.updatedAt,
  }
}
