# Ferramentas operador — migração de imagens e import

Scripts npm documentados em [`scripts/README.md`](../README.md).

**Status UnitSports (jun/2026):** 56 produtos com imagem no Storage · 35 associações ambíguas pendentes validação cliente.

## Convenção de pastas (alvo)

Estrutura documentada para scripts futuros — **não reorganizar arquivos existentes nesta fase**:

```text
scripts/operator/
  deploy/       # deploy-all-clients.mjs (futuro), smoke pós-deploy
  migration/    # apply migrations em lote (futuro)
  branding/     # sync logo, generate assets (hoje em scripts/deploy/)
  restore/      # ferramentas de reset operador
  README.md     # este índice
```

| Pasta alvo | O que existe hoje | Futuro |
|------------|-------------------|--------|
| `deploy/` | — | `deploy-all-clients.mjs`, smoke por slug |
| `migration/` | [`scripts/migration/`](../migration/) | wrapper multi-Supabase |
| `branding/` | [`scripts/deploy/sync-branding-logo.mjs`](../deploy/sync-branding-logo.mjs) | `branding:sync -- --client <slug>` lendo `deploy/clients/<slug>/branding/` |
| `restore/` | — | reset operador documentado |

Registry de lojas: [`deploy/registry/README.md`](../../deploy/registry/README.md). Manifesto operacional: `deploy/clients/clients.local.json` (gitignored).

## Env por cliente

Fonte canônica: `deploy/clients/<slug>/.env.local` (gitignored).

### Comandos oficiais

Carregam **exclusivamente** o env do slug — sem copiar para a raiz:

```bash
npm run dev:client -- unitsports
npm run build:client -- unitsports
npm run start:client -- unitsports
npm run test:e2e:smoke:client -- unitsports
```

### Preflight deploy

```bash
npm run deploy:check -- unitsports
```

Valida readiness read-only antes do Netlify. Não substitui smoke pós-deploy.

Scripts: [`client-env.mjs`](client-env.mjs), [`run-with-client-env.mjs`](run-with-client-env.mjs), [`deploy-check.mjs`](deploy-check.mjs)

### Legado — `env:use` (evitar)

```bash
npm run env:use -- unitsports   # legado — copia slug → raiz
```

| Regra | Detalhe |
|-------|---------|
| Não usar no fluxo normal | Preferir `*:client` |
| Não inicializa a partir da raiz | Falha se env do slug não existir |
| Nunca raiz → cliente | Proibido copiar `.env.local` da raiz para `deploy/clients/<slug>/` |

Script: [`use-client-env.mjs`](use-client-env.mjs)

## Branding por cliente

- **Canônico:** `deploy/clients/<slug>/branding/logo.jpeg`
- **Sync:** `npm run branding:sync -- <slug>` (env + logo do slug; fallback legacy `deploy/branding/`)
- Ver [`deploy/branding/README.md`](../../deploy/branding/README.md)

## Scaffold nova loja

```bash
npm run create-client -- sportwear
```

Gera `deploy/clients/<slug>/` (env.example, notes, preset, branding placeholder). Ver [`create-client.mjs`](create-client.mjs).

## Anti-slug (CI)

```bash
npm run qa:check-no-client-branching
```

Proíbe `if (slug === "cliente")` no core. Regra em [`AGENTS.md`](../../AGENTS.md).

## Quando usar

1. Cliente novo com imagens locais ou URLs inconsistentes
2. Reimport parcial após correção de CSV
3. Central de Mídia para associação manual por filename (`slug--01.jpg`)

## Pré-requisitos (scripts CLI)

- `DATA_PROVIDER=supabase`
- Service role para scripts `migrate:images:*` (nunca expor no browser)

Import CSV (`/admin/import`) e Central de Mídia (`/admin/products/media`) estão **sempre** no admin — sem variável de env.

## Documentação relacionada

- [`docs/MULTI_CLIENT_DEPLOYMENT.md`](../../docs/MULTI_CLIENT_DEPLOYMENT.md) — fluxo N lojas
- [`docs/SEEDS.md`](../../docs/SEEDS.md) — seed vs preset (uma vez na criação)
- [`docs/CORE_VERSION.md`](../../docs/CORE_VERSION.md) — versão do core por implantação
