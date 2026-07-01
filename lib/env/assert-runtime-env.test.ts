import { afterEach, describe, expect, it } from 'vitest'
import {
  assertProductionSupabaseRuntime,
  isProductionNonSupabaseRuntime,
  productionNonSupabaseMessage,
} from './assert-runtime-env'

const env = process.env

afterEach(() => {
  process.env = { ...env }
})

describe('assert-runtime-env', () => {
  it('allows json mode in development', () => {
    process.env.NODE_ENV = 'development'
    process.env.DATA_PROVIDER = 'json'
    expect(isProductionNonSupabaseRuntime()).toBe(false)
    expect(() => assertProductionSupabaseRuntime('test')).not.toThrow()
  })

  it('allows supabase in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.DATA_PROVIDER = 'supabase'
    expect(isProductionNonSupabaseRuntime()).toBe(false)
  })

  it('blocks json mode in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.DATA_PROVIDER = 'json'
    expect(isProductionNonSupabaseRuntime()).toBe(true)
    expect(() => assertProductionSupabaseRuntime('middleware')).toThrow(
      productionNonSupabaseMessage('middleware')
    )
  })

  it('blocks missing provider in production', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.DATA_PROVIDER
    expect(isProductionNonSupabaseRuntime()).toBe(true)
  })
})
