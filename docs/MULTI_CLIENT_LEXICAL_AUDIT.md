# Auditoria lexical multi-cliente (Fase 1b)

Relatório consolidado antes do hardening P0 e onboard SportWear. **Fonte da verdade:** código-fonte. Graphify usado como mapa de dependências (confirmado com `Read`).

**Grafo:** `graphify .` após entregas relevantes.  
**P0 hardening:** concluído — ver [`GO_LIVE_CHECKLIST.md`](GO_LIVE_CHECKLIST.md) § P0 pós-auditoria.

---

## Checklist por área

Origem primária marcada; secundárias em notas.

| Área | store_settings | Banco | Env | Código (genérico) | Hardcoded | Arquivos-chave | Ação |
|------|:---:|:---:|:---:|:---:|:---:|----------------|------|
| Branding (logo, favicon, OG) | ✓ | ✓ Storage | | ✓ | legacy `deploy/branding/` | `lib/store/branding-*`, `scripts/deploy/sync-branding-logo.mjs` | P0: `--client <slug>` |
| Metadata / SEO | ✓ | | ✓ SITE_URL | ✓ | | `build-metadata.ts`, `app/layout.tsx` | OK |
| Footer | ✓ contatos | ✓ categorias alvo | | | ~~`siteConfig.categories`~~ | `footer.tsx`, `config/site.ts` | **P0: só banco** |
| Header | ✓ | | | ✓ | | `header.tsx` | OK |
| Hero | ✓ | ✓ Storage | | ✓ | ~~`DEFAULT_HERO_IMAGE` esportivo~~ | `sports-hero.tsx`, settings | P0: neutro |
| Categorias (nav, PLP) | | ✓ | | ✓ | ~~fallback `siteConfig`~~ | `storefront-categories.ts`, `categories.ts` | **P0: sem fallback** |
| Comercial | ✓ | ✓ | | ✓ | | `lib/commercial/*` | OK |
| Carrinho | | | | ✓ | | `cart-context.tsx` | OK |
| Checkout | | | | ✓ | | `app/checkout/` | OK |
| WhatsApp | ✓ | | | ✓ | | `build-whatsapp-message.ts` | OK |
| Admin | ✓ | ✓ | | ✓ | copy "loja esportiva" | `app/admin/page.tsx` | P1 |
| Importador | | ✓ | | ✓ | | `lib/catalog/import/` | OK |
| Seeds / mocks | | | demo | | esportivo demo | `storage/`, `data/mock-products.ts` | Rotular demo |
| Storage | | ✓ | | ✓ | | migrations | OK |
| Assets estáticos | | | | | hero preset | `public/`, `deploy/netlify/branding/` | preset por deploy |
| CSS / cores | ✓ | | | ✓ | | `globals.css`, layout | OK |
| Fonts | | | | ✓ | | `app/layout.tsx` | OK |
| Defaults identidade | | seed | | | ~~`settings-defaults`~~ | `settings-defaults.ts`, preset JSON | **P0: neutro** |
| Deploy por slug | | | ✓ | ✓ | | `deploy/clients/` | `create-client` |

---

## Graphify — achados confirmados no código

| Query / path | Hipótese | Confirmação |
|--------------|----------|-------------|
| `path siteConfig → Footer` | Footer via `siteConfig.categories` | `components/layout/footer.tsx` L41 — **hardcoded P0** |
| `explain Footer` | `getStoreSettings()` para contatos | OK — settings do banco |
| `explain getStoreSettings` | Hub de identidade runtime | `supabase-settings-repository` + defaults |
| `layout` + `siteConfig` | Root layout metadata | `app/layout.tsx` — não passa categorias ao footer diretamente |
| Incoming inesperado | `siteConfig` em `lib/categories.ts` fallback | **Remover** |

---

## Varredura lexical (grep)

Escopo: `app/`, `components/`, `lib/`, `types/`, `config/`, `storage/`, `data/`, `public/templates/`.  
Excluído: `deploy/clients/unitsports/`, `test-data/`, `docs/archive/`, `graphify-out/`.

| Classificação | Arquivos representativos | Ação |
|---------------|-------------------------|------|
| **Runtime UI/copy hardcoded** | `settings-defaults.ts`, `default-storefront-preset.json`, `app/products/page.tsx` (meta), `app/admin/page.tsx` | P0 neutro / P1 admin copy |
| **Nome componente domínio** | `components/commerce/sports-hero.tsx` | P1 renomear `StoreHero` |
| **Admin produto (club, camisa)** | `product-form.tsx`, `product-addons-fields.tsx` | P1 labels configuráveis |
| **Seeds/mocks demo** | `data/mock-products.ts`, `storage/catalog.seed.json` | OK — demo local |
| **Testes/fixtures** | `*.test.ts` com Camisas, club | OK — dados de teste |
| **Config categorias fixas** | `config/site.ts` | **P0 remover** |

**Sem branching por cliente:** grep `slug === "unitsports"`, `storeName ===` — nenhum match indevido.

---

## Priorização derivada

### P0 (gate SportWear)

1. `settings-defaults.ts` + `default-storefront-preset.json` + `storage/store-settings.seed.json` — identidade neutra
2. Footer + categorias — só `getStorefrontCategories()` / banco; remover `siteConfig.categories`
3. `branding:sync -- --client <slug>`
4. `npm run create-client`
5. Regra anti-slug + CI grep
6. `CORE_VERSION` explícito (`package.json` + template `notes.md`)

### P1 (pós-validação)

- Renomear `SportsHero` → `StoreHero`
- Labels personalização / campo `club` genérico no admin
- Neutralizar copy admin "loja esportiva"
- QA sem fallback `loja-whats` hardcoded

### P2

- Route group admin sem Header/Footer
- `npm run client:status`

---

## Gate

Relatório aprovado implicitamente pela execução do plano. Hardening P0 e scaffold SportWear seguem nesta entrega.
