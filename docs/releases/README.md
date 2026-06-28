# Releases do Core

Estratégia de versionamento e notas por release. O log detalhado de desenvolvimento continua em [`CHANGELOG.md`](../../CHANGELOG.md) na raiz.

Versão do core: [`CORE_VERSION.md`](../CORE_VERSION.md) · Compatibilidade: [`COMPATIBILITY.md`](../COMPATIBILITY.md)

---

## Dois níveis de registro

| Arquivo | Propósito |
|---------|-----------|
| [`CHANGELOG.md`](../../CHANGELOG.md) | Histórico granular por commit/fase — desenvolvimento |
| `docs/releases/vX.Y.Z.md` | Nota de release **operacional** — o que cada implantação recebe |

---

## Índice de releases

| Versão | Data | Notas | Clientes atualizados |
|--------|------|-------|----------------------|
| v1.0.0 | 2026-06-27 | [v1.0.0.md](v1.0.0.md) | unitsports (baseline produção) |

---

## Template — nova release

Ao publicar versão `vX.Y.Z`, criar `docs/releases/vX.Y.Z.md`:

```markdown
# Core vX.Y.Z

## Resumo
- ...

## Migrations obrigatórias
- `202606XXXXXXXX_nome` — aplicar em todos os Supabase alvo

## Breaking changes
- Nenhum | ...

## Feature flags / env
- ...

## Clientes atualizados
| slug | coreVersionInstalled | data | smoke |
|------|---------------------|------|-------|
| unitsports | X.Y.Z | YYYY-MM-DD | OK |

## Rollback
- ...
```

---

## Fluxo

1. Bump `version` em `package.json` (quando adotado formalmente)
2. Tag Git `vX.Y.Z` (opcional)
3. Entrada em CHANGELOG.md
4. Arquivo `docs/releases/vX.Y.Z.md`
5. Atualizar `coreVersionInstalled` em [`deploy/clients/`](../deploy/clients/) e `clients.local.json`

---

## Baseline atual

**v1.0.0** = estado do core com implantação UnitSports em produção (`loja-whats.netlify.app`) em 2026-06-27, incluindo onboarding tour Fase 3, import CSV, Central de Mídia, banners, Supabase.
