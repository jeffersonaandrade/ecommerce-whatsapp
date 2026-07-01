# Deploy multi-cliente

Como propagar o **mesmo core** para várias lojas: Netlify + Supabase + domínio por cliente.

Arquitetura: [`ARCHITECTURE.md`](ARCHITECTURE.md) · Versão: [`CORE_VERSION.md`](CORE_VERSION.md) · Compatibilidade: [`COMPATIBILITY.md`](COMPATIBILITY.md)

---

## Modelo

```text
main (core)
  ↓ GitHub Actions (CI leve: anti-slug + testes)
  ↓ migrate (cada Supabase)
  ↓ deploy + build real (cada Netlify, envs no painel)
  ↓ smoke pós-deploy (obrigatório)
  Cliente A, B, C…
```

**Não** multi-tenant no mesmo banco. **Não** fork por cliente.

---

## CI e validação

Workflow: [`.github/workflows/qa.yml`](../.github/workflows/qa.yml)

### Estado atual — GitHub Actions secretless

| Responsável | O que valida |
|-------------|--------------|
| **GitHub Actions** | `qa:check-no-client-branching` + `npm test` |
| **Netlify** | Build/deploy real com envs de produção (já no painel) |
| **Operador** | Smoke pós-deploy + checkout E2E (carrinho → WhatsApp) |

**Netlify:** o rebuild **não** reporta via GitHub Commit Status neste repositório. Validar pelo **Netlify Dashboard** (deploy verde) + **smoke** + **checkout E2E** em produção — não pelo status do commit no GitHub.

Não duplicamos secrets Netlify → GitHub nesta fase. Sem `npm run build` no Actions; sem placeholders Supabase; sem gerar `.env.local` no runner.

```bash
# Pós-deploy (UnitSports)
PLAYWRIGHT_BASE_URL=https://unitsports.netlify.app npm run test:e2e:smoke:client -- unitsports
PLAYWRIGHT_BASE_URL=https://unitsports.netlify.app npm run test:e2e:checkout:client -- unitsports
```

### Futuro — CI completo (opcional)

Com secrets UnitSports no GitHub (`UNITSPORTS_*`), reativar `npm run build:client -- unitsports` no workflow. Detalhes: [`deploy/clients/unitsports/README.md`](../deploy/clients/unitsports/README.md) § GitHub Actions.

---

## Fluxo — atualizar 5 lojas

1. **Desenvolver** feature no `main`; `npm test` + `npm run build:netlify`
2. **Release** — bump versão, [`CHANGELOG.md`](../CHANGELOG.md), [`docs/releases/`](releases/)
3. **Decidir rollout** — todos ou subset ([`CORE_VERSION.md`](CORE_VERSION.md))
4. **Por cliente:**
   - Listar migrations pendentes vs `supabase_migrations.schema_migrations`
   - Aplicar via MCP `apply_migration` ou SQL Editor (registrar em DATABASE_PLAN)
   - Deploy Netlify (build hook ou push branch conectada)
   - Smoke: `QA_BASE_URL=https://dominio-do-cliente npm run test:e2e:smoke`
   - Atualizar `coreVersionInstalled` em [`deploy/clients/`](../deploy/clients/) e `clients.local.json`
5. **Registrar** na release note quais slugs foram atualizados

---

## O que muda por cliente (apenas dados/env)

| Item | Onde |
|------|------|
| Supabase URL + keys | Netlify env |
| Domínio | Netlify DNS |
| Nome, logo, cores, textos | `store_settings` + Storage |
| Produtos, categorias, banners | Postgres + Storage |
| WhatsApp, e-mail | `store_settings` |
| Branding (repo) | `deploy/clients/<slug>/branding/logo.jpeg` |
| Branding (runtime) | Supabase Storage bucket `branding` |
| `ENABLE_MIGRATION_TOOLS` | Env (fase onboarding) |

---

## Env local por cliente

Cada implantação guarda credenciais em `deploy/clients/<slug>/.env.local` (**gitignored**). Esse arquivo é a **única** fonte de env nos comandos oficiais.

| Arquivo | Versionado | Papel |
|---------|------------|-------|
| `deploy/clients/<slug>/env.example` | Sim | Modelo seguro (placeholders) |
| `deploy/clients/<slug>/.env.local` | **Não** | Env real da implantação — fonte dos comandos `*:client` |
| `.env.local` (raiz) | **Não** | **Legado** — só relevante se usar `env:use` manualmente |

### Comandos oficiais (fluxo normal)

Carregam **exclusivamente** `deploy/clients/<slug>/.env.local`. Não copiam secrets para a raiz. Sem fallback para outro cliente.

