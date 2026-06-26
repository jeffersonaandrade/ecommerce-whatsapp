import { BannerSlide, BannerSlideCreateInput, BannerSlideInput } from '@/types/banner-slide'

export interface BannerRepository {
  getAll(): Promise<BannerSlide[]>
  getActive(): Promise<BannerSlide[]>
  getById(id: string): Promise<BannerSlide | undefined>
  create(input: BannerSlideCreateInput): Promise<BannerSlide>
  update(id: string, input: Partial<BannerSlideInput>): Promise<BannerSlide>
  delete(id: string): Promise<void>
}
