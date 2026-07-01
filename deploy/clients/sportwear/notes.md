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
| Sync | `npm run env:use -- sportwear` → `npm run branding:sync -- --client sportwear` |

---

## Netlify + smoke

1. Novo site Netlify conectado ao repo `main`
2. Env vars de [`env.example`](env.example) — incluir `QA_BASE_URL=https://<site>.netlify.app`
3. Deploy
4. Smoke:

```bash
npm run env:use -- sportwear
QA_BASE_URL=https://<site>.netlify.app npm run test:e2e:smoke
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
