# Import Pipeline

Arquitetura da importação CSV (Fase 5). Formato de colunas: [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md).

## Fluxo

```text
Upload (CSV-1) → Parser (CSV-2) → Preview (CSV-3) → Importação (CSV-4) → ProductRepository
```

**Preview obrigatório** — nenhuma gravação sem revisão e confirmação explícita.

## Regras do pipeline

| Regra | Detalhe |
|-------|---------|
| Agrupamento | `Identificador URL` (slug) — uma linha por variação |
| Parser | `lib/catalog/import/*` — testável, sem lógica na page |
| Persistência | `ProductRepository` — create/update por slug, rollback em falha |
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

Importação bloqueada enquanto houver erros bloqueantes.

## Fora de escopo

- Histórico de importações (CSV-5 — adiar)
- Download de imagens para storage
- Exportação CSV
- Supabase (Fase 7)

## Código

```text
lib/catalog/import/     parser, validação, apply
app/admin/import/       wizard upload → preview → resultado
components/admin/import/
```

Histórico (CSV-5) adiado — prioridade: Purchase Intent + WhatsApp.