```bash
npm run dev:client -- sportwear
npm run build:client -- unitsports
npm run start:client -- unitsports
npm run test:e2e:smoke:client -- unitsports
```

Implementação: [`scripts/operator/client-env.mjs`](../scripts/operator/client-env.mjs) + [`run-with-client-env.mjs`](../scripts/operator/run-with-client-env.mjs).

Smoke local típico (UnitSports):

```bash
npm run build:client -- unitsports
npm run start:client -- unitsports
# outro terminal:
npm run test:e2e:smoke:client -- unitsports
```

`branding:sync` com slug (`npm run branding:sync -- unitsports`) também carrega env do slug, não da raiz.

### Preflight — `deploy:check`

Antes de criar site Netlify ou disparar deploy, validar readiness **read-only**:

```bash
npm run deploy:check -- sportwear
npm run deploy:check -- unitsports
```

Script: [`scripts/operator/deploy-check.mjs`](../scripts/operator/deploy-check.mjs)

| Valida | Não faz |
|--------|---------|
| Scaffold (`env.example`, `.env.local`, preset, branding, notes) | Criar Supabase |
| Env Supabase + URLs (sem imprimir secrets) | Rodar migrations |
| Preset JSON + anti-vazamento entre clientes | Aplicar preset no banco |
| Logo válida (sharp) | Upload de branding |
| Supabase read-only (`store_settings`, categorias, produtos, banners) | Alterar dados |
| Versão core vs `notes.md` | Substituir smoke pós-deploy |

Exit codes: `0` deploy-ready · `1` blockers · `2` erro de uso (slug ausente/inválido).

Após deploy Netlify, rodar `test:e2e:smoke:client` — preflight **não** substitui smoke.

### Legado — `env:use` (não usar no fluxo normal)

```bash
npm run env:use -- unitsports   # legado — evitar
```

Copia `deploy/clients/<slug>/.env.local` → `.env.local` na raiz para ferramentas que ainda leem só a raiz.

| Regra | Detalhe |
|-------|---------|
| **Não** é fluxo principal | Use sempre `dev/build/start/test:e2e:smoke:client` |
| **Não** inicializa slug a partir da raiz | Se `deploy/clients/<slug>/.env.local` não existir, falha — copie de `env.example` manualmente |
| **Nunca** copiar raiz → cliente | Proibido propagar credenciais de um slug para outro |
| Backup | Sobrescreve raiz → salva `.env.local.backup` antes |

### Primeira vez (inicializar env do slug)

1. Copiar `env.example` → `deploy/clients/<slug>/.env.local` e preencher
2. Rodar `npm run dev:client -- <slug>` — **não** depende de `.env.local` na raiz

### Riscos

| Risco | Mitigação |
|-------|-----------|
| Misturar Supabase de clientes | Comandos `*:client`; env por slug |
| Commitar secrets | `.gitignore` explícito; só `env.example` versionado |
| Fallback silencioso | Scripts client-aware falham se env do slug ausente |
| Contaminação JSON local | `storage/*.json` gitignored — reset por cliente no dev JSON mode |

---

## Branding por cliente

O core **não** possui logo global. Cada implantação mantém sua fonte em:

```text
deploy/clients/<slug>/branding/logo.jpeg
```

### Processo recomendado (operador)

1. Identificar slug (ex.: `unitsports`)
2. Colocar/atualizar logo em `deploy/clients/<slug>/branding/logo.jpeg`
3. Confirmar env apontando para o Supabase **desse** cliente
4. Sincronizar derivados (favicon, OG) para o Storage da implantação
5. Validar header, favicon e OG na URL pública

### Sync por slug (implementado)

```bash
npm run branding:sync -- unitsports
# ou: node scripts/deploy/sync-branding-logo.mjs --client unitsports
```

Comportamento:

- Lê `deploy/clients/<slug>/branding/logo.*` (fallback legacy: `deploy/branding/`)
- Com slug informado, carrega env de `deploy/clients/<slug>/.env.local` (**não** usa raiz)
- Gera favicon, OG e derivados
- Publica no Supabase Storage da env **desse** cliente

**Nunca** copiar logo da UnitSports para outras lojas.

### Scaffold nova loja

```bash
npm run create-client -- sportwear
```

Gera `deploy/clients/<slug>/` com preset, env.example, notes e branding placeholder.

### Legacy (`deploy/branding/`)

Ainda suportado como fallback quando `--client` não é passado. Preferir sempre `--client <slug>`.

Ver [`deploy/branding/README.md`](../deploy/branding/README.md).

---

## Regra anti-slug

É **proibido** branching por slug ou nome de cliente no core. Enforcement:

```bash
npm run qa:check-no-client-branching
```

