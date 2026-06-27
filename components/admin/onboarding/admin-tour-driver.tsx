'use client'

import { useReducedMotion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import {
  createTourController,
  readTourResume,
  type TourController,
} from '@/lib/admin/onboarding/tour-controller'
import { getStepRoute, type TourStepId } from '@/lib/admin/onboarding/tour-steps'
import 'driver.js/dist/driver.css'
import './admin-tour-theme.css'

const RESUME_FAILED_MESSAGE = 'Não foi possível continuar o tutorial.'

type AdminTourDriverProps = {
  migrationToolsEnabled: boolean
  onActiveChange: (active: boolean) => void
  onTourComplete: (message: string) => void
  startTourRef: MutableRefObject<((stepId?: TourStepId) => void) | null>
}

export function AdminTourDriver({
  migrationToolsEnabled,
  onActiveChange,
  onTourComplete,
  startTourRef,
}: AdminTourDriverProps) {
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
      const stepRoute = getStepRoute(stepId)
      if (pathname !== stepRoute) {
        pendingStartRef.current = stepId
        router.push(stepRoute)
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
      migrationToolsEnabled,
      onNavigate: (path) => router.push(path),
      onTourActiveChange: onActiveChange,
      onResumeFailed: () => showToast(RESUME_FAILED_MESSAGE),
      onTourComplete: (message) => {
        showToast(message)
        onTourComplete(message)
      },
    })

    controllerRef.current = controller

    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [migrationToolsEnabled, onActiveChange, onTourComplete, prefersReducedMotion, router, showToast])

  useEffect(() => {
    const resume = readTourResume()
    if (!resume) return

    const resumeKey = `${pathname}:${resume.stepId}`
    if (resumeHandledRef.current === resumeKey) return

    const stepRoute = getStepRoute(resume.stepId)
    if (pathname !== stepRoute) return

    resumeHandledRef.current = resumeKey
    void controllerRef.current?.resume(resume.stepId)
  }, [pathname])

  useEffect(() => {
    if (!pendingStartRef.current) return
    const stepId = pendingStartRef.current
    const stepRoute = getStepRoute(stepId)
    if (pathname !== stepRoute) return

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
