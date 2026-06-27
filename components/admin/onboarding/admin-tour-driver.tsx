'use client'

import { useReducedMotion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import {
  createTourController,
  readTourResume,
  type TourController,
} from '@/lib/admin/onboarding/tour-controller'
import type { TourStepId } from '@/lib/admin/onboarding/tour-steps'
import 'driver.js/dist/driver.css'
import './admin-tour-theme.css'

const RESUME_FAILED_MESSAGE = 'Não foi possível continuar o tutorial.'

type AdminTourDriverProps = {
  onActiveChange: (active: boolean) => void
  startTourRef: MutableRefObject<((stepId?: TourStepId) => void) | null>
}

export function AdminTourDriver({ onActiveChange, startTourRef }: AdminTourDriverProps) {
  const router = useRouter()
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion() ?? false
  const controllerRef = useRef<TourController | null>(null)
  const pendingStartRef = useRef<TourStepId | null>(null)
  const resumeHandledRef = useRef<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 5000)
  }, [])

  const runStart = useCallback(
    (stepId: TourStepId = 'deployment-center') => {
      resumeHandledRef.current = null
      if (stepId === 'deployment-center' && pathname !== '/admin') {
        pendingStartRef.current = stepId
        router.push('/admin')
        return
      }
      controllerRef.current?.start(stepId)
    },
    [pathname, router]
  )

  useEffect(() => {
    startTourRef.current = runStart
    return () => {
      startTourRef.current = null
    }
  }, [runStart, startTourRef])

  useEffect(() => {
    const controller = createTourController({
      reducedMotion: prefersReducedMotion,
      onNavigate: (path) => router.push(path),
      onTourActiveChange: onActiveChange,
      onResumeFailed: () => showToast(RESUME_FAILED_MESSAGE),
      onPhaseComplete: (message) => showToast(message),
    })

    controllerRef.current = controller

    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [onActiveChange, prefersReducedMotion, router, showToast])

  useEffect(() => {
    const resume = readTourResume()
    if (!resume) return

    const resumeKey = `${pathname}:${resume.stepId}`
    if (resumeHandledRef.current === resumeKey) return

    const stepRoute = resume.stepId === 'settings-form' ? '/admin/settings' : '/admin'
    if (pathname !== stepRoute) return

    resumeHandledRef.current = resumeKey
    void controllerRef.current?.resume(resume.stepId)
  }, [pathname])

  useEffect(() => {
    if (pathname !== '/admin' || !pendingStartRef.current) return
    const stepId = pendingStartRef.current
    pendingStartRef.current = null
    controllerRef.current?.start(stepId)
  }, [pathname])

  if (!toast) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[60] max-w-md -translate-x-1/2 rounded-xl border border-hairline bg-canvas px-4 py-3 text-sm text-ink shadow-lg"
    >
      {toast}
    </div>
  )
}
