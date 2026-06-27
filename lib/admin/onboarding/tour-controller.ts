import { driver, type Config, type DriveStep, type Driver } from 'driver.js'
import { tourDebug } from './tour-debug'
import {
  PHASE_2_COMPLETION_MESSAGE,
  PHASE_2_TOUR_STEPS,
  TOUR_PHASE,
  findStepIndex,
  getStepById,
  type TourStepDef,
  type TourStepId,
} from './tour-steps'

export const TOUR_RESUME_STORAGE_KEY = 'admin-onboarding-tour-resume'

export type TourResumePayload = {
  phase: typeof TOUR_PHASE
  stepId: TourStepId
}

export const DEFAULT_WAIT_FOR_TARGET = {
  timeout: 2500,
  interval: 100,
} as const

export type WaitForTargetOptions = {
  timeout?: number
  interval?: number
}

export type TourControllerCallbacks = {
  onNavigate: (path: string) => void
  onTourActiveChange: (active: boolean) => void
  onResumeFailed: (stepId: TourStepId) => void
  onPhaseComplete: (message: string) => void
  reducedMotion: boolean
}

export type TourController = {
  start: (stepId?: TourStepId) => void
  resume: (stepId: TourStepId) => Promise<void>
  destroy: () => void
  isActive: () => boolean
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
}

export function readTourResume(): TourResumePayload | null {
  if (!isBrowser()) return null
  try {
    const raw = sessionStorage.getItem(TOUR_RESUME_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TourResumePayload
    if (parsed?.phase !== TOUR_PHASE || !parsed?.stepId) return null
    if (!getStepById(parsed.stepId)) return null
    return parsed
  } catch {
    return null
  }
}

export function writeTourResume(payload: TourResumePayload): void {
  if (!isBrowser()) return
  sessionStorage.setItem(TOUR_RESUME_STORAGE_KEY, JSON.stringify(payload))
  tourDebug('resume saved', { stepId: payload.stepId })
}

export function clearTourResume(): void {
  if (!isBrowser()) return
  sessionStorage.removeItem(TOUR_RESUME_STORAGE_KEY)
}

export function waitForTarget(
  selector: string,
  options: WaitForTargetOptions = {}
): Promise<Element | null> {
  const timeout = options.timeout ?? DEFAULT_WAIT_FOR_TARGET.timeout
  const interval = options.interval ?? DEFAULT_WAIT_FOR_TARGET.interval

  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null)
      return
    }

    const startedAt = Date.now()

    const check = () => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }
      if (Date.now() - startedAt >= timeout) {
        resolve(null)
        return
      }
      window.setTimeout(check, interval)
    }

    check()
  })
}

function resolveVisibleSteps(steps: TourStepDef[]): TourStepDef[] {
  if (typeof document === 'undefined') return steps
  return steps.filter((step) => {
    if (!step.skipIfMissing) return true
    return Boolean(document.querySelector(step.target))
  })
}

function buildDriverSteps(
  steps: TourStepDef[],
  callbacks: TourControllerCallbacks
): DriveStep[] {
  return steps.map((stepDef, index) => {
    const isLast = index === steps.length - 1

    const driveStep: DriveStep = {
      element: stepDef.target,
      popover: {
        title: stepDef.title,
        description: stepDef.description,
        showButtons: ['previous', 'next', 'close'],
        nextBtnText: isLast ? 'Concluir' : 'Próximo',
        prevBtnText: 'Voltar',
        onNextClick: isLast
          ? (_element, _step, { driver: driverInstance }) => {
              tourDebug('destroy', { reason: 'phase-complete', stepId: stepDef.id })
              clearTourResume()
              driverInstance.destroy()
              callbacks.onTourActiveChange(false)
              callbacks.onPhaseComplete(PHASE_2_COMPLETION_MESSAGE)
            }
          : stepDef.navigateOnNext && stepDef.resumeStepId
            ? (_element, _step, { driver: driverInstance }) => {
                tourDebug('navigate', {
                  from: stepDef.id,
                  to: stepDef.navigateOnNext,
                  resumeStepId: stepDef.resumeStepId,
                })
                writeTourResume({ phase: TOUR_PHASE, stepId: stepDef.resumeStepId! })
                driverInstance.destroy()
                callbacks.onTourActiveChange(false)
                callbacks.onNavigate(stepDef.navigateOnNext!)
              }
            : undefined,
        onCloseClick: (_element, _step, { driver: driverInstance }) => {
          tourDebug('destroy', { reason: 'close', stepId: stepDef.id })
          clearTourResume()
          driverInstance.destroy()
          callbacks.onTourActiveChange(false)
        },
      },
    }

    return driveStep
  })
}

function createDriverConfig(
  driverSteps: DriveStep[],
  callbacks: TourControllerCallbacks
): Config {
  return {
    steps: driverSteps,
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    animate: !callbacks.reducedMotion,
    smoothScroll: !callbacks.reducedMotion,
    allowClose: true,
    overlayOpacity: 0.6,
    popoverClass: 'admin-tour-popover',
    nextBtnText: 'Próximo',
    prevBtnText: 'Voltar',
    doneBtnText: 'Concluir',
    onDestroyed: () => {
      callbacks.onTourActiveChange(false)
    },
  }
}

export function createTourController(callbacks: TourControllerCallbacks): TourController {
  let driverInstance: Driver | null = null

  function destroy() {
    if (driverInstance?.isActive()) {
      driverInstance.destroy()
    }
    driverInstance = null
    clearTourResume()
    callbacks.onTourActiveChange(false)
    tourDebug('destroy')
  }

  function driveAtStepId(stepId: TourStepId) {
    const visibleSteps = resolveVisibleSteps(PHASE_2_TOUR_STEPS)
    const stepDef = getStepById(stepId, visibleSteps)
    if (!stepDef) {
      tourDebug('start skipped', { stepId, reason: 'target-missing' })
      return
    }

    const index = findStepIndex(stepId, visibleSteps)
    if (index < 0) return

    if (driverInstance?.isActive()) {
      driverInstance.destroy()
    }

    const driverSteps = buildDriverSteps(visibleSteps, callbacks)
    driverInstance = driver(createDriverConfig(driverSteps, callbacks))
    callbacks.onTourActiveChange(true)
    tourDebug('step', { stepId })
    driverInstance.drive(index)
  }

  return {
    start(stepId: TourStepId = 'deployment-center') {
      tourDebug('startTour', { stepId })
      clearTourResume()
      driveAtStepId(stepId)
    },

    async resume(stepId: TourStepId) {
      tourDebug('resume', { stepId })
      const element = await waitForTarget(
        getStepById(stepId)?.target ?? `[data-onboarding="${stepId}"]`
      )

      if (!element) {
        tourDebug('resume failed', { stepId })
        destroy()
        callbacks.onResumeFailed(stepId)
        return
      }

      clearTourResume()
      driveAtStepId(stepId)
    },

    destroy,
    isActive: () => driverInstance?.isActive() ?? false,
  }
}
