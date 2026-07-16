# UnitSports — imagens quebradas (camisas lote 01)

Gerado em: 2026-07-16T23:27:13.202Z (atualizado após análise complementar)

## Resumo

- Lote: `PStoom-camisas-26-27-lote-01.csv`
- Batch ID: `fdb26aef-3efd-46fd-b6f1-b30747b4c364`
- Produtos no lote: **200**
- URLs únicas verificadas: **526**

## Resultado da verificação

| Verificação | Produtos afetados | Detalhe |
|-------------|-------------------|---------|
| URL inacessível (HTTP HEAD/GET) | **0** | Todas as 526 URLs responderam OK no CDN |
| Host bloqueado pelo `next/image` | **200** | Domínio `dcdn-us.mitiendanube.com` não estava em `next.config.ts` |

## Diagnóstico

As imagens **existem e respondem no CDN** (`dcdn-us.mitiendanube.com`). O problema observado na loja/admin é muito provavelmente de **renderização**, não de URL morta:

1. O componente `ProductImage` usa `next/image` para URLs `https://`.
2. O `next.config.ts` só libera `images.unsplash.com`, `cdn.shopify.com/s/files/**` e Supabase Storage.
3. **Nenhum** domínio Tienda Nube / Nuvemshop está na allowlist.
4. Resultado: o `<Image>` falha no browser → Central de Mídia marca como **“Quebrada”** via `onError`, mesmo com URL válida.

### Padrão em comum

- **100%** das imagens do lote vêm do mesmo host: `dcdn-us.mitiendanube.com`
- Loja de origem: Nuvemshop / Tienda Nube (`stores/002/840/252/products/...`)
- Nomes de arquivo seguem 3 padrões:
  - `photoroom_*.webp` — maioria
  - `img_*.webp`
  - `{uuid}-*.webp`

## Sobre o número “58”

Na varredura completa do lote (200 produtos, 526 URLs), **não encontramos 58 URLs HTTP quebradas**. Possíveis explicações para a diferença:

- Contagem feita em **uma página** da Central de Mídia (o contador `broken` no admin reflete só a página atual, não o lote inteiro).
- Contagem parcial antes de todas as thumbs terminarem de carregar.
- Mistura com outro lote/importação na contagem manual.

Do ponto de vista técnico, o lote inteiro de camisas tende a aparecer quebrado na vitrine/admin até o domínio ser liberado no `next/image` **ou** as imagens serem migradas para Supabase Storage.

## Produtos afetados

Todos os 200 produtos do batch `fdb26aef-3efd-46fd-b6f1-b30747b4c364` usam `dcdn-us.mitiendanube.com`.

## Correção aplicada

Em `next.config.ts` → `images.remotePatterns`:

- host: `dcdn-us.mitiendanube.com`
- pathname: `/stores/**` (mesmo padrão restrito do Shopify)

Reiniciar o Next / redeploy para valer. Médio prazo: migrar para Supabase Storage.
