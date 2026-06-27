'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { OnboardingProgressItem, OnboardingStepId } from '@/types/admin-onboarding'
import { getButtonClassName } from '@/components/ui/button'
import {
  completeOnboardingIfReadyAction,
  markFirstSaleStepAction,
  markStorefrontReviewedAction,
} from '@/lib/admin/onboarding/actions'
import { useAdminOnboarding } from '@/hooks/use-admin-onboarding'

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-soft-cloud">
      <div
        className="h-full rounded-full bg-ink transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

function ManualStepActions({
  stepId,
  siteUrl,
}: {
  stepId: OnboardingStepId
  siteUrl: string
}) {
  const router = useRouter()
  const { setState } = useAdminOnboarding()
  const [isPending, startTransition] = useTransition()

  if (stepId === 'review-storefront') {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await markStorefrontReviewedAction()
            if (result.ok) {
              setState(result.state)
              router.refresh()
            }
          })
        }
        className={getButtonClassName('outline', 'sm', 'mt-2')}
      >
        Marquei como revisado
      </button>
    )
  }

  if (stepId === 'first-sale') {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(siteUrl)}
          className={getButtonClassName('outline', 'sm')}
        >
          Copiar link da loja
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Confira nossa loja: ${siteUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={getButtonClassName('outline', 'sm')}
        >
          Compartilhar no WhatsApp
        </a>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await markFirstSaleStepAction()
              if (result.ok) {
                setState(result.state)
                router.refresh()
              }
            })
          }
          className={getButtonClassName('default', 'sm')}
        >
          Marquei como compartilhado
        </button>
      </div>
    )
  }

  return null
}

export function DeploymentCenterCard() {
  const router = useRouter()
  const { progress, setState } = useAdminOnboarding()
  const [isPending, startTransition] = useTransition()

  const visibleItems = progress.items.filter((item: OnboardingProgressItem) => !item.hidden)

  function handleComplete() {
    startTransition(async () => {
      const result = await completeOnboardingIfReadyAction(progress.percentComplete)
      if (result.ok) {
        setState(result.state)
        router.refresh()
      }
    })
  }

  return (
    <section
      className="mb-10 rounded-lg border border-hairline bg-canvas p-6"
      data-onboarding="deployment-center"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Centro de Implantação</h2>
          <p className="mt-1 text-sm text-mute">{progress.headline}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums text-ink">{progress.percentComplete}%</span>
          <p className="text-xs text-mute">concluído</p>
        </div>
      </div>

      <ProgressBar percent={progress.percentComplete} />

      <ul className="mt-6 space-y-4">
        {visibleItems.map((item: OnboardingProgressItem) => (
          <li
            key={item.id}
            data-onboarding={item.id === 'review-storefront' ? 'review-storefront' : undefined}
            className="flex flex-col gap-1 border-b border-hairline pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                    item.completed
                      ? 'bg-ink text-canvas'
                      : 'border border-hairline text-mute'
                  }`}
                  aria-hidden
                >
                  {item.completed ? '✓' : '○'}
                </span>
                <Link href={item.href} className="font-medium text-ink hover:text-accent">
                  {item.label}
                </Link>
                {item.weight > 0 && (
                  <span className="text-xs text-mute">({item.weight}%)</span>
                )}
              </div>
              <p className="mt-1 pl-7 text-sm text-mute">{item.context}</p>
              {(item.id === 'review-storefront' || item.id === 'first-sale') && !item.completed && (
                <div className="pl-7">
                  <ManualStepActions stepId={item.id} siteUrl={progress.siteUrl} />
                </div>
              )}
            </div>
            <span className="pl-7 text-xs font-medium sm:pl-0 sm:pt-1">
              {item.completed ? (
                <span className="text-ink">Concluído</span>
              ) : (
                <span className="text-mute">Pendente</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {progress.percentComplete >= 100 && (
        <div className="mt-6 rounded-lg border border-hairline bg-soft-cloud px-4 py-3">
          <p className="text-sm font-medium text-ink">Sua loja está pronta para receber clientes.</p>
          <button
            type="button"
            disabled={isPending}
            onClick={handleComplete}
            className={getButtonClassName('default', 'sm', 'mt-3')}
          >
            Acessar painel
          </button>
        </div>
      )}
    </section>
  )
}
