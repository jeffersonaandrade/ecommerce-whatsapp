import { getStoreSettings } from '@/lib/store/settings-repository'
import { getActiveBenefitItems } from '@/lib/benefits'
import { resolveStorefrontBenefits } from '@/lib/benefits/resolve-storefront-benefits'

export async function HomeBenefits() {
  const [settings, activeItems] = await Promise.all([
    getStoreSettings(),
    getActiveBenefitItems(),
  ])
  const section = resolveStorefrontBenefits(activeItems, settings)

  return (
    <section className="border-t border-hairline bg-soft-cloud py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
            {section.eyebrow}
          </p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
            {section.title}
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {section.items.map((item) => (
            <div key={item.id}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-mute">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
