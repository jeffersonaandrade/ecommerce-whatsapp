import { driver, type Config, type DriveStep, type Driver } from 'driver.js'
import { tourDebug } from './tour-debug'
import {
  FULL_TOUR_STEPS,
  TOUR_COMPLETION_MESSAGE,
  TOUR_PHASE,
  findStepIndex,
  formatStepDescription,
  getStepById,
  isFinalTourStep,
  resolveApplicableSteps,
  resolveNavigationAfterStep,
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
  onTourComplete: (message: string) => void
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

function hasNextOnSameRoute(stepDef: TourStepDef, visibleSteps: TourStepDef[]): boolean {
  const index = findStepIndex(stepDef.id, visibleSteps)
  if (index < 0 || index >= visibleSteps.length - 1) return false
  return visibleSteps[index + 1]?.route === stepDef.route
}

function buildDriverSteps(
  visibleSteps: TourStepDef[],
  callbacks: TourControllerCallbacks
): DriveStep[] {
  return visibleSteps.map((stepDef, index) => {
    const isFinalStep = isFinalTourStep(stepDef)
    const isFirst = index === 0

    const driveStep: DriveStep = {
      element: stepDef.target,
      popover: {
        title: stepDef.title,
        description: formatStepDescription(stepDef),
        showButtons: ['previous', 'next', 'close'],
        nextBtnText: isFinalStep ? 'Concluir' : 'Próximo',
        prevBtnText: 'Voltar',
        onNextClick: isFinalStep
          ? (_element, _step, { driver: driverInstance }) => {
              tourDebug('destroy', { reason: 'tour-complete', stepId: stepDef.id })
              clearTourResume()
              driverInstance.destroy()
              callbacks.onTourActiveChange(false)
              callbacks.onTourComplete(TOUR_COMPLETION_MESSAGE)
            }
          : hasNextOnSameRoute(stepDef, visibleSteps)
            ? (_element, _step, { driver: driverInstance }) => {
                driverInstance.moveNext()
              }
            : (_element, _step, { driver: driverInstance }) => {
                const target = resolveNavigationAfterStep(stepDef.id)
                if (!target) {
                  tourDebug('navigate skipped', { from: stepDef.id, reason: 'no-next-step' })
                  return
                }
                tourDebug('navigate', {
                  from: stepDef.id,
                  to: target.path,
                  resumeStepId: target.resumeStepId,
                })
                writeTourResume({ phase: TOUR_PHASE, stepId: target.resumeStepId })
                driverInstance.destroy()
                callbacks.onTourActiveChange(false)
                callbacks.onNavigate(target.path)
              },
        onPrevClick: isFirst
          ? undefined
          : (_element, _step, { driver: driverInstance }) => {
              driverInstance.movePrevious()
            },
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
    const applicable = resolveApplicableSteps(FULL_TOUR_STEPS)
    const visibleSteps = resolveVisibleSteps(applicable)
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

export { resolveNavigationAfterStep }
