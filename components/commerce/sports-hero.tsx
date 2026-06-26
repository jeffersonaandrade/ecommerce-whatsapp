import Image from 'next/image'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'
import { DEFAULT_HERO_IMAGE } from '@/lib/store/settings-defaults'
import { brandingAssetUrl } from '@/lib/store/branding-url'

export type SportsHeroContent = {
  storeName: string
  heroImagePath: string | null
  heroHeadline: string
  heroHeadlineLine2: string
  heroSubheadline: string
  heroCtaLabel: string
  heroCtaHref: string
  updatedAt: string
}

interface SportsHeroProps {
  content: SportsHeroContent
}

export function SportsHero({ content }: SportsHeroProps) {
  const heroSrc =
    brandingAssetUrl(content.heroImagePath, content.updatedAt) ?? DEFAULT_HERO_IMAGE
  const isExternal = heroSrc.startsWith('http')

  return (
    <section className="w-full">
      <div className="relative flex min-h-[75vh] flex-col justify-end lg:min-h-[88vh]">
        {isExternal ? (
          <Image
            src={heroSrc}
            alt={content.heroHeadline}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroSrc}
            alt={content.heroHeadline}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/45 to-ink/25"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-canvas/80 sm:text-sm">
            {content.storeName}
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-canvas sm:text-5xl lg:text-6xl xl:text-7xl">
            {content.heroHeadline}
            {content.heroHeadlineLine2 && (
              <span className="block text-canvas/90">{content.heroHeadlineLine2}</span>
            )}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-canvas/85 sm:text-lg">
            {content.heroSubheadline}
          </p>
          <div className="mt-8">
            <Link
              href={content.heroCtaHref || '/products'}
              className={getButtonClassName('default', 'lg', 'w-full sm:w-auto')}
            >
              {content.heroCtaLabel || 'Explorar produtos'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
