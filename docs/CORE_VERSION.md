# Versão do Core (CORE_VERSION)

Conceito documentado — **sem implementação runtime nesta fase**.

---

## O que é

**Core** = este repositório (código, migrations, admin, import, onboarding).  
**CORE_VERSION** = semver da release do core (ex.: `v1.0.0`, `v1.8.0`).

Cada **implantação** (Netlify + Supabase + domínio) registra qual versão do core está em produção.

```text
GitHub main (core)
  ↓ tag / release v1.8.0
  ├─ Cliente A — Netlify A — Supabase A — core v1.8.0
  ├─ Cliente B — Netlify B — Supabase B — core v1.8.0
  ├─ Cliente C — Netlify C — Supabase C — core v1.7.2 (atualização pendente)
  └─ Cliente D — Netlify D — Supabase D — core v1.8.0
```

---

## Alinhamento com package.json

Hoje [`package.json`](../package.json) declara `"version": "1.0.0"`. Recomendação:

- Bump de **minor** quando houver feature + migrations aditivas
- Bump de **patch** para bugfix
- Bump de **major** para breaking change ([`COMPATIBILITY.md`](COMPATIBILITY.md))

Tag Git opcional: `v1.0.0` espelhando `package.json`.

---

## Onde registrar por cliente

| Local | Uso |
|-------|-----|
| [`deploy/clients/<slug>/notes.md`](../deploy/clients/unitsports/notes.md) | Ficha estática da implantação |
| `deploy/clients/clients.local.json` | Manifesto operacional (gitignored) — campo `coreVersionInstalled` |
| [`deploy/registry/README.md`](../deploy/registry/README.md) | Índice de lojas e versões |

Campos sugeridos:

```json
{
  "coreVersionInstalled": "1.0.0",
  "lastDeployAt": "2026-06-27",
  "lastMigrationApplied": "20260627210000_store_onboarding"
}
```

Futuro (opcional): env Netlify `CORE_VERSION=1.0.0` para smoke automatizado.

---

## Fluxo de atualização

1. Desenvolver no `main`; testes + build verdes
2. Atualizar [`CHANGELOG.md`](../CHANGELOG.md) e criar nota em [`docs/releases/`](releases/)
3. Decidir **quais clientes** recebem a versão (rollout seletivo)
4. Por cliente escolhido:
   - Aplicar migrations pendentes no Supabase dele
   - Deploy Netlify (mesmo commit/tag)
   - Smoke test (`QA_BASE_URL` = domínio do cliente)
   - Atualizar `coreVersionInstalled` no registry local
5. Clientes não atualizados permanecem na versão anterior até decisão explícita

---

## Critérios de rollout

| Tipo de release | Rollout sugerido |
|-----------------|------------------|
| Patch (bugfix segurança/crítico) | Todos os clientes em produção |
| Minor (feature) | Todos após smoke; ou piloto em 1 cliente |
| Major (breaking) | Planejado por cliente; janela + comunicação |

---

## Decisão pendente

**Quando taggear `v1.0.0` formal?** Sugestão: estado atual da implantação UnitSports em produção = baseline `1.0.0`.
