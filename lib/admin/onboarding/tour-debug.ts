export function isOnboardingDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEBUG_ONBOARDING === 'true'
}

export function tourDebug(event: string, detail?: Record<string, unknown>): void {
  if (!isOnboardingDebugEnabled()) return
  if (detail) {
    console.info(`[onboarding] ${event}`, detail)
  } else {
    console.info(`[onboarding] ${event}`)
  }
}
