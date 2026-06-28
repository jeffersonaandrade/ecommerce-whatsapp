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

Cada loja: `deploy/clients/<slug>/.env.local` (gitignored). Ativar na raiz:

```bash
npm run env:use -- unitsports
```

| Comportamento | Detalhe |
|---------------|---------|
| Ativar | Copia `deploy/clients/<slug>/.env.local` → `.env.local` raiz |
| Backup | Sobrescreve raiz → salva `.env.local.backup` antes |
| Init | Se env do slug não existe e raiz existe → prompt `[y/N]` |
| Segurança | Nunca imprime valores de env |

Script: [`use-client-env.mjs`](use-client-env.mjs)

## Branding por cliente

- **Canônico:** `deploy/clients/<slug>/branding/logo.jpeg`
- **Hoje:** `npm run branding:sync` lê `deploy/branding/` (legacy — copiar logo do slug antes)
- **Futuro:** `npm run branding:sync -- --client unitsports`
- Ver [`deploy/branding/README.md`](../../deploy/branding/README.md)

## Quando usar

1. Cliente novo com imagens locais ou URLs inconsistentes
2. Reimport parcial após correção de CSV
3. Central de Mídia para associação manual por filename (`slug--01.jpg`)

## Pré-requisitos

- `ENABLE_MIGRATION_TOOLS=true` no `.env.local` / Netlify
- `DATA_PROVIDER=supabase`
- Service role para scripts `migrate:images:*` (nunca expor no browser)

## Desligar após go-live

```env
ENABLE_MIGRATION_TOOLS=false
```

Rotas `/admin/import` e `/admin/products/media` retornam 404. Dashboard oculta os cards. Código permanece no repo para futuros clientes.

## Documentação relacionada

- [`docs/MULTI_CLIENT_DEPLOYMENT.md`](../../docs/MULTI_CLIENT_DEPLOYMENT.md) — fluxo N lojas
- [`docs/SEEDS.md`](../../docs/SEEDS.md) — seed vs preset (uma vez na criação)
- [`docs/CORE_VERSION.md`](../../docs/CORE_VERSION.md) — versão do core por implantação