Ver [`AGENTS.md`](../AGENTS.md) e [`MULTI_CLIENT_LEXICAL_AUDIT.md`](MULTI_CLIENT_LEXICAL_AUDIT.md).

---

```text
Feature flag  → habilita MÓDULO
Store settings → configura CONTEÚDO do módulo habilitado
```

| Correto | Errado |
|---------|--------|
| `features.bannerCMS = enabled` + slides em DB | `showBanner: true` em settings no lugar de flag |
| `ENABLE_MIGRATION_TOOLS=true` (env operador) | `storeName` ou cores em feature flag |
| Futuro: `store_features.wishlist` | Flag substituindo configuração normal |

**Quando usar env flag:** ferramentas de operador/onboarding (`ENABLE_MIGRATION_TOOLS`), build-time, kill-switch global.

**Quando usar DB flag (futuro):** módulo opcional por plano comercial (wishlist, coupons, checkout).

**Quando NÃO usar flag:** branding, nome da loja, conteúdo — sempre `store_settings` ou tabelas de conteúdo.

Proposta futura (não implementar agora):

```sql
-- opção A: tabela store_features
-- opção B: JSONB store_settings.enabled_features
```

---

## Migrations multi-Supabase

- Toda mudança de schema → arquivo em [`supabase/migrations/`](../supabase/migrations/) + bloco em [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql)
- Aplicar **em cada** projeto Supabase de cliente ativo
- Regras: [`COMPATIBILITY.md`](COMPATIBILITY.md), seeds: [`SEEDS.md`](SEEDS.md)
- Nunca migration manual sem registro

---

## Automação futura

Especificação — **não implementada**:

[`scripts/operator/deploy/deploy-all-clients.mjs`](../scripts/operator/README.md)

```text
1. Ler deploy/clients/clients.local.json
2. Por slug: checar migrations pendentes (API Supabase)
3. Disparar Netlify build hook
4. GET smoke na URL pública
5. Gerar relatório markdown
```

---

## Manifesto de clientes

| Arquivo | Versionado | Uso |
|---------|------------|-----|
| `clients.example.json` | Sim | Formato documentação |
| `clients.local.json.example` | Sim | Template para copiar |
| `clients.local.json` | **Gitignore** | Registry operacional real |

Ver [`deploy/registry/README.md`](../deploy/registry/README.md).

---

## Riscos

### Técnicos

- Migration aplicada em 4/5 Supabase — inconsistência de schema
- Re-seed acidental — perda de dados cliente
- QA com URL hardcoded de uma implantação

### Comerciais

- Cliente A recebe feature, B não — comunicação e contrato
- Breaking change sem janela — downtime

---

## O que NÃO fazer

- Fork/cópia do repo por loja
- Branch permanente por cliente
- `if (storeName === 'X')` no código
- Multi-tenant (`store_id`) no mesmo Postgres
- Commitar secrets ou `clients.local.json`
- Deploy/migrate produção sem smoke

---

## Nova loja

1. Copiar checklist: [`deploy/clients/template/go-live-checklist.md`](../deploy/clients/template/go-live-checklist.md)
2. Consultar referência preenchida: [`deploy/clients/unitsports/`](../deploy/clients/unitsports/)

---

## Implantação de referência — UnitSports

[`deploy/clients/unitsports/`](../deploy/clients/unitsports/) documenta a **primeira loja real** em produção. Serve como exemplo de como preencher ficha operacional — **não** como fonte de dados para outras lojas.

```text
Core (main)
  ↓ deploy Netlify
  ├─ UnitSports — Supabase A — unitsports.netlify.app
  ├─ Cliente B   — Supabase B — dominio-b.com.br
  └─ Cliente C   — Supabase C — dominio-c.com.br
```

| Recurso | UnitSports (referência) |
|---------|-------------------------|
| Ficha | [`README.md`](../deploy/clients/unitsports/README.md) |
| Env template | [`env.example`](../deploy/clients/unitsports/env.example) |
| Go-live status | [`go-live-checklist.md`](../deploy/clients/unitsports/go-live-checklist.md) |
| Notas operacionais | [`notes.md`](../deploy/clients/unitsports/notes.md) |
| Branding | [`branding/logo.jpeg`](../deploy/clients/unitsports/branding/logo.jpeg) |

**Fluxo recomendado para nova loja:**

1. Copiar [`deploy/clients/template/`](../deploy/clients/template/) → `deploy/clients/<slug>/`
2. Consultar `unitsports/` para ver exemplos de checklist e notes preenchidos
3. Criar Supabase + Netlify isolados; env real só no painel Netlify
4. Registrar slug em [`deploy/registry/README.md`](../deploy/registry/README.md) e `clients.local.json`

**Nunca** commitar secrets, project refs ou dados de catálogo/branding de outro cliente nesta pasta.
