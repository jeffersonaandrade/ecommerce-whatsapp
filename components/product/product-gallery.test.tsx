/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ProductGallery } from './product-gallery'

afterEach(() => cleanup())

vi.mock('./product-image', () => ({
  ProductImage: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-testid="gallery-image" />
  ),
}))

describe('ProductGallery', () => {
  const images = [
    'https://example.com/1.webp',
    'https://example.com/2.webp',
    'https://example.com/3.webp',
  ]

  it('troca imagem principal ao clicar na miniatura', () => {
    render(<ProductGallery images={images} alt="Camisa teste" />)

    fireEvent.click(screen.getByRole('button', { name: 'Ver imagem 2' }))

    expect(
      screen.getAllByTestId('gallery-image').some((img) => img.getAttribute('src') === images[1])
    ).toBe(true)
  })

  it('avança com botão próximo', () => {
    render(<ProductGallery images={images} alt="Camisa teste" />)

    fireEvent.click(screen.getByRole('button', { name: 'Próxima imagem' }))

    expect(screen.getByText('2 / 3')).toBeTruthy()
  })
})
