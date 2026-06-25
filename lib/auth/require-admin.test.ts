import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@supabase/supabase-js'

const { mockGetUser, mockCreateClient, mockGetDataProvider } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockCreateClient: vi.fn(),
  mockGetDataProvider: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: mockCreateClient,
}))

vi.mock('@/lib/data/provider', () => ({
  getDataProvider: mockGetDataProvider,
}))

import { requireAdmin } from './require-admin'

function adminUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    app_metadata: { role: 'admin' },
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
    ...overrides,
  } as User
}

describe('requireAdmin', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockCreateClient.mockReset()
    mockGetDataProvider.mockReset()
    mockCreateClient.mockResolvedValue({ auth: { getUser: mockGetUser } })
  })

  it('permite em modo json sem checar sessão', async () => {
    mockGetDataProvider.mockReturnValue('json')
    const result = await requireAdmin()
    expect(result).toEqual({ ok: true })
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it('rejeita sem usuário autenticado', async () => {
    mockGetDataProvider.mockReturnValue('supabase')
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await requireAdmin()
    expect(result).toEqual({ ok: false, error: 'Não autenticado' })
  })

  it('rejeita usuário sem role admin', async () => {
    mockGetDataProvider.mockReturnValue('supabase')
    mockGetUser.mockResolvedValue({
      data: { user: adminUser({ app_metadata: { role: 'viewer' } }) },
    })
    const result = await requireAdmin()
    expect(result).toEqual({ ok: false, error: 'Acesso negado' })
  })

  it('aceita usuário com app_metadata.role admin', async () => {
    mockGetDataProvider.mockReturnValue('supabase')
    const user = adminUser()
    mockGetUser.mockResolvedValue({ data: { user } })
    const result = await requireAdmin()
    expect(result).toEqual({ ok: true, user })
  })
})
