'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import type { AdminOnboardingState, OnboardingProgress } from '@/types/admin-onboarding'
import { WelcomeModal } from './welcome-modal'

type AdminOnboardingContextValue = {
  state: AdminOnboardingState
  progress: OnboardingProgress
  setState: (state: AdminOnboardingState) => void
  showWelcomeModal: boolean
  openWelcomeModal: () => void
  closeWelcomeModal: () => void
  storeMature: boolean
}

const AdminOnboardingContext = createContext<AdminOnboardingContextValue | null>(null)

type AdminOnboardingProviderProps = {
  initialState: AdminOnboardingState
  initialProgress: OnboardingProgress
  children: ReactNode
}

export function AdminOnboardingProvider({
  initialState,
  initialProgress,
  children,
}: AdminOnboardingProviderProps) {
  const pathname = usePathname()
  const [state, setState] = useState(initialState)
  const [forceWelcome, setForceWelcome] = useState(false)

  useEffect(() => {
    setState(initialState)
  }, [initialState])

  const progress = initialProgress

  const isLogin = pathname === '/admin/login'

  const shouldShowWelcome =
    !isLogin &&
    !state.skipped &&
    !state.tourStarted &&
    !state.tourCompleted

  const showWelcomeModal = shouldShowWelcome || forceWelcome

  const openWelcomeModal = useCallback(() => setForceWelcome(true), [])
  const closeWelcomeModal = useCallback(() => setForceWelcome(false), [])

  const value = useMemo(
    () => ({
      state,
      progress,
      setState,
      showWelcomeModal,
      openWelcomeModal,
      closeWelcomeModal,
      storeMature: progress.storeMature,
    }),
    [state, progress, showWelcomeModal, openWelcomeModal, closeWelcomeModal]
  )

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <AdminOnboardingContext.Provider value={value}>
      {children}
      <WelcomeModal
        open={showWelcomeModal}
        storeMature={progress.storeMature}
        onStateChange={setState}
        onClose={closeWelcomeModal}
      />
    </AdminOnboardingContext.Provider>
  )
}

export function useAdminOnboardingContext(): AdminOnboardingContextValue {
  const ctx = useContext(AdminOnboardingContext)
  if (!ctx) {
    throw new Error('useAdminOnboardingContext must be used within AdminOnboardingProvider')
  }
  return ctx
}
