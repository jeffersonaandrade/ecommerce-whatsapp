import { getButtonClassName } from '@/components/ui/button'

export function NewsletterBlock() {
  return (
    <section className="border-t border-hairline py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
            Fique por dentro
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
            Newsletter
          </h2>
          <p className="mt-3 text-sm text-mute">
            Lançamentos, promoções e novidades esportivas. Em breve.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Seu e-mail"
              disabled
              aria-label="E-mail para newsletter"
              className="h-11 flex-1 rounded-sm border border-hairline bg-soft-cloud px-3 text-base text-mute sm:max-w-xs"
            />
            <button
              type="button"
              disabled
              title="Newsletter em breve"
              className={getButtonClassName('default', 'md', 'w-full sm:w-auto')}
            >
              Inscrever-se
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
