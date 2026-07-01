# Arquitetura — Sports Commerce (core compartilhado)

Produto reutilizável de e-commerce: **um código**, **várias implantações** (Netlify + Supabase + domínio por cliente).

Documentos relacionados:

- [`MULTI_CLIENT_DEPLOYMENT.md`](MULTI_CLIENT_DEPLOYMENT.md) — fluxo deploy N lojas
- [`COMMERCIAL_ENGINE.md`](COMMERCIAL_ENGINE.md) — motor de regras comerciais (contrato)
- [`CORE_VERSION.md`](CORE_VERSION.md) — semver e rollout
- [`COMPATIBILITY.md`](COMPATIBILITY.md) — migrations e compatibilidade
- [`MULTI_CLIENT_AUDIT.md`](MULTI_CLIENT_AUDIT.md) — acoplamentos mapeados
- [`DOMAIN_MODEL.md`](DOMAIN_MODEL.md), [`MODULE_ROADMAP.md`](MODULE_ROADMAP.md), [`DATABASE_PLAN.md`](DATABASE_PLAN.md)

---

## Modelo multi-cliente (não multi-tenant)

```text
1 código (GitHub main)
  ↓
vários deploys Netlify
  ↓
1 Supabase por cliente
  ↓
dados + branding + domínio próprios
```

| Abordagem | Este projeto |
|-----------|--------------|
| Multi-tenant (1 DB, `store_id`) | **Não** |
| Fork por cliente | **Não** |
| Core + deploy isolado | **Sim** |

**UnitSports** = primeira **implantação de referência**, não o produto inteiro. Ficha: [`deploy/clients/unitsports/`](../deploy/clients/unitsports/).

---

## Regra de ouro

```text
Cliente muda por DADOS e ENV — nunca por código específico.
```

**É proibido** qualquer lógica baseada em slug ou nome do cliente no core (`app/`, `components/`, `lib/`).

| Permitido | Proibido |
|-----------|----------|
| `store_settings` | `if (slug === "unitsports")` |
| Preset `deploy/clients/<slug>/storefront-preset.json` | `if (storeName === "UnitSports")` |
| Feature flags genéricas (não por slug) | Branch permanente por cliente |
| Dados do Supabase do deploy ativo | Fork ou cópia do repositório |

CI local: `npm run qa:check-no-client-branching`. Auditoria lexical: [`MULTI_CLIENT_LEXICAL_AUDIT.md`](MULTI_CLIENT_LEXICAL_AUDIT.md).

---

## O que é compartilhado (core)

- Código: `app/`, `components/`, `lib/`
- Migrations: `supabase/migrations/`
- Scripts operador: `scripts/`
- Admin, import CSV, banners, onboarding, Central de Mídia
- Bugfixes e novas features — uma vez, distribuídas via deploy

---

## O que é específico por cliente (implantação)

- Supabase URL + keys (env Netlify)
- Domínio
- `store_settings` (nome, WhatsApp, cores, textos)
- Produtos, categorias, banners, benefícios
- Storage (logo, imagens produto)
- **Assets de branding no repo:** `deploy/clients/<slug>/branding/logo.jpeg` (por implantação)
- Feature flags de env (`ENABLE_MIGRATION_TOOLS` na fase onboarding)

Configuração de conteúdo → **`store_settings`** e tabelas de conteúdo.  
Disponibilidade de módulo → **feature flag** (env ou futuro `store_features`) — ver [`MULTI_CLIENT_DEPLOYMENT.md`](MULTI_CLIENT_DEPLOYMENT.md).

---

## Branding por cliente

O core **não** deve depender de uma logo de cliente como padrão global.

| Local | Papel |
|-------|-------|
| `deploy/clients/<slug>/branding/logo.jpeg` | **Canônico** — logo da implantação |
| `deploy/branding/logo.*` | **Legacy / bancada** — lido pelos scripts atuais; uso temporário com cuidado |
| Supabase Storage `branding/` | **Runtime** — favicon, OG, logo servidos na loja |

```text
deploy/clients/unitsports/branding/logo.jpeg
  ↓ (hoje: cópia manual para deploy/branding/)
  ↓ npm run branding:sync
  ↓ (futuro: --client unitsports)
Supabase Storage da implantação unitsports
```

