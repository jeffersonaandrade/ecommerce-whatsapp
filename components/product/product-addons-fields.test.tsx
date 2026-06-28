/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductAddonsFields } from './product-addons-fields'
import { PersonalizationSettings } from '@/types/personalization-settings'

const settings: PersonalizationSettings = {
  enabled: true,
  defaultPrice: 30,
  nameMaxLength: 15,
  numberMin: 1,
  numberMax: 99,
  notesRequired: false,
  notesMaxLength: 200,
  updatedAt: '',
}

describe('ProductAddonsFields', () => {
  it('abre campos quando initialEnabled é true', () => {
    const onChange = vi.fn()

    render(
      <ProductAddonsFields
        settings={settings}
        unitPrice={30}
        initialEnabled
        onChange={onChange}
      />
    )

    expect(screen.getByLabelText('Nome na camisa')).toBeTruthy()
    expect(screen.getByLabelText('Número')).toBeTruthy()
    expect(onChange).toHaveBeenCalledWith(true, {
      name: '',
      number: '',
      notes: undefined,
    })
  })
})
