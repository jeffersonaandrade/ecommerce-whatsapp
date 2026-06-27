export type OnboardingStepId =
  | 'store-settings'
  | 'products'
  | 'review-media'
  | 'categories'
  | 'banner-desktop'
  | 'banner-mobile'
  | 'review-storefront'
  | 'first-sale'
  | 'complete'

export type AdminOnboardingState = {
  version: 1
  skipped: boolean
  tourStarted: boolean
  tourCompleted: boolean
  currentStep: OnboardingStepId | null
  manuallyCompletedSteps: OnboardingStepId[]
  completedAt: string | null
  updatedAt: string | null
}

export type OnboardingProgressItem = {
  id: OnboardingStepId
  label: string
  href: string
  weight: number
  completed: boolean
  autoCompleted: boolean
  context: string
  hidden?: boolean
}

export type OnboardingProgress = {
  items: OnboardingProgressItem[]
  percentComplete: number
  headline: string
  storeMature: boolean
  siteUrl: string
}
