# Política de compatibilidade — Core multi-cliente

Garantir que **novas versões do core** funcionem em lojas criadas ontem e há um ano, sem exigir fork ou código por cliente.

Relacionado: [`CORE_VERSION.md`](CORE_VERSION.md), [`DATABASE_PLAN.md`](DATABASE_PLAN.md), [`SEEDS.md`](SEEDS.md).

---

## Princípio

```text
Feature nova (ex.: Wishlist)
  ↓
deve funcionar com schema de loja criada na v1.0
  ↓
sem reimplantar do zero
```

---

## Regras de migrations

| Regra | Detalhe |
|-------|---------|
| Idempotência | Preferir `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS` quando suportado |
| Colunas novas | **Sempre opcionais** na primeira release: `NULL` ou `DEFAULT` explícito |
| Defaults no código | Todo campo novo em `StoreSettings` ou tipos deve ter fallback em [`lib/store/settings-defaults.ts`](../lib/store/settings-defaults.ts) |
| Nunca quebrar silenciosamente | Migration que exige backfill deve documentar script operador |
| Aplicar em todos | Cada Supabase de cliente recebe a mesma migration versionada |
| Dual-file | Registrar em `supabase/migrations/` **e** [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql) |
| Remoção | Coluna/tabela **somente** em **major version** + release note + janela documentada |

---

## Versionamento semver (core)

| Tipo | Exemplo | Compatibilidade |
|------|---------|-----------------|
| Patch | v1.0.1 | Bugfix — todos os clientes na mesma minor devem atualizar |
| Minor | v1.1.0 | Feature — migrations aditivas; clientes antigos continuam |
| Major | v2.0.0 | Breaking — plano de migração obrigatório por implantação |

Ver [`CORE_VERSION.md`](CORE_VERSION.md) para rollout seletivo.

---

## Código application-level

- **Não** assumir que coluna existe sem migration aplicada em todos os clientes alvo
- **Não** ler feature como “habilitada” só porque settings tem campo — usar feature flag quando for módulo opcional ([`MULTI_CLIENT_DEPLOYMENT.md`](MULTI_CLIENT_DEPLOYMENT.md))
- Preferir degradar graciosamente (ex.: módulo off) a crash em runtime

---

## Seeds e dados existentes

- Seed SQL / preset JSON: **criação da loja apenas** — ver [`SEEDS.md`](SEEDS.md)
- Re-aplicar seed em cliente existente = risco de sobrescrever branding/produtos
- “Restaurar aparência padrão” no admin = operação consciente, não seed automático

---

## Checklist antes de merge (feature com DB)

- [ ] Migration aditiva e idempotente quando possível
- [ ] Coluna nova nullable ou com default
- [ ] Default no código TypeScript
- [ ] Registro em DATABASE_PLAN + supabase-migrations.sql
- [ ] Release note em `docs/releases/` se minor/major
- [ ] Testes passam com settings “vazios” no campo novo

---

## Anti-padrões

- Remover coluna usada por loja em produção sem major + comunicação
- `ALTER COLUMN ... SET NOT NULL` sem backfill em todos os Supabase
- Feature que só funciona se loja foi criada após data X (sem migration)
- Multi-tenant no mesmo banco como “atalho” de compatibilidade
