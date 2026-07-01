# Notas operacionais — sportwear

Segunda implantação de validação multi-client (core único + deploy isolado). **Sem secrets** — refs sensíveis em `deploy/clients/clients.local.json` (gitignored).

---

## Identidade

| Campo | Valor |
|-------|-------|
| slug | `sportwear` |
| Nome comercial | SportWear |
| Domínio público | _(preencher após Netlify)_ |
| Netlify site | _(preencher)_ |
| Status | draft / onboarding |

---

## Supabase

| Campo | Valor |
|-------|-------|
| supabaseProjectRef | Registrar em `clients.local.json` — **não versionar** |
| Projeto | Novo projeto isolado (nome operacional: `sportwear`) |

### Onboarding banco (operador)

1. Criar projeto Supabase novo
2. Aplicar todas migrations do core ([`docs/DATABASE_PLAN.md`](../../../docs/DATABASE_PLAN.md) / MCP `apply_migration`)
3. Popular `store_settings` a partir de [`storefront-preset.json`](storefront-preset.json) (admin ou SQL de seed consciente — ver [`docs/SEEDS.md`](../../../docs/SEEDS.md))
4. Criar admin (`app_metadata.role=admin`)
5. Registrar `lastMigrationApplied` abaixo

---

## Versão do core

| Campo | Valor |
|-------|-------|
| coreVersionInstalled | 1.1.0 |
| lastDeployAt | — |
| lastMigrationApplied | — |

Release baseline: multi-client hardening (defaults neutros, footer DB, `create-client`, anti-slug CI).

---

## Branding

| Campo | Valor |
|-------|-------|
| Logo canônica | [`branding/logo.jpeg`](branding/logo.jpeg) (placeholder do template) |
| Sync | `npm run branding:sync -- sportwear` (carrega env de `deploy/clients/sportwear/.env.local`) |

Fluxo preferido sem copiar env para a raiz:

```bash
npm run dev:client -- sportwear
npm run branding:sync -- sportwear
```

---

## Teste sem Supabase

**Data:** 2026-07-01  
**Objetivo:** validar isolamento do scaffold (segundo cliente), não loja SportWear funcional completa.

### Escopo

- Sem Supabase SportWear, migrations, credenciais UnitSports, upload real de branding
- `storefront-preset.json` **não** é provider de runtime — identidade SportWear no HTML não é critério de sucesso

### Env isolado

Arquivo local gitignored `deploy/clients/sportwear/.env.local`:

```env
DATA_PROVIDER=json
NEXT_PUBLIC_DATA_PROVIDER=json
NEXT_PUBLIC_SITE_URL=http://localhost:3000
QA_BASE_URL=http://localhost:3000
```

### Comandos e resultados

| Comando | Exit | Resultado |
|---------|------|-----------|
| `npm run env:use -- sportwear` | 0 | Env SportWear ativada na raiz; `.env.local` raiz contém só `DATA_PROVIDER=json` (sem Supabase) |
| `npm run branding:sync -- sportwear` | 1 | Lê `deploy/clients/sportwear/branding/logo.jpeg`; falha em `sharp` (`unsupported image format`) — placeholder inválido; **não** faz upload |
| `node scripts/deploy/sync-branding-logo.mjs --client sportwear` | 1 | Mesmo comportamento (logo resolvida pelo slug) |
| `rg -i "UnitSports\|unitsports\|loja-whats\|unitsports.netlify" deploy/clients/sportwear` | — | Hits apenas em [`README.md`](README.md) (links de template para exemplo UnitSports); **zero** em `branding/` após correção |
| `npm run qa:check-no-client-branching` | 0 | OK |
| `npm test` | 0 | 450/450 |
| `npm run build:client -- sportwear` | 0 | Build JSON mode verde |
| `npm run build` (após `env:use`) | 0 | Build JSON mode verde |
| `npm run dev:client -- sportwear` + `npm run test:e2e:smoke:client -- sportwear` | 1 | Smoke parcial — ver limites |

### Smoke local (JSON mode)

Base: `http://localhost:3000` via `dev:client`.

| Caso | Status | Nota |
|------|--------|------|
| cart, admin-login, security-headers | PASS | Rotas estáticas/admin login OK |
| admin-auth | FAIL esperado | Sem `ADMIN_EMAIL`/`ADMIN_PASSWORD` no env SportWear |
| home, plp, hero, categorias, footer | FAIL | `500` por `next/image` com hosts de seed local (`cdn.exemplo.com`) e resíduos em `storage/*.json` gitignored (URLs Supabase UnitSports) — **contaminação de dados locais**, não vazamento de env |
| home-store-name, header-branding | FAIL esperado | Preset não é runtime provider; seeds neutros (`Store`) |

### Limites documentados

1. **Sem Supabase = teste de scaffold**, não de loja real
2. **`env:use` com prompt `[y/N]`** para copiar raiz→cliente é risco operacional — usar `*:client` como fluxo principal; corrigir `env:use` depois
3. **`storage/*.json` local** pode conter dados de sessões anteriores (UnitSports) — limpar ou ignorar ao validar isolamento de env
4. **Logo placeholder** do template não é JPEG válido — substituir antes do go-live
5. **`branding:sync`** exige Supabase real no go-live; falha segura sem credenciais

### Próximos passos (go-live)

1. Criar Supabase SportWear + migrations
2. Aplicar [`storefront-preset.json`](storefront-preset.json) em `store_settings`
3. Preencher `deploy/clients/sportwear/.env.local` com credenciais reais (`DATA_PROVIDER=supabase`)
4. Substituir logo por arte válida → `npm run branding:sync -- sportwear`
5. Netlify + `npm run test:e2e:smoke:client -- sportwear` com `QA_BASE_URL` de produção

---

## Netlify + smoke

1. Novo site Netlify conectado ao repo `main`
2. Env vars de [`env.example`](env.example) — incluir `QA_BASE_URL=https://<site>.netlify.app`
3. Deploy
4. Smoke:

```bash
npm run test:e2e:smoke:client -- sportwear
```

5. Atualizar `coreVersionInstalled`, `lastDeployAt` e entrada em `clients.local.json`

Checklist completo: [`go-live-checklist.md`](go-live-checklist.md)

---

## Pendências

- [ ] Supabase criado + migrations
- [ ] Preset aplicado em `store_settings`
- [ ] Logo real substituindo placeholder
- [ ] Netlify + domínio
- [ ] Smoke QA_BASE_URL verde
- [ ] Catálogo inicial (admin ou import)

---

## Observações

Registrar decisões de onboarding e follow-ups — **sem dados sensíveis**.
