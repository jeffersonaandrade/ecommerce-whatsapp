import { generateSlug } from '@/lib/formatters'

/** Slug canônico para importação — sem slugifyUnique nem sufixos. */
export function canonicalImportSlug(value: string): string {
  return generateSlug(value).replace(/^-+|-+$/g, '')
}
