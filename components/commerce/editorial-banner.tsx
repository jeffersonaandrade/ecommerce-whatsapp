import Image from 'next/image'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1400&h=800&fit=crop'

export function EditorialBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[320px] overflow-hidden bg-soft-cloud sm:min-h-[400px]">
          <Image
            src={BANNER_IMAGE}
            alt="Campanha esportiva"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-ink/50" aria-hidden />
          <div className="relative flex h-full min-h-[320px] flex-col justify-end p-8 sm:min-h-[400px] sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-canvas/80">
              Nova temporada
            </p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-bold uppercase leading-tight tracking-tight text-canvas sm:text-4xl">
              Performance que acompanha seu ritmo
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-canvas/85 sm:text-base">
              Seleção editorial de camisas, calçados e acessórios para treino e
              torcida.
            </p>
            <Link
              href="/products"
              className={`mt-6 inline-flex w-full sm:w-auto ${getButtonClassName('default', 'lg')}`}
            >
              Ver coleção
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
