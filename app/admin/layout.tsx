import { AdminOnboardingProvider } from '@/components/admin/onboarding/admin-onboarding-provider'
import { computeOnboardingProgress } from '@/lib/admin/onboarding/detect-progress'
import { getOnboardingState } from '@/lib/admin/onboarding/get-onboarding-repository'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const onboardingState = await getOnboardingState()
  const progress = await computeOnboardingProgress(onboardingState)

  return (
    <AdminOnboardingProvider initialState={onboardingState} initialProgress={progress}>
      {children}
    </AdminOnboardingProvider>
  )
}
