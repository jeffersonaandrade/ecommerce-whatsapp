// Estado visual de demonstração no browser — sem proteção de rotas; não usar para auth.

export const DEMO_ADMIN_SESSION_KEY = 'demo-admin-session'
export const DEMO_ADMIN_SESSION_EVENT = 'demo-admin-session-change'

export const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@demo.com',
  password: 'demo123',
} as const

function notifyDemoSessionChange(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(DEMO_ADMIN_SESSION_EVENT))
}

export function setDemoAdminFlag(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_ADMIN_SESSION_KEY, '1')
  notifyDemoSessionChange()
}

export function clearDemoAdminFlag(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DEMO_ADMIN_SESSION_KEY)
  notifyDemoSessionChange()
}

export function hasDemoAdminSession(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DEMO_ADMIN_SESSION_KEY) === '1'
}
