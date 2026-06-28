# Import Pipeline

Arquitetura da importação CSV (Fase 5). Formato de colunas: [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md).

## Fluxo

```text
Upload (CSV-1) → Parser (CSV-2) → Preview (CSV-3) → Importação (CSV-4) → RPC Supabase
                                                              ↓
                                                    apply_product_import_batch(jsonb)
                                                              ↓
                                              Central de Mídia (pós-import, opcional)
```

**Preview obrigatório** — nenhuma gravação sem revisão e confirmação explícita.

**Import CSV e Central de Mídia:** sempre disponíveis no admin (`/admin/import`, `/admin/products/media`).

## Regras do pipeline

| Regra | Detalhe |
|-------|---------|
| Agrupamento | `Identificador URL` (slug) — uma linha por variação |
| Parser | `lib/catalog/import/*` — testável, sem lógica na page |
| Persistência Supabase | RPC `apply_product_import_batch(jsonb)` — transação única set-based |
| SKU | Validado no parser **e** revalidado pós-upsert de `products` (migration `20260626224221`) |
| HTML | `stripHtml` em descrições no apply — evita `<p>...</p>` cru na vitrine |
| Imagens V1 | Validar `image_urls` localmente (HTTPS, host público, extensão); **sem HEAD/rede** |
| Limites parse | CSV até 2 MB, até 500 produtos, até 5 URLs por produto |
| Pós-import | Central de Mídia em `/admin/products/media` — URL quebrada ≠ produto sem imagem |
| WhatsApp-ready | slug, SKU, preço, variações, imagens URL |

## Validação (critérios bloqueantes)

| Código | Descrição |
|--------|-----------|
| CSV_E001 | Mesmo slug com campos de produto conflitantes |
| CSV_E002 | SKU duplicado no arquivo ou já no catálogo |
| CSV_E003 | URL de imagem inválida |
| CSV_E004 | Preço promocional ≥ preço |
| CSV_E005 | SKU/estoque/preço inválidos |
| CSV_E006 | Slug vazio ou coluna obrigatória ausente |
| CSV_E007 | Dimensões inválidas (**warning**, não bloqueia) |
| CSV_E008 | Categoria desconhecida (CRUD v1.1 — slug deve existir em `categories`) |

Importação bloqueada enquanto houver erros bloqueantes.

## Migração de imagens locais → Storage (operacional)

Fluxo separado do CSV — para catálogo já importado com URLs externas (ex.: mitiendanube) e arquivos locais exportados.

```text
dry-run → classificar seguro/ambíguo → upload piloto → upload lote → validação manual cliente
```

| Etapa | Comando | Saída |
|-------|---------|-------|
| Dry-run | `npm run migrate:images:dry-run` | `test-data/reports/LOCAL_IMAGE_MIGRATION_DRY_RUN.md` |
| Piloto (10) | `npm run migrate:images:pilot` | relatório JSON/MD |
| Restante seguros | `npm run migrate:images:remaining` | atualiza `products.images` no Supabase |
| Todos seguros | `npm run migrate:images:all-safe` | dry-run + remaining |

**Matching (`lib/catalog/media/local-image-migration/`):** URL exata do CSV → nome de arquivo exato → verificação de cor. **Nunca** associa por similaridade de nome.

**Estado UnitSports (2026-06-26):** 56 produtos no Storage · 35 ambíguos pendentes.

## Fora de escopo

- Histórico de importações (CSV-5 — adiar)
- Download automático de imagens durante o parse CSV (feito via Central de Mídia ou scripts operacionais)
- Exportação CSV

## Código

```text
lib/catalog/import/              parser, validação, apply, supabase-import
lib/catalog/media/               classify-url, client-upload, filename-association
lib/catalog/media/local-image-migration/   dry-run e matching local
lib/env/migration-tools.ts       feature flag onboarding
app/admin/import/                wizard upload → preview → resultado
app/admin/products/media/        inventário + wizard upload
components/admin/import/
components/admin/media/
scripts/migration/dry-run-local-images.mjs
scripts/migration/upload-local-images-pilot.mjs
```

Histórico (CSV-5) adiado — prioridade: validação cliente + publicação catálogo.
