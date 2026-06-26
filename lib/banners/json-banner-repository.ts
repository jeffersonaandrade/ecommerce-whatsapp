import 'server-only'

import fs from 'fs'
import path from 'path'
import { BannerSlide, BannerSlideCreateInput, BannerSlideInput } from '@/types/banner-slide'
import { BannerRepository } from './banner-repository'
import { assertBannerDesktopPath } from './banner-validation'

const STORAGE_PATH = path.join(process.cwd(), 'storage', 'banner-slides.json')

function load(): BannerSlide[] {
  if (!fs.existsSync(STORAGE_PATH)) return []
  try {
    return JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf-8')) as BannerSlide[]
  } catch {
    return []
  }
}

function save(slides: BannerSlide[]): void {
  fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true })
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(slides, null, 2), 'utf-8')
}

function nowIso(): string {
  return new Date().toISOString()
}

export const jsonBannerRepository: BannerRepository = {
  async getAll(): Promise<BannerSlide[]> {
    return load().sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
  },

  async getActive(): Promise<BannerSlide[]> {
    return (await this.getAll()).filter((s) => s.active)
  },

  async getById(id: string): Promise<BannerSlide | undefined> {
    return load().find((s) => s.id === id)
  },

  async create(input: BannerSlideCreateInput): Promise<BannerSlide> {
    assertBannerDesktopPath(input.desktopImagePath)
    const slides = load()
    const now = nowIso()
    const slide: BannerSlide = {
      id: input.id ?? crypto.randomUUID(),
      ...input,
      desktopImagePath: input.desktopImagePath.trim(),
      createdAt: now,
      updatedAt: now,
    }
    save([...slides, slide])
    return slide
  },

  async update(id: string, input: Partial<BannerSlideInput>): Promise<BannerSlide> {
    const slides = load()
    const index = slides.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Slide não encontrado')
    const updated: BannerSlide = { ...slides[index], ...input, updatedAt: nowIso() }
    const next = [...slides]
    next[index] = updated
    save(next)
    return updated
  },

  async delete(id: string): Promise<void> {
    save(load().filter((s) => s.id !== id))
  },
}
