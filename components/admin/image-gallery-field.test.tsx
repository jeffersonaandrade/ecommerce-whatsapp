// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageGalleryField } from './image-gallery-field'

const uploadProductImageAction = vi.fn()

vi.mock('@/lib/catalog/actions', () => ({
  uploadProductImageAction: (...args: unknown[]) => uploadProductImageAction(...args),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

describe('ImageGalleryField', () => {
  beforeEach(() => {
    uploadProductImageAction.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('envia várias imagens em ordem em uma única seleção', async () => {
    const onChange = vi.fn()
    uploadProductImageAction
      .mockResolvedValueOnce({ ok: true, url: 'https://cdn.test/01.webp' })
      .mockResolvedValueOnce({ ok: true, url: 'https://cdn.test/02.webp' })
      .mockResolvedValueOnce({ ok: true, url: 'https://cdn.test/03.webp' })

    render(
      <ImageGalleryField
        images={[]}
        onChange={onChange}
        productSlug="produto-teste"
        uploadEnabled
      />,
    )

    const input = screen.getByLabelText('Selecionar imagens do produto') as HTMLInputElement
    const files = [
      new File(['one'], '01.jpg', { type: 'image/jpeg' }),
      new File(['two'], '02.png', { type: 'image/png' }),
      new File(['three'], '03.webp', { type: 'image/webp' }),
    ]

    expect(input.multiple).toBe(true)
    fireEvent.change(input, { target: { files } })

    await waitFor(() => expect(uploadProductImageAction).toHaveBeenCalledTimes(3))
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith([
      'https://cdn.test/01.webp',
      'https://cdn.test/02.webp',
      'https://cdn.test/03.webp',
    ])
  })

  it('respeita o limite total de cinco imagens', async () => {
    const onChange = vi.fn()
    const existingImages = [
      'https://cdn.test/a.webp',
      'https://cdn.test/b.webp',
      'https://cdn.test/c.webp',
      'https://cdn.test/d.webp',
    ]
    uploadProductImageAction.mockResolvedValueOnce({
      ok: true,
      url: 'https://cdn.test/e.webp',
    })

    render(
      <ImageGalleryField
        images={existingImages}
        onChange={onChange}
        productSlug="produto-teste"
        uploadEnabled
      />,
    )

    const input = screen.getByLabelText('Selecionar imagens do produto')
    fireEvent.change(input, {
      target: {
        files: [
          new File(['five'], '05.jpg', { type: 'image/jpeg' }),
          new File(['six'], '06.jpg', { type: 'image/jpeg' }),
        ],
      },
    })

    await waitFor(() => expect(uploadProductImageAction).toHaveBeenCalledOnce())
    expect(onChange).toHaveBeenCalledWith([
      ...existingImages,
      'https://cdn.test/e.webp',
    ])
    expect(screen.getByText(/1 arquivo foi ignorado/i)).toBeTruthy()
  })
})
