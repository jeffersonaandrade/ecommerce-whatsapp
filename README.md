# Sports Store — Plataforma reutilizável para lojas esportivas

Plataforma **white-label**: um core Next.js + Supabase compartilhado, com **um deploy Netlify e um projeto Supabase por loja** (não multi-tenant no mesmo banco).

**Primeira implantação de referência:** [UnitSports](deploy/clients/unitsports/) (`https://unitsports.netlify.app`).

## Arquitetura multi-cliente

| Documento | Conteúdo |
|-----------|----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Core vs deploy, anti-padrões |
| [`docs/CORE_VERSION.md`](docs/CORE_VERSION.md) | Semver do core, rollout por loja |
| [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md) | Migrations, defaults, breaking changes |
| [`docs/MULTI_CLIENT_DEPLOYMENT.md`](docs/MULTI_CLIENT_DEPLOYMENT.md) | Fluxo operacional N lojas |
| [`docs/MULTI_CLIENT_AUDIT.md`](docs/MULTI_CLIENT_AUDIT.md) | Acoplamentos classificados |
| [`deploy/registry/README.md`](deploy/registry/README.md) | Cadastro de implantações |

**Single-client** neste repo significa: **sem multi-tenant no mesmo banco** — não “apenas uma loja”. O core suporta **N implantações** (N sites Netlify + N Supabase isolados).

## Objetivo

Base de e-commerce esportivo **reutilizável** entre clientes:

- Estrutura limpa e reaproveitável
- Mobile-first design
- Catálogo admin + importação CSV + carrinho + WhatsApp
- Supabase em produção; JSON local para dev

## Stack

- **Next.js 16** — App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** — persistência, auth admin, storage
- **Node.js 18+**

## Instalação

```bash
npm install
npm run dev
```

Dev com env de um cliente (recomendado):

```bash
npm run dev:client -- unitsports
```

## Estrutura do Projeto

- `app/` — páginas e rotas
- `components/` — componentes React
- `lib/` — domínio, repositórios, utilitários
- `types/` — tipos TypeScript
- `config/` — configuração legada (fallback JSON)
- `deploy/clients/` — ficha operacional por loja
- `supabase/migrations/` — schema compartilhado do core

## Features (V1 operacional)

- Home, PLP, PDP com variações
- Carrinho (localStorage) + finalização via WhatsApp
- Admin: produtos, categorias, import CSV, settings, central de mídia
- Branding (logo/favicon/OG) via implantação ou operador
- SEO: metadata layout + PDP/PLP

## Fora do escopo V1

- Checkout online / gateway de pagamento
- Pedidos persistidos (`Order`)
- Multi-tenant SaaS (várias lojas no mesmo Supabase)

## Ferramentas de desenvolvimento

O projeto usa [Graphify](https://github.com/safishamsi/graphify) para mapear a estrutura do código.

- **Guia:** [GRAPHIFY_MAP.md](GRAPHIFY_MAP.md)
- **Regenerar:** `graphify .` (na raiz; requer `uv tool install graphifyy`)
- **Relatório:** [graphify-out/GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md)

## Saúde do projeto (operador)

```bash
npm run health:check -- --client unitsports --skip-smoke --skip-checkout
```

Ver [`scripts/operator/README.md`](scripts/operator/README.md) e [`docs/MULTI_CLIENT_DEPLOYMENT.md`](docs/MULTI_CLIENT_DEPLOYMENT.md).