**Nunca** copiar logo da UnitSports para outra loja. **Nunca** tratar `deploy/branding/` como branding permanente do core.

Ver [`deploy/branding/README.md`](../deploy/branding/README.md) e [`MULTI_CLIENT_DEPLOYMENT.md`](MULTI_CLIENT_DEPLOYMENT.md) § Branding por cliente.

---

## Visão geral técnica

| Aspecto | Decisão |
|---------|---------|
| Tipo | Produto white-label / multi-deploy |
| V1 comercial | Catálogo + carrinho + WhatsApp |
| Stack | Next.js 16, TypeScript, Tailwind, Supabase |
| Persistência | 1 projeto Supabase **por cliente** |

---

## Módulos

| Módulo | Responsabilidade | Status |
|--------|------------------|--------|
| **Catalog** | Produtos, imagens, variações, categorias | Supabase + admin |
| **Cart** | Carrinho local | Funcional |
| **CSV Import** | Carga em massa | Wizard + RPC |
| **Media Center** | Imagens onboarding | Flag `ENABLE_MIGRATION_TOOLS` |
| **Onboarding** | Tour + Centro de Implantação | Funcional |
| **Order Completion** | WhatsApp V1 | Funcional |
| **Commercial** | Motor de regras (policies, rules, trace) | Documentado — [`COMMERCIAL_ENGINE.md`](COMMERCIAL_ENGINE.md); Fase 1 pendente |
| **Admin** | Gestão da loja | Funcional |
| **Settings** | Config da loja | `store_settings` |
| **Orders / Checkout** | V2+ | Placeholder |

---

## Camadas

```text
┌─────────────────────────────────────────┐
│  UI — app/, components/                 │
│  Server Components por padrão           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Domínio — types/, lib/                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Dados — Supabase por cliente           │
│  Carrinho: localStorage (browser)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Integrações — WhatsApp (V1)            │
└─────────────────────────────────────────┘
```

---

## Persistência

| Provider | Uso |
|----------|-----|
| `json` | Dev local, demo Netlify sem Supabase |
| `supabase` | Produção por implantação |

Factory: [`lib/data/provider.ts`](../lib/data/provider.ts) via `DATA_PROVIDER`.  
Schema: [`DATABASE_PLAN.md`](DATABASE_PLAN.md).

---

## IA do Admin

```text
Dashboard                    /admin
Produtos                     /admin/products
Importar CSV                 /admin/import (flag)
Central de Mídia             /admin/products/media (flag)
Categorias                   /admin/categories
Banners                      /admin/banners
Configurações                /admin/settings
```

---

## Decisões arquiteturais

- Server Components por padrão; `'use client'` onde necessário
- Carrinho: Context + localStorage
- Produtos: abstração [`lib/products.ts`](../lib/products.ts)
- PurchaseIntent efêmero V1 — sem pedido no banco
- CSV: [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md)

---

## Anti-padrões

- Marketplace, multi-tenant no mesmo DB, ERP, filas prematuras
- Fork por cliente, branch permanente por cliente
- Feature flag para branding/nome/cores
- Re-seed automático em loja existente ([`SEEDS.md`](SEEDS.md))

---

## Order Completion (V1)

Modo ativo: **WhatsApp** via `StoreSettings` (telefone, prefixo mensagem, `siteUrl`).

Fluxo: Catálogo → Carrinho → Mensagem WhatsApp → negociação fora do site.

Detalhes de payload e evolução V2: seções históricas em commits anteriores; entidade `Order` = V2+.

---

## Mapa de código (Graphify)

Hubs: `Product`, `getAllProducts()`, `useCart()`, onboarding tour.

Consulta: [`graphify-out/GRAPH_REPORT.md`](../graphify-out/GRAPH_REPORT.md)

---

## Codinome do repositório

`ecommerce-sports` (package) / `ecommerce-whatsapp` (GitHub) = nomes internos. Adiar rename formal — ver [`MULTI_CLIENT_AUDIT.md`](MULTI_CLIENT_AUDIT.md).
