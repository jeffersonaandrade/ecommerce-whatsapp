import { Metadata } from 'next'
import Link from 'next/link'
import { getDataProvider } from '@/lib/data/provider'

export const metadata: Metadata = {
  title: 'Conteúdo',
  description: 'Personalização de conteúdo do template',
}

export default function AdminContentPage() {
  const isSupabase = getDataProvider() === 'supabase'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Conteúdo</h1>
        <p className="mt-1 text-sm text-mute">
          Personalize textos do template sem alterar o layout da loja.
        </p>
      </div>

      {!isSupabase && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Edição de conteúdo disponível apenas com Supabase (DATA_PROVIDER=supabase).
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/content/benefits"
          className="rounded-lg border border-hairline bg-canvas p-6 transition hover:border-accent/40 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold text-ink">Benefícios</h2>
          <p className="mt-2 text-sm text-mute">
            Cards da seção &quot;Por que comprar conosco&quot; na home.
          </p>
        </Link>
      </div>
    </div>
  )
}
