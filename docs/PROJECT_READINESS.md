# Project Readiness

Referência de maturidade do produto **ecommerce-sports**. Atualizar após cada sprint relevante.

Documentação relacionada: [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [MULTI_CLIENT_DEPLOYMENT.md](./MULTI_CLIENT_DEPLOYMENT.md), [DATABASE_PLAN.md](./DATABASE_PLAN.md), [HANDOFF.md](./HANDOFF.md).

## Matriz de módulos

| Módulo | Status | Notas |
|--------|--------|-------|
| Catálogo | ✅ | CRUD, listagem paginada, RPC counts |
| Importador | ✅ | CSV transacional Supabase; snapshot lite (sem `getAll` FULL) |
| Mídia | ✅ | Inventário paginado; upload lazy client-side |
| Banners | ✅ | Carrossel home + preload |
| Branding | ✅ | Settings + storage |
| Multi Cliente | ✅ | Deploy por cliente documentado |
| Performance | 🟡 | Consultas globais reduzidas; TTFB produção pendente |
| Carrinho | 🟡 | API por IDs; hydrate condicional |
| Checkout | 🔴 | Placeholder WhatsApp |
| Pedidos | 🔴 | V2 |
| Analytics | 🔴 | Não implementado |

## Performance — roadmap

### Concluído (Sprints A–D parcial)

- Central de Mídia: RPC + query paginada lite
- PLP categoria: `query_storefront_products_page` (SQL paginado)
- API carrinho: `GET /api/products?ids=` — sem fetch se carrinho vazio
- Admin: `findConflictingSkus`, import/export mídia paginados, upload lazy
- Vitrine: `revalidate = 60` (home, PLP, PDP), `unstable_cache` featured/PDP
- Imagens produto: `next/image` + `cdn.shopify.com` em `remotePatterns`

### Próximo (P1)

- Cache tags + invalidação fina na API
- UX filtro "Quebradas" vs "Externas" na Central de Mídia
- Medir TTFB/LCP em produção ([PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md))

### Adiado (só com escala comprovada)

- `pg_trgm` / índices GIN — considerar em **~30k+ produtos**
- Coluna `media_status` materializada + triggers/jobs — **~50k+ produtos**
- Views materializadas de estoque

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Pronto para uso em produção multi-cliente |
| 🟡 | Funcional com ressalvas ou polish pendente |
| 🔴 | Não implementado / fora do escopo atual |
