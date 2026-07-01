# Sportwear — implantação

# Template — nova implantação

Copie esta pasta para `deploy/clients/sportwear/` ao onboardar um cliente.

---

## Exemplo preenchido — UnitSports

A primeira loja implantada tem ficha completa em [`../unitsports/`](../unitsports/):

| O que copiar | O que **não** copiar |
|--------------|----------------------|
| Estrutura (README, env.example, checklist, notes) | Catálogo, produtos, imagens |
| Formato de preenchimento de status | Logo, favicon, OG (cada loja tem `branding/` próprio) |
| Referência de pendências operacionais | Dados de `store_settings` |

**Fluxo:** copie **template** para `sportwear` → consulte **unitsports** para ver como documentar status real.

---

## Arquivos

| Arquivo | Uso |
|---------|-----|
| `README.md` | Resumo da implantação |
| `env.example` | Modelo versionado (placeholders) — copiar para `.env.local` |
| `.env.local` | **Gitignored** — credenciais reais do cliente (não incluído no template) |
| `go-live-checklist.md` | Passos até produção |
| `notes.md` | Observações operacionais + `coreVersionInstalled` |

**Env local:** após copiar o template, criar `deploy/clients/sportwear/.env.local` a partir de `env.example`. Ativar na raiz: `npm run env:use -- sportwear`. **Nunca** versionar `.env.local` nem `.env.production`.

**Branding:** cada loja cria `deploy/clients/sportwear/branding/logo.jpeg` após onboarding — **não** incluído no template genérico. Ver exemplo em [`../unitsports/branding/`](../unitsports/branding/).

---

## Links

- Exemplo real: [`deploy/clients/unitsports/`](../unitsports/)
- Registry: [`deploy/registry/README.md`](../../registry/README.md)
- Arquitetura: [`docs/ARCHITECTURE.md`](../../../docs/ARCHITECTURE.md)
- Deploy: [`docs/MULTI_CLIENT_DEPLOYMENT.md`](../../../docs/MULTI_CLIENT_DEPLOYMENT.md)
- Seeds: [`docs/SEEDS.md`](../../../docs/SEEDS.md)

---

## Slug

Substituir `sportwear` em todos os paths — ex.: `loja-joao`, `time-x` (kebab-case, minúsculas).
