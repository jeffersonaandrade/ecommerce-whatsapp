import { getDataProvider } from '@/lib/data/provider'
import { BannerRepository } from './banner-repository'

export function getBannerRepository(): BannerRepository {
  if (getDataProvider() === 'supabase') {
    const { supabaseBannerRepository } = require('./supabase-banner-repository')
    return supabaseBannerRepository
  }
  const { jsonBannerRepository } = require('./json-banner-repository')
  return jsonBannerRepository
}
