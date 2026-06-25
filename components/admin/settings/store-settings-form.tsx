'use client'

import { useState, useTransition } from 'react'
import { StoreSettings } from '@/types/store-settings'
import { getButtonClassName } from '@/components/ui/button'
import {
  updateStoreSettingsAction,
  uploadStoreLogoAction,
} from '@/lib/store/actions'
import { AppearancePreview } from './appearance-preview'

type StoreSettingsFormProps = {
  initial: StoreSettings
}

export function StoreSettingsForm({ initial }: StoreSettingsFormProps) {
  const [settings, setSettings] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      setError(null)
      setSuccess(null)
      const result = await updateStoreSettingsAction({
        storeName: String(data.get('storeName') ?? ''),
        description: String(data.get('description') ?? ''),
        siteUrl: String(data.get('siteUrl') ?? ''),
        whatsappPhone: String(data.get('whatsappPhone') ?? ''),
        whatsappMessagePrefix: String(data.get('whatsappMessagePrefix') ?? ''),
        email: String(data.get('email') ?? ''),
        instagram: String(data.get('instagram') ?? ''),
        facebook: String(data.get('facebook') ?? ''),
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSettings({
        ...settings,
        storeName: String(data.get('storeName') ?? ''),
        description: String(data.get('description') ?? ''),
        siteUrl: String(data.get('siteUrl') ?? '').replace(/\/$/, ''),
        whatsappPhone: String(data.get('whatsappPhone') ?? '').replace(/\D/g, ''),
        whatsappMessagePrefix: String(data.get('whatsappMessagePrefix') ?? ''),
        email: String(data.get('email') ?? ''),
        instagram: String(data.get('instagram') ?? ''),
        facebook: String(data.get('facebook') ?? ''),
      })
      setSuccess('Configurações salvas.')
    })
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      setError(null)
      setSuccess(null)
      const formData = new FormData()
      formData.set('logo', file)
      const result = await uploadStoreLogoAction(formData)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSettings({
        ...settings,
        logoPath: 'logo.webp',
        ogImagePath: 'og-default.jpg',
      })
      setSuccess('Logo processada. Favicon e OG gerados.')
      e.target.value = ''
    })
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <section className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
          <h2 className="text-lg font-semibold text-ink">Institucional</h2>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-ink">
              Nome da loja
              <input
                name="storeName"
                defaultValue={settings.storeName}
                required
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Descrição
              <textarea
                name="description"
                defaultValue={settings.description}
                rows={3}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block text-sm font-medium text-ink">
                E-mail
                <input
                  name="email"
                  type="email"
                  defaultValue={settings.email}
                  className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Instagram
                <input
                  name="instagram"
                  defaultValue={settings.instagram}
                  placeholder="@loja"
                  className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Facebook
                <input
                  name="facebook"
                  defaultValue={settings.facebook}
                  className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
          <h2 className="text-lg font-semibold text-ink">WhatsApp</h2>
          <p className="text-sm text-mute">
            Finalização de pedidos via WhatsApp. Alterações aplicam imediatamente no carrinho.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Telefone (DDI + DDD + número)
              <input
                name="whatsappPhone"
                defaultValue={settings.whatsappPhone}
                required
                placeholder="5511999999999"
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              URL pública da loja
              <input
                name="siteUrl"
                defaultValue={settings.siteUrl}
                required
                placeholder="https://sua-loja.com.br"
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-ink">
            Prefixo da mensagem (opcional)
            <input
              name="whatsappMessagePrefix"
              defaultValue={settings.whatsappMessagePrefix}
              className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
            />
          </label>
        </section>

        <button
          type="submit"
          disabled={isPending}
          className={getButtonClassName('default', 'md')}
        >
          {isPending ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </form>

      <section className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
        <h2 className="text-lg font-semibold text-ink">Aparência</h2>
        <p className="text-sm text-mute">
          Envie sua logo. O sistema gera favicon e imagem de compartilhamento automaticamente.
        </p>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleLogoUpload}
          disabled={isPending}
          className="block w-full text-sm text-mute file:mr-4 file:rounded-full file:border-0 file:bg-soft-cloud file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
        />
        <AppearancePreview settings={settings} />
      </section>
    </div>
  )
}
