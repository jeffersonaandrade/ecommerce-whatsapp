import { describe, expect, it } from 'vitest'
import {
  DEFAULT_IMAGE_MAX_BYTES,
  LOGO_IMAGE_MAX_BYTES,
  isAllowedImageExtension,
  isAllowedImageMime,
  mimeToImageExt,
  validateImageFile,
} from './validate-image-file'

function file(
  name: string,
  size: number,
  type: string
): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('validateImageFile', () => {
  it('rejeita arquivo vazio', () => {
    const empty = new File([], 'empty.png', { type: 'image/png' })
    expect(validateImageFile(empty)).toMatch(/válida/i)
    expect(
      validateImageFile(empty, { emptyMessage: 'Arquivo mobile inválido.' })
    ).toBe('Arquivo mobile inválido.')
  })

  it('rejeita arquivo acima do limite padrão (5 MB)', () => {
    const large = file('big.png', DEFAULT_IMAGE_MAX_BYTES + 1, 'image/png')
    expect(validateImageFile(large)).toMatch(/5 MB/)
  })

  it('aceita limite customizado (2 MB)', () => {
    const large = file('logo.png', LOGO_IMAGE_MAX_BYTES + 1, 'image/png')
    expect(
      validateImageFile(large, {
        maxBytes: LOGO_IMAGE_MAX_BYTES,
        sizeMessage: 'Logo deve ter no máximo 2 MB.',
      })
    ).toBe('Logo deve ter no máximo 2 MB.')
  })

  it('aceita png válido', () => {
    expect(validateImageFile(file('a.png', 100, 'image/png'))).toBeNull()
  })

  it('aceita extensão quando MIME ausente (fallback)', () => {
    expect(validateImageFile(file('a.jpg', 100, ''))).toBeNull()
  })

  it('rejeita formato inválido sem fallback de extensão', () => {
    expect(
      validateImageFile(file('a.gif', 100, 'image/gif'), {
        allowExtensionFallback: false,
      })
    ).toMatch(/Formato aceito/)
  })

  it('rejeita extensão inválida com MIME vazio e fallback desligado', () => {
    expect(
      validateImageFile(file('a.gif', 100, ''), { allowExtensionFallback: false })
    ).toMatch(/Formato aceito/)
  })

  it('mensagens customizadas de cliente upload', () => {
    const large = file('x.jpg', DEFAULT_IMAGE_MAX_BYTES + 1, 'image/jpeg')
    expect(
      validateImageFile(large, {
        sizeMessage: 'Arquivo excede 5 MB',
        formatMessage: 'Formato inválido',
      })
    ).toBe('Arquivo excede 5 MB')

    expect(
      validateImageFile(file('x.gif', 100, 'image/gif'), {
        formatMessage: 'Formato inválido',
        allowExtensionFallback: false,
      })
    ).toBe('Formato inválido')
  })
})

describe('helpers', () => {
  it('isAllowedImageMime', () => {
    expect(isAllowedImageMime('image/jpeg')).toBe(true)
    expect(isAllowedImageMime('image/gif')).toBe(false)
  })

  it('isAllowedImageExtension', () => {
    expect(isAllowedImageExtension('photo.JPEG')).toBe(true)
    expect(isAllowedImageExtension('photo.gif')).toBe(false)
  })

  it('mimeToImageExt', () => {
    expect(mimeToImageExt('image/png')).toBe('png')
    expect(mimeToImageExt('image/webp')).toBe('webp')
    expect(mimeToImageExt('unknown')).toBe('jpg')
  })
})
