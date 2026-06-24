import { Metadata } from 'next'
import Link from 'next/link'
import { getButtonClassName } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Importação CSV',
  description: 'Importação de produtos via planilha CSV de carga em massa',
}

const TEMPLATE_PATH = '/templates/importacao-produtos-exemplo.csv'

export default function AdminImportPage() {
  return (
    <div className="w-full">
      <div className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar ao Admin
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">Importação CSV</h1>
          <p className="text-gray-400 mt-2">
            Planilha de carga em massa — uma linha por variação de produto
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Como funciona</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Exporte sua planilha de produtos ou preencha o template abaixo.
            Cada linha do CSV representa uma variação (tamanho, cor, etc.).
            Produtos com várias variações usam o mesmo{' '}
            <strong>Identificador URL</strong> em linhas repetidas.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Coluna opcional{' '}
            <code className="bg-gray-100 px-1 rounded">image_urls</code>: URLs de
            imagens externas separadas por{' '}
            <code className="bg-gray-100 px-1 rounded">|</code> (máximo 5, apenas
            HTTPS).
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Template e documentação</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={TEMPLATE_PATH}
              download
              className={getButtonClassName('default', 'md', 'w-full sm:w-auto')}
            >
              Baixar template CSV
            </a>
          </div>
          <p className="text-xs text-gray-500">
            Arquivo: <code>{TEMPLATE_PATH}</code> — exemplo com 2 variações (P e M)
          </p>
          <p className="text-sm text-gray-600">
            Especificação completa:{' '}
            <code className="bg-gray-100 px-1 rounded">docs/CSV_IMPORT_SPEC.md</code>{' '}
            (repositório do projeto — mapeamento de colunas, erros CSV_E001–E007,
            regras de <code className="bg-gray-100 px-1 rounded">image_urls</code>).
          </p>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900">Em desenvolvimento</h2>
          <p className="text-amber-800 text-sm mt-2">
            Upload, validação em tempo real e preview de importação{' '}
            <strong>ainda não estão implementados</strong>. Nesta versão você pode
            baixar o template e consultar a especificação. A importação automática
            será disponibilizada em uma fase futura.
          </p>
        </section>
      </div>
    </div>
  )
}
