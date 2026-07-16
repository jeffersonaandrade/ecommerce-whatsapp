/**
 * Ordenação de tamanhos de produto (vestuário BR + numérico + faixa etária).
 * Menor → maior.
 */

const APPAREL_RANK: Record<string, number> = {
  PP: 10,
  XP: 15,
  P: 20,
  M: 30,
  G: 40,
  GG: 50,
  XG: 55,
  EG: 55,
  EGG: 60,
  XL: 70,
  '1XL': 70,
  XXL: 80,
  '2XL': 80,
  '2GG': 82,
  XXXL: 90,
  '3XL': 90,
  '3GG': 92,
  '4XL': 100,
  '4GG': 102,
  '5XL': 110,
  '5GG': 112,
  '6XL': 120,
}

function normalizeSize(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, ' ')
}

/** Extrai idade inicial de "02-04 ANOS" / "5-6 anos" para ordenar infantil. */
function kidsAgeStart(normalized: string): number | null {
  const m = normalized.match(/^0*(\d+)\s*[-–]\s*0*(\d+)\s*ANOS?$/)
  if (!m) return null
  return Number(m[1])
}

function apparelRank(normalized: string): number | null {
  return APPAREL_RANK[normalized] ?? null
}

function shoeNumber(normalized: string): number | null {
  if (!/^\d{2,3}(?:[.,]\d)?$/.test(normalized)) return null
  return Number(normalized.replace(',', '.'))
}

/**
 * Compara dois rótulos de tamanho: negativo se `a` vem antes de `b`.
 */
export function compareProductSize(a: string, b: string): number {
  const na = normalizeSize(a)
  const nb = normalizeSize(b)
  if (na === nb) return 0

  const ra = apparelRank(na)
  const rb = apparelRank(nb)
  const sa = shoeNumber(na)
  const sb = shoeNumber(nb)
  const ka = kidsAgeStart(na)
  const kb = kidsAgeStart(nb)

  // 1) Grade vestuário conhecida
  if (ra != null && rb != null) return ra - rb
  // 2) Numeração de calçado
  if (sa != null && sb != null) return sa - sb
  // 3) Faixa etária infantil
  if (ka != null && kb != null) return ka - kb

  // Misturas: vestuário → número → infantil → resto
  const band = (r: number | null, s: number | null, k: number | null) => {
    if (r != null) return 0
    if (s != null) return 1
    if (k != null) return 2
    return 3
  }
  const ba = band(ra, sa, ka)
  const bb = band(rb, sb, kb)
  if (ba !== bb) return ba - bb
  if (ra != null) return -1
  if (rb != null) return 1
  if (sa != null) return -1
  if (sb != null) return 1
  if (ka != null) return -1
  if (kb != null) return 1

  return na.localeCompare(nb, 'pt-BR', { numeric: true, sensitivity: 'base' })
}

export function sortSizes<T extends string>(sizes: T[]): T[] {
  return [...sizes].sort(compareProductSize)
}

export function sortVariationsBySize<T extends { size?: string | null }>(variations: T[]): T[] {
  return [...variations].sort((a, b) =>
    compareProductSize(a.size ?? '', b.size ?? '')
  )
}
