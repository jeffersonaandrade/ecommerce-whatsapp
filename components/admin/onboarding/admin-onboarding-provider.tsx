'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { AdminOnboardingState, OnboardingProgress } from '@/types/admin-onboarding'
import { completeTourAction } from '@/lib/admin/onboarding/actions'
import type { TourStepId } from '@/lib/admin/onboarding/tour-steps'
import { AdminTourDriver } from './admin-tour-driver'
import { WelcomeModal } from './welcome-modal'

type AdminOnboardingContextValue = {
  state: AdminOnboardingState
  progress: OnboardingProgress
  setState: (state: AdminOnboardingState) => void
  showWelcomeModal: boolean
  openWelcomeModal: () => void
  closeWelcomeModal: () => void
  storeMature: boolean
  startTour: (stepId?: TourStepId) => void
  stopTour: () => void
  isTourActive: boolean
}

const AdminOnboardingContext = createContext<AdminOnboardingContextValue | null>(null)

type AdminOnboardingProviderProps = {
  initialState: AdminOnboardingState
  initialProgress: OnboardingProgress
  migrationToolsEnabled: boolean
  children: ReactNode
}

export function AdminOnboardingProvider({
  initialState,
  initialProgress,
  migrationToolsEnabled,
  children,
}: AdminOnboardingProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const [forceWelcome, setForceWelcome] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)
  const startTourRef = useRef<((stepId?: TourStepId) => void) | null>(null)
  const [, startTransition] = useTransition()

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

  const startTour = useCallback((stepId: TourStepId = 'deployment-center') => {
    startTourRef.current?.(stepId)
  }, [])

  const stopTour = useCallback(() => {
    setIsTourActive(false)
  }, [])

  const handleTourComplete = useCallback(() => {
    startTransition(async () => {
      const result = await completeTourAction()
      if (result.ok) {
        setState(result.state)
        router.refresh()
      }
    })
  }, [router])

  const value = useMemo(
    () => ({
      state,
      progress,
      setState,
      showWelcomeModal,
      openWelcomeModal,
      closeWelcomeModal,
      storeMature: progress.storeMature,
      startTour,
      stopTour,
      isTourActive,
    }),
    [
      state,
      progress,
      showWelcomeModal,
      openWelcomeModal,
      closeWelcomeModal,
      startTour,
      stopTour,
      isTourActive,
    ]
  )

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <AdminOnboardingContext.Provider value={value}>
      {children}
      <AdminTourDriver
        migrationToolsEnabled={migrationToolsEnabled}
        onActiveChange={setIsTourActive}
        onTourComplete={handleTourComplete}
        startTourRef={startTourRef}
      />
      <WelcomeModal
        open={showWelcomeModal}
        storeMature={progress.storeMature}
        onStateChange={setState}
        onClose={closeWelcomeModal}
        onStartTour={startTour}
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
