# Deploy multi-cliente

Como propagar o **mesmo core** para várias lojas: Netlify + Supabase + domínio por cliente.

Arquitetura: [`ARCHITECTURE.md`](ARCHITECTURE.md) · Versão: [`CORE_VERSION.md`](CORE_VERSION.md) · Compatibilidade: [`COMPATIBILITY.md`](COMPATIBILITY.md)

---

## Modelo

```text
main (core)
  ↓ CI / testes
  ↓ migrate (cada Supabase)
  ↓ deploy (cada Netlify)
  Cliente A, B, C…
```

**Não** multi-tenant no mesmo banco. **Não** fork por cliente.

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

Cada implantação guarda credenciais em `deploy/clients/<slug>/.env.local` (**gitignored**).

| Arquivo | Versionado | Papel |
|---------|------------|-------|
| `deploy/clients/<slug>/env.example` | Sim | Modelo seguro (placeholders) |
| `deploy/clients/<slug>/.env.local` | **Não** | Env real da implantação |
| `.env.local` (raiz) | **Não** | Legacy — env ativa quando se usa `env:use` |
| `.env.local.backup` | **Não** | Backup ao trocar de cliente via `env:use` |

### Fluxo preferido — client-aware (sem copiar secrets para raiz)

```bash
npm run dev:client -- sportwear
npm run build:client -- unitsports
npm run start:client -- sportwear
npm run test:e2e:smoke:client -- unitsports
```

Implementação: [`scripts/operator/run-with-client-env.mjs`](../scripts/operator/run-with-client-env.mjs) carrega `deploy/clients/<slug>/.env.local` e executa o comando. Falha clara se o arquivo não existir. **Sem fallback** para outro cliente.

### Compatibilidade — `env:use`

```bash
npm run env:use -- unitsports
```

Copia `deploy/clients/<slug>/.env.local` → `.env.local` na raiz. Mantido para compatibilidade; preferir `*:client` no dia a dia.

**Risco conhecido:** se o env do slug não existir, `env:use` pergunta se deseja inicializar a partir da `.env.local` da raiz (`[y/N]`) — pode propagar credenciais do cliente errado. **Nunca** responder `y` sem confirmar o slug. Correção futura planejada.

Manual legacy: `cp deploy/clients/<slug>/.env.local .env.local`

### Primeira vez (inicializar env do slug)

1. Copiar `env.example` → `deploy/clients/<slug>/.env.local` e preencher
2. Rodar com `npm run dev:client -- <slug>` — **não** depende de copiar para raiz

### Riscos

| Risco | Mitigação |
|-------|-----------|
| Misturar Supabase de clientes | Env por slug; `*:client` ou `env:use` consciente |
| Perder env ao trocar cliente | Backup automático em `.env.local.backup` (só `env:use`) |
| Commitar secrets | `.gitignore` explícito; só `env.example` versionado |
| Fallback silencioso | Scripts client-aware falham se env do slug ausente |

Next.js ainda lê `.env.local` na raiz quando o processo é iniciado **sem** wrapper — por isso `build:client`/`dev:client` injetam env no processo filho.

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
