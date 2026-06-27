import 'server-only'

import { BannerSlide } from '@/types/banner-slide'
import { getBannerRepository } from './get-banner-repository'
import { hasRequiredBannerImages } from './banner-viewport'

export async function getActiveBannerSlides(): Promise<BannerSlide[]> {
  const repo = getBannerRepository()
  const slides = await repo.getActive()
  return slides.filter(hasRequiredBannerImages)
}

export async function getAllBannerSlides(): Promise<BannerSlide[]> {
  const repo = getBannerRepository()
  return repo.getAll()
}
