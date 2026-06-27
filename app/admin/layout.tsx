import { AdminOnboardingProvider } from '@/components/admin/onboarding/admin-onboarding-provider'
import { computeOnboardingProgress } from '@/lib/admin/onboarding/detect-progress'
import { getOnboardingState } from '@/lib/admin/onboarding/get-onboarding-repository'
import { isMigrationToolsEnabled } from '@/lib/env/migration-tools'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const onboardingState = await getOnboardingState()
  const progress = await computeOnboardingProgress(onboardingState)
  const migrationToolsEnabled = isMigrationToolsEnabled()

  return (
    <AdminOnboardingProvider
      initialState={onboardingState}
      initialProgress={progress}
      migrationToolsEnabled={migrationToolsEnabled}
    >
      {children}
    </AdminOnboardingProvider>
  )
}
