# Auditoria de performance — consultas Supabase

Catálogo de referência: **~3.438 produtos** (UnitSports, jun/2026).

## Resumo

| Fluxo | Antes | Depois |
|-------|-------|--------|
| Layout admin (`/admin/products/media`) | `getAllProductsAdmin()` FULL (~3400) | RPC counts (`get_product_status_counts` + `get_media_issue_count`) |
| Página inventário Central de Mídia | `getAllProductsAdmin()` FULL + query paginada | `queryProductsAdmin({ fields: 'list' })` — 25 produtos |
| Upload em lote | FULL no mesmo request | FULL só com `?tab=upload` |
| Filtro mídia "Quebradas" | Client-side, 25 da página | Server-side `?media=broken` via `query_admin_products_page` |
| Filtro hasStock admin | Full scan em memória | SQL via `query_admin_products_page` |
| Probe de imagens | Client serial, 8s/URL, sem cache | Paralelo + sessionStorage + skip URLs Supabase Storage |
| Dashboard admin | 2× catálogo (admin + vitrine) | RPC `get_product_status_counts` |
| Categorias admin | `getAllProductsAdmin()` para coluna Produtos | RPC `count_products_by_category` |
| Home `/` | `getAllProducts()` → slice(10) | `getStorefrontFeatured(LIMIT)` no SQL |
| `/products` | grid sem paginação | Paginação server-side (24/página) |
| `/api/products` | JSON completo ~3400 produtos | Payload lite (`ProductCartLite`) |
| `/products?category=` | 5000 lite + filtro memória | RPC `query_storefront_products_page` paginado |
| `/products?q=` | — (novo) | `ilike` direto em `name/club/category`, paginado, `fields:'list'` |
| `/products?category=&q=` | — (novo) | Bypassa RPC; subtree em JS + `ilike`; aceitável até ~5.000 produtos |
| create/update produto (actions) | `repo.getAll()` FULL | `findConflictingSkus()` pontual |
| Admin produtos listagem | `select('*')` com long_description | `fields: 'list'` |
| Admin categorias tabs | `queryCategoriesAdmin({ pageSize: 999 })` | `fetchCategoryVisibilityCounts()` |
| bulkSetStatus/Category | `.in()` sem chunk | Chunks de 150 IDs |
| counts fallback query | `fetchAllProducts()` se RPC falhar | Erro explícito (sem full scan) |
| Produtos por request (mídia inventário) | ~6800 (2× FULL) | ~25 + RPCs |

## Dívida técnica de performance

| Item | Quando agir | Solução |
|------|-------------|---------|
| Busca textual sem índice (`/products?q=`) | Catálogo > 5.000 produtos ou TTFB > 500ms em produção | Adicionar `pg_trgm` em `products.name` e `products.club`; opcional: `products.category`. Migration isolada, sem alteração de código. |
| Bypass de RPC em `category + q` | Mesmo gatilho acima | Adicionar parâmetro `p_search text DEFAULT NULL` na função `query_storefront_products_page` e remover o bypass no repositório. |

**Como medir:** `EXPLAIN ANALYZE SELECT ... WHERE name ILIKE '%term%'` no Supabase SQL Editor. Se `Seq Scan` com custo alto, criar o índice:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX products_club_trgm ON products USING gin (club gin_trgm_ops);
```

## Diagrama — Central de Mídia (pós Sprint A + A2)

```
Layout  →  RPC contadores
Page    →  queryProductsLite(25) + ?media= + ?status=
Upload  →  getAllProductsAdmin()  (somente ?tab=upload)
Probe   →  badge client (URLs externas); classificação lista no SQL
```

## Como medir TTFB

1. DevTools → Network → documento HTML de `/admin/products/media?status=draft`
2. Campo **Waiting (TTFB)** — repetir 3× e usar mediana
3. Comparar deploy anterior vs atual (mesmo Supabase)

### Metas

| Rota | Meta TTFB |
|------|-----------|
| `/admin/products/media?status=draft` | < 2s |
| `/admin` | < 2s |
| `/` (home) | < 1.5s |

_Preencher coluna "medido" após deploy em produção._

## RPCs adicionadas

| RPC | Uso |
|-----|-----|
| `get_media_issue_count()` | Onboarding admin |
| `get_media_status_counts()` | Tabs filtros mídia |
| `products_match_media()` | Helper SQL |
| `query_admin_products_page()` | Filtros mídia + hasStock paginados |
| `count_products_by_category()` | Lista categorias admin |
| `count_products_for_category(text)` | Editar/excluir categoria |
| `query_storefront_products_page(text, int, int)` | PLP `/products?category=` paginada |
| `product_matches_storefront_category(text, text)` | Helper filtro categoria vitrine |

## Sprints concluídos

- **Sprint A** (0a–0d): lazy upload, layout RPC, React.cache, query lite mídia
- **Sprint A2** (0e–0f): filtros mídia server-side, probe otimizado
- **Sprint B** (parcial): hasStock SQL, create/update repo sem fetchAll, chunk bulk, category getById direto, actions sem getAll
- **Sprint C** (parcial): home LIMIT, PLP paginada, API lite, PLP categoria via RPC

## Pendências conhecidas (próximos sprints)

- Medir TTFB/LCP em produção (coluna "medido" abaixo).
- `pg_trgm` / materialização mídia — adiado até ~30k–50k produtos ([PROJECT_READINESS.md](./PROJECT_READINESS.md)).

## Auditoria pós-Sprint A/A2/C + D (implementado)

| Fluxo | Antes | Depois |
|-------|-------|--------|
| `/api/products` | Até 5000 produtos lite em toda visita | `?ids=` — só IDs do carrinho; vazio = sem fetch |
| `/products?category=` | 5000 lite + filtro memória | RPC `query_storefront_products_page` paginado |
| Import preview/confirm | `repo.getAll()` FULL | `fetchImportCatalogSnapshot()` paginado lite |
| Export mapa mídia | `repo.getAll()` | Query paginada lite |
| Upload tab mídia | `getAllProductsAdmin()` no SSR | `fetchMediaUploadCatalogAction()` client lazy |
| Vitrine cache | Sem revalidate | `revalidate = 60` + `unstable_cache` home/PDP |
| Imagens produto | `<img>` nativo full-size | `next/image` + Shopify CDN |
| API cache headers | Nenhum | `s-maxage=60, stale-while-revalidate=300` |
