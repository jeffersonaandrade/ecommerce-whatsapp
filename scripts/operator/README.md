# Ferramentas operador — migração de imagens e import

Scripts npm documentados em [`scripts/README.md`](../scripts/README.md).

**Status UnitSports (jun/2026):** 56 produtos com imagem no Storage · 35 associações ambíguas pendentes validação cliente.

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
