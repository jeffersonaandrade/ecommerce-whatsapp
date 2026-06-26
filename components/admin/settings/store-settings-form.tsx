'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StoreSettings } from '@/types/store-settings'
import { getButtonClassName } from '@/components/ui/button'
import {
  updateStoreSettingsAction,
  uploadStoreLogoAction,
  uploadHeroImageAction,
  restoreDefaultStorefrontAction,
  getStoreSettingsAction,
} from '@/lib/store/actions'
import { brandingAssetUrl } from '@/lib/store/branding-url'
import { AppearancePreview } from './appearance-preview'

type StoreSettingsFormProps = {
  initial: StoreSettings
}

export function StoreSettingsForm({ initial }: StoreSettingsFormProps) {
  const router = useRouter()
  const [settings, setSettings] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [restoreConfirm, setRestoreConfirm] = useState('')

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
        phone: String(data.get('phone') ?? ''),
        primaryColor: String(data.get('primaryColor') ?? ''),
        secondaryColor: String(data.get('secondaryColor') ?? ''),
        heroHeadline: String(data.get('heroHeadline') ?? ''),
        heroHeadlineLine2: String(data.get('heroHeadlineLine2') ?? ''),
        heroSubheadline: String(data.get('heroSubheadline') ?? ''),
        heroCtaLabel: String(data.get('heroCtaLabel') ?? ''),
        heroCtaHref: String(data.get('heroCtaHref') ?? ''),
        aboutText: String(data.get('aboutText') ?? ''),
        address: String(data.get('address') ?? ''),
        cityState: String(data.get('cityState') ?? ''),
        businessHours: String(data.get('businessHours') ?? ''),
        exchangePolicyText: String(data.get('exchangePolicyText') ?? ''),
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
        phone: String(data.get('phone') ?? ''),
        primaryColor: String(data.get('primaryColor') ?? ''),
        secondaryColor: String(data.get('secondaryColor') ?? ''),
        heroHeadline: String(data.get('heroHeadline') ?? ''),
        heroHeadlineLine2: String(data.get('heroHeadlineLine2') ?? ''),
        heroSubheadline: String(data.get('heroSubheadline') ?? ''),
        heroCtaLabel: String(data.get('heroCtaLabel') ?? ''),
        heroCtaHref: String(data.get('heroCtaHref') ?? ''),
        aboutText: String(data.get('aboutText') ?? ''),
        address: String(data.get('address') ?? ''),
        cityState: String(data.get('cityState') ?? ''),
        businessHours: String(data.get('businessHours') ?? ''),
        exchangePolicyText: String(data.get('exchangePolicyText') ?? ''),
        updatedAt: result.updatedAt,
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
        updatedAt: result.updatedAt,
      })
      setSuccess('Logo processada. Favicon e OG gerados.')
      e.target.value = ''
    })
  }

  function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      setError(null)
      setSuccess(null)
      const formData = new FormData()
      formData.set('hero', file)
      const result = await uploadHeroImageAction(formData)

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSettings({
        ...settings,
        heroImagePath: 'hero.webp',
        updatedAt: result.updatedAt,
      })
      setSuccess('Imagem do hero atualizada.')
      e.target.value = ''
    })
  }

  const heroPreviewUrl = brandingAssetUrl(settings.heroImagePath, settings.updatedAt)

  function handleRestoreDefault() {
    if (restoreConfirm !== 'RESTAURAR') return
    startTransition(async () => {
      setError(null)
      setSuccess(null)
      const result = await restoreDefaultStorefrontAction()
      if (!result.ok) {
        setError(result.error)
        return
      }
      const refreshed = await getStoreSettingsAction()
      setSettings(refreshed)
      setRestoreConfirm('')
      setSuccess('Aparência padrão restaurada. Nome da loja e contatos operacionais foram preservados.')
      router.refresh()
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
                Telefone da loja
                <input
                  name="phone"
                  defaultValue={settings.phone}
                  placeholder="(11) 99999-9999"
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
            </div>
            <label className="block text-sm font-medium text-ink">
              Facebook
              <input
                name="facebook"
                defaultValue={settings.facebook}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
          <h2 className="text-lg font-semibold text-ink">Cores</h2>
          <p className="text-sm text-mute">
            Cor primária nos botões principais; secundária em superfícies de apoio.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              Cor primária
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  name="primaryColorPicker"
                  defaultValue={settings.primaryColor}
                  onChange={(e) => {
                    const input = e.currentTarget.form?.elements.namedItem(
                      'primaryColor'
                    ) as HTMLInputElement | null
                    if (input) input.value = e.target.value
                  }}
                  className="h-10 w-14 cursor-pointer rounded border border-hairline"
                />
                <input
                  name="primaryColor"
                  defaultValue={settings.primaryColor}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="flex-1 rounded-lg border border-hairline px-3 py-2 text-sm font-mono"
                />
              </div>
            </label>
            <label className="block text-sm font-medium text-ink">
              Cor secundária
              <div className="mt-1 flex items-center gap-3">
                <input
                  type="color"
                  name="secondaryColorPicker"
                  defaultValue={settings.secondaryColor}
                  onChange={(e) => {
                    const input = e.currentTarget.form?.elements.namedItem(
                      'secondaryColor'
                    ) as HTMLInputElement | null
                    if (input) input.value = e.target.value
                  }}
                  className="h-10 w-14 cursor-pointer rounded border border-hairline"
                />
                <input
                  name="secondaryColor"
                  defaultValue={settings.secondaryColor}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="flex-1 rounded-lg border border-hairline px-3 py-2 text-sm font-mono"
                />
              </div>
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
          <h2 className="text-lg font-semibold text-ink">Conteúdo da Loja</h2>
          <p className="text-sm text-mute">
            Textos e imagem do hero e páginas institucionais. Layout fixo — apenas conteúdo.
          </p>

          <div className="space-y-3 rounded-lg border border-hairline bg-soft-cloud/50 p-4">
            <h3 className="text-sm font-semibold text-ink">Hero (home)</h3>
            <label className="block text-sm font-medium text-ink">
              Headline (linha 1)
              <input
                name="heroHeadline"
                defaultValue={settings.heroHeadline}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Headline (linha 2)
              <input
                name="heroHeadlineLine2"
                defaultValue={settings.heroHeadlineLine2}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Subtítulo
              <textarea
                name="heroSubheadline"
                defaultValue={settings.heroSubheadline}
                rows={2}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-ink">
                CTA — texto
                <input
                  name="heroCtaLabel"
                  defaultValue={settings.heroCtaLabel}
                  className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                CTA — link
                <input
                  name="heroCtaHref"
                  defaultValue={settings.heroCtaHref}
                  placeholder="/products"
                  className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-hairline bg-soft-cloud/50 p-4">
            <h3 className="text-sm font-semibold text-ink">Páginas institucionais</h3>
            <label className="block text-sm font-medium text-ink">
              Sobre (/sobre)
              <textarea
                name="aboutText"
                defaultValue={settings.aboutText}
                rows={4}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-ink">
                Endereço
                <input
                  name="address"
                  defaultValue={settings.address}
                  className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Cidade / Estado
                <input
                  name="cityState"
                  defaultValue={settings.cityState}
                  className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-sm font-medium text-ink">
              Horário de atendimento
              <input
                name="businessHours"
                defaultValue={settings.businessHours}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Política de trocas (/politica-de-trocas)
              <textarea
                name="exchangePolicyText"
                defaultValue={settings.exchangePolicyText}
                rows={4}
                className="mt-1 w-full rounded-lg border border-hairline px-3 py-2 text-sm"
              />
            </label>
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

      <section className="space-y-4 rounded-lg border border-hairline bg-canvas p-6">
        <h2 className="text-lg font-semibold text-ink">Banner do hero</h2>
        <p className="text-sm text-mute">
          Imagem de fundo da home (1920×1080 recomendado). Sem upload, usa imagem padrão.
        </p>
        {heroPreviewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroPreviewUrl}
            alt="Preview do hero"
            className="h-32 w-full rounded-lg object-cover"
          />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleHeroUpload}
          disabled={isPending}
          className="block w-full text-sm text-mute file:mr-4 file:rounded-full file:border-0 file:bg-soft-cloud file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink"
        />
      </section>

      <section className="space-y-4 rounded-lg border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-lg font-semibold text-ink">Restaurar aparência padrão</h2>
        <p className="text-sm text-mute">
          Restaura cores, descrição, hero, logo, favicons, OG e textos institucionais para o
          preset premium inicial.{' '}
          <strong className="text-ink">
            Não altera produtos, nome da loja, WhatsApp, siteUrl nem demais contatos.
          </strong>
        </p>
        <label className="block text-sm font-medium text-ink">
          Digite RESTAURAR para confirmar
          <input
            type="text"
            value={restoreConfirm}
            onChange={(e) => setRestoreConfirm(e.target.value)}
            autoComplete="off"
            placeholder="RESTAURAR"
            className="mt-1 w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={isPending || restoreConfirm !== 'RESTAURAR'}
          onClick={handleRestoreDefault}
          className={getButtonClassName('outline', 'md')}
        >
          {isPending ? 'Restaurando...' : 'Restaurar aparência padrão'}
        </button>
      </section>
    </div>
  )
}
