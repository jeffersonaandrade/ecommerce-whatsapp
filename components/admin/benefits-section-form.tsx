'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { updateBenefitsSectionAction } from '@/lib/benefits/benefit-actions'

type BenefitsSectionFormProps = {
  benefitsEyebrow: string
  benefitsTitle: string
}

export function BenefitsSectionForm({
  benefitsEyebrow: initialEyebrow,
  benefitsTitle: initialTitle,
}: BenefitsSectionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [benefitsEyebrow, setBenefitsEyebrow] = useState(initialEyebrow)
  const [benefitsTitle, setBenefitsTitle] = useState(initialTitle)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updateBenefitsSectionAction({ benefitsEyebrow, benefitsTitle })
      if (result.ok) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">Cabeçalho da seção</h2>
        <p className="mt-1 text-sm text-mute">Eyebrow e título exibidos acima dos cards na home.</p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Cabeçalho salvo." />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="benefitsEyebrow" className="mb-1 block text-sm font-medium text-ink">
            Eyebrow
          </label>
          <input
            id="benefitsEyebrow"
            value={benefitsEyebrow}
            onChange={(e) => setBenefitsEyebrow(e.target.value)}
            maxLength={80}
            required
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="benefitsTitle" className="mb-1 block text-sm font-medium text-ink">
            Título
          </label>
          <input
            id="benefitsTitle"
            value={benefitsTitle}
            onChange={(e) => setBenefitsTitle(e.target.value)}
            maxLength={80}
            required
            className="w-full rounded-md border border-hairline px-3 py-2 text-sm"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? 'Salvando…' : 'Salvar cabeçalho'}
      </Button>
    </form>
  )
}
