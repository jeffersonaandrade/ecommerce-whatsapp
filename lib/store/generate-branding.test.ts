import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateBrandingFromLogo } from './generate-branding'

const written = new Map<string, Buffer>()

vi.mock('./branding-storage', () => ({
  writeBrandingFile: vi.fn(async (filename: string, buffer: Buffer) => {
    written.set(filename, buffer)
  }),
}))

function countBrightPixelsInMiddleRow(buffer: Buffer, width: number, height: number, threshold: number): number {
  const middleY = Math.floor(height / 2)
  const rowStart = middleY * width * 3
  let count = 0
  for (let x = 0; x < width; x += 1) {
    const i = rowStart + x * 3
    const r = buffer[i]
    const g = buffer[i + 1]
    const b = buffer[i + 2]
    if (r > threshold || g > threshold || b > threshold) count += 1
  }
  return count
}

describe('generateBrandingFromLogo', () => {
  beforeEach(() => {
    written.clear()
  })

  it('uses contain fit so horizontal logos stay legible in logo.webp', async () => {
    const logoPath = path.join(process.cwd(), 'logoUnit.jpeg')
    if (!fs.existsSync(logoPath)) {
      return
    }

    const source = fs.readFileSync(logoPath)
    const { data: coverData, info: coverInfo } = await sharp(source)
      .rotate()
      .resize(512, 512, { fit: 'cover', position: 'centre' })
      .raw()
      .toBuffer({ resolveWithObject: true })

    await generateBrandingFromLogo(source)

    const logoWebp = written.get('logo.webp')
    expect(logoWebp).toBeDefined()

    const { data: containData, info: containInfo } = await sharp(logoWebp!)
      .raw()
      .toBuffer({ resolveWithObject: true })

    const coverBright = countBrightPixelsInMiddleRow(
      coverData,
      coverInfo.width,
      coverInfo.height,
      40
    )
    const containBright = countBrightPixelsInMiddleRow(
      containData,
      containInfo.width,
      containInfo.height,
      40
    )

    expect(containBright).toBeGreaterThan(coverBright)
  })
})
