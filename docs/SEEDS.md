# Política de seeds e presets

Evitar bugs causados por **re-aplicar dados iniciais** em lojas já operacionais.

---

## Regra de ouro

```text
Seed / preset default
  ↓
executa na CRIAÇÃO da loja (implantação inicial)
  ↓
NUNCA re-aplicar automaticamente em cliente existente
```

Exceção consciente: **Restaurar aparência padrão** no admin (ferramenta de operador) — ação explícita, não migration.

---

## Tipos de “seed” no projeto

| Tipo | Onde | Quando usar | Re-aplicar? |
|------|------|-------------|-------------|
| SQL seed migration | `supabase/migrations/*seed*` | Projeto Supabase **novo** | Não em DB existente |
| Preset visual JSON | [`deploy/netlify/default-storefront-preset.json`](../deploy/netlify/default-storefront-preset.json) | Restore / implantação | Só via restore consciente |
| Defaults código | [`lib/store/settings-defaults.ts`](../lib/store/settings-defaults.ts) | Fallback quando DB vazio | Código — merge, não overwrite |
| Demo Netlify JSON | [`deploy/netlify/store-settings.json`](../deploy/netlify/store-settings.json) | Build demo sem Supabase | Por deploy demo |
| Import CSV | `/admin/import` | Catálogo do **cliente** | Por lote import — não é seed global |
| Branding assets | [`deploy/branding/`](../deploy/branding/) | Implantação logo/favicon | `npm run branding:sync` — operador |

---

## Fluxo implantação nova loja

1. Criar projeto Supabase vazio
2. Aplicar migrations do core (schema; seeds SQL só se projeto novo)
3. Configurar env Netlify + domínio
4. Criar admin; configurar `store_settings` via admin ou migrate script
5. Implantar logo (`deploy/branding/` ou pasta por slug — decisão pendente)
6. Onboarding guiado + import CSV do cliente
7. **Não** re-rodar seed SQL em produção após go-live

---

## Riscos documentados

| Ação | Risco |
|------|-------|
| Re-executar `seed_products_batch_*` | Duplica ou conflita produtos |
| Re-aplicar preset em settings existentes | Sobrescreve textos/cores do cliente |
| Migration com `INSERT` não idempotente | Falha ou duplicata em segundo apply |

---

## Relacionado

- [`COMPATIBILITY.md`](COMPATIBILITY.md) — migrations aditivas
- [`deploy/clients/template/go-live-checklist.md`](../deploy/clients/template/go-live-checklist.md)
- [`DATABASE_PLAN.md`](DATABASE_PLAN.md)
