import { describe, expect, it } from 'vitest'
import {
  DEFAULT_HEADER_BRAND_DISPLAY,
  HEADER_LOGO_CLASS_BOTH,
  HEADER_LOGO_CLASS_LOGO_ONLY,
  isValidHeaderBrandDisplay,
  normalizeHeaderBrandDisplay,
  resolveHeaderBrandRender,
} from './header-brand-display'

describe('header-brand-display', () => {
  it('validates allowed display modes', () => {
    expect(isValidHeaderBrandDisplay('both')).toBe(true)
    expect(isValidHeaderBrandDisplay('logo_only')).toBe(true)
    expect(isValidHeaderBrandDisplay('name_only')).toBe(true)
    expect(isValidHeaderBrandDisplay('invalid')).toBe(false)
  })

  it('normalizes invalid values to fallback', () => {
    expect(normalizeHeaderBrandDisplay('logo_only')).toBe('logo_only')
    expect(normalizeHeaderBrandDisplay('oops', 'name_only')).toBe('name_only')
    expect(normalizeHeaderBrandDisplay(undefined)).toBe(DEFAULT_HEADER_BRAND_DISPLAY)
  })

  it('both with logo shows compact logo and name', () => {
    const render = resolveHeaderBrandRender('both', true)
    expect(render.showLogo).toBe(true)
    expect(render.showName).toBe(true)
    expect(render.logoClassName).toBe(HEADER_LOGO_CLASS_BOTH)
  })

  it('both without logo shows initial fallback and name', () => {
    const render = resolveHeaderBrandRender('both', false)
    expect(render.showLogo).toBe(false)
    expect(render.showInitialFallback).toBe(true)
    expect(render.showName).toBe(true)
  })

  it('logo_only with logo hides name and uses larger logo', () => {
    const render = resolveHeaderBrandRender('logo_only', true)
    expect(render.showLogo).toBe(true)
    expect(render.showName).toBe(false)
    expect(render.logoClassName).toBe(HEADER_LOGO_CLASS_LOGO_ONLY)
  })

  it('logo_only without logo falls back to name', () => {
    const render = resolveHeaderBrandRender('logo_only', false)
    expect(render.showLogo).toBe(false)
    expect(render.showName).toBe(true)
    expect(render.showInitialFallback).toBe(false)
  })

  it('name_only never shows logo', () => {
    const render = resolveHeaderBrandRender('name_only', true)
    expect(render.showLogo).toBe(false)
    expect(render.showName).toBe(true)
  })
})
