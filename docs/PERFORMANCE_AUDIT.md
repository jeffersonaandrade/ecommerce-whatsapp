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
| create/update produto | `fetchAllProducts()` | slug index + `MAX(id)` pontual |
| bulk delete/saveAll | `.in()` sem chunk | Chunks de 150 IDs |
| counts fallback query | `fetchAllProducts()` se RPC falhar | Erro explícito (sem full scan) |
| Produtos por request (mídia inventário) | ~6800 (2× FULL) | ~25 + RPCs |

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

## Pendências conhecidas (fora deste sprint)

- `/products?category=` ainda usa `getProductsByCategory()` com pool até 5000 itens (lite) para matching correto de slug legado — evoluir para RPC com mesma heurística de `productMatchesCategoryFilter`.
- Import preview/confirm: `repo.getAll()` aceitável (1× por operação).
- `exportMediaMapCsvAction`: export manual OK.
