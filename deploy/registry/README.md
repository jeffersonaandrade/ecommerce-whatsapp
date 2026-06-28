# Registry de implantações

Índice operacional de lojas que usam este core. Dados sensíveis ficam em **`deploy/clients/clients.local.json`** (gitignored).

---

## Como cadastrar nova loja

1. Escolher **slug** (ver convenções abaixo)
2. Copiar [`deploy/clients/template/`](../clients/template/) → `deploy/clients/<slug>/`
3. Consultar [`deploy/clients/unitsports/`](../clients/unitsports/) como **referência estrutural** (como preencher checklist/notes — não copiar dados do cliente)
4. Copiar [`clients.local.json.example`](../clients/clients.local.json.example) → `clients.local.json` e adicionar entrada (inclui `supabaseProjectRef` — **não versionar**)
5. Criar projeto Supabase + site Netlify
6. Seguir [`go-live-checklist.md`](../clients/template/go-live-checklist.md)
7. Registrar `coreVersionInstalled` após primeiro deploy ([`CORE_VERSION.md`](../../docs/CORE_VERSION.md))

---

## Convenção de slug

| Regra | Exemplo |
|-------|---------|
| kebab-case, minúsculas | `unitsports`, `loja-joao` |
| Sem espaços ou acentos | `time-x-sp` |
| Estável — não renomear após go-live | — |
| Único no registry | — |

---

## Campos por implantação

| Campo | Descrição |
|-------|-----------|
| `slug` | Identificador interno |
| `name` | Nome comercial exibido |
| `netlifySite` | Nome do site no Netlify |
| `domain` | URL pública (https) |
| `supabaseProjectRef` | Ref do projeto Supabase |
| `coreVersionInstalled` | Semver do core em produção |
| `status` | `draft` \| `onboarding` \| `production` \| `paused` |
| `features` | Módulos habilitados (referência) |

---

## Onde registrar versão do core

- `deploy/clients/<slug>/notes.md` — ficha versionada (sem secrets)
- `deploy/clients/clients.local.json` — manifesto operacional local
- Release notes: [`docs/releases/`](../../docs/releases/)

Atualizar **sempre** após deploy + smoke bem-sucedido.

---

## Implantações documentadas

| slug | Ficha | Status | Notas |
|------|-------|--------|-------|
| unitsports | [`deploy/clients/unitsports/`](../clients/unitsports/) | production | **Referência operacional real** — primeira loja; consultar estrutura preenchida ao onboardar novas lojas |

`supabaseProjectRef` e env reais: apenas em `clients.local.json` (gitignored).

---

## Decisão pendente

Logos: manter [`deploy/branding/`](../branding/) único no repo ou mover para `deploy/clients/<slug>/branding/`?
