export function HomeBenefits() {
  const benefits = [
    {
      title: 'Envio rápido',
      description: 'Entrega em até 5 dias úteis em todo o Brasil.',
    },
    {
      title: 'Produtos originais',
      description: '100% autênticos com garantia de qualidade.',
    },
    {
      title: 'Suporte dedicado',
      description: 'Atendimento quando você precisar.',
    },
  ]

  return (
    <section className="border-t border-hairline bg-soft-cloud py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-mute">
            Por que comprar conosco
          </p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">
            Benefícios
          </h2>
        </header>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {benefits.map((item) => (
            <div key={item.title}>
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
