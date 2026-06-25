import Link from 'next/link'
import { Metadata } from 'next'

type InstitutionalPageProps = {
  title: string
  children: React.ReactNode
}

export function InstitutionalPage({ title, children }: InstitutionalPageProps) {
  return (
    <div className="w-full">
      <div className="border-b border-hairline bg-soft-cloud py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-mute transition-colors hover:text-ink"
          >
            ← Início
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="prose prose-neutral max-w-none text-base leading-relaxed text-ink">
          {children}
        </div>
      </div>
    </div>
  )
}

export function buildInstitutionalMetadata(
  storeName: string,
  pageTitle: string,
  description: string
): Metadata {
  return {
    title: `${pageTitle} | ${storeName}`,
    description,
  }
}
