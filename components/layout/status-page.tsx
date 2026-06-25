import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'

type StatusPageProps = {
  code: string
  title: string
  description: string
}

export function StatusPage({ code, title, description }: StatusPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-display text-6xl font-bold uppercase tracking-tight text-[var(--color-store-primary,#111111)] sm:text-7xl">
          {code}
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mute">{description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className={getButtonClassName('default', 'md', 'w-full sm:w-auto')}>
            Voltar ao início
          </Link>
          <Link
            href="/products"
            className={getButtonClassName('outline', 'md', 'w-full sm:w-auto')}
          >
            Ver produtos
          </Link>
        </div>
      </div>
    </div>
  )
}
