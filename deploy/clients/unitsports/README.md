# Implantação: UnitSports

Primeira **implantação de referência** do core. UnitSports é uma loja real em produção — **não** é o nome do produto nem um fork do código.

Arquitetura: [`docs/ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md) · Deploy multi-cliente: [`docs/MULTI_CLIENT_DEPLOYMENT.md`](../../../docs/MULTI_CLIENT_DEPLOYMENT.md)

---

## O que é UnitSports

| Conceito | Descrição |
|----------|-----------|
| **Produto** | Core compartilhado (Next.js + Supabase) — um repo, branch `main` |
| **UnitSports** | Primeira loja implantada — ficha operacional nesta pasta |
| **Template genérico** | [`../template/`](../template/) — copiar para novas lojas |

Use esta pasta para ver **como preencher** checklist, notes e env.example com status real. **Não** copie catálogo, branding ou dados do cliente.

---

## O que fica no core (compartilhado)

- Código da aplicação (`app/`, `components/`, `lib/`)
- Migrations Supabase (`supabase/migrations/`)
- Scripts operador (`scripts/`)
- Testes e CI

Todas as lojas recebem o **mesmo código** via deploy Netlify a partir do mesmo repositório.

---

## O que muda por cliente

| Item | Onde |
|------|------|
| Projeto Supabase | Conta isolada por loja |
| Site Netlify | Um site por loja |
| Domínio | DNS / URL pública |
| Env vars | Painel Netlify + `.env.local` local |
| Storage | Buckets `branding` e `products` no Supabase do cliente |
| Branding | Logo, favicon, OG — [`branding/logo.jpeg`](branding/logo.jpeg) (por implantação) |
| Dados | `store_settings`, produtos, categorias, banners |

---

## Resumo desta implantação

| Campo | Valor |
|-------|-------|
| slug | `unitsports` |
| Nome comercial | UnitSports |
| Domínio | https://loja-whats.netlify.app |
| Netlify site | `loja-whats` |
| Status | production |
| coreVersionInstalled | 1.0.0 |

---

## Arquivos desta pasta

| Arquivo | Uso |
|---------|-----|
| [`notes.md`](notes.md) | Ficha operacional — versão core, pendências, suporte |
| [`go-live-checklist.md`](go-live-checklist.md) | Status conhecido do go-live (histórico + pendências) |
| [`env.example`](env.example) | Modelo versionado — **somente placeholders** |
| `.env.local` | Env real desta loja — **gitignored**, nunca commitar |
| [`branding/logo.jpeg`](branding/logo.jpeg) | Logo canônica desta implantação |

---

## Env local

| Arquivo | Versionado | Uso |
|---------|------------|-----|
| [`env.example`](env.example) | Sim | Modelo seguro — copiar e preencher |
| `.env.local` | **Não** (gitignore) | Credenciais reais desta implantação |
| `.env.local` (raiz do repo) | **Não** | Env **ativa** — a que `npm run dev` e scripts leem |

### Trabalhar na UnitSports

**Script (recomendado):**

```bash
npm run env:use -- unitsports
```

**Manual:**

```bash
cp deploy/clients/unitsports/.env.local .env.local
```

### Primeira vez

1. Copiar `env.example` → `deploy/clients/unitsports/.env.local` e preencher valores reais
2. Ou rodar `npm run env:use -- unitsports` — se a raiz já tiver `.env.local`, o script pergunta se deseja inicializar a pasta do cliente `[y/N]`

Ao trocar de cliente, a env anterior da raiz é salva em `.env.local.backup` (gitignored).

---

## Como usar como referência

1. **Nova loja:** copie [`../template/`](../template/) → `deploy/clients/<slug>/`
2. **Consulte** esta pasta para ver exemplos de checklist e notes preenchidos
3. **Não** reutilize dados de catálogo, imagens ou **logo/branding** da UnitSports em outras lojas
4. Registre refs sensíveis em `deploy/clients/clients.local.json` (gitignored)

---

## Secrets

**Nunca** commitar keys Supabase, service role ou `.env` com valores reais.

Env de produção: exclusivamente no **painel Netlify** do site `loja-whats`. Desenvolvimento local: `deploy/clients/unitsports/.env.local` (gitignored) — ativar na raiz com `npm run env:use -- unitsports`.

Supabase project ref: registrar em `clients.local.json` — não versionar nesta pasta.

---

## Documentação relacionada

- Release baseline: [`docs/releases/v1.0.0.md`](../../../docs/releases/v1.0.0.md)
- Migrations aplicadas: [`docs/DATABASE_PLAN.md`](../../../docs/DATABASE_PLAN.md) § implantação UnitSports
- Registry: [`deploy/registry/README.md`](../../registry/README.md)
- Branding operador: [`branding/logo.jpeg`](branding/logo.jpeg) — ver [`branding/README.md`](branding/README.md)
- Legacy (scripts atuais): [`deploy/branding/`](../../branding/) — área de trabalho temporária; ver [`deploy/branding/README.md`](../../branding/README.md)

---

## Observações (jun/2026)

- Migração de imagens: **56** produtos no Storage · **35** ambíguos pendentes validação cliente
- `ENABLE_MIGRATION_TOOLS`: ligar durante onboarding; desligar após catálogo estável
- Logo/branding: [`branding/logo.jpeg`](branding/logo.jpeg) — sync via operador; upload self-service de logo fora do MVP admin
