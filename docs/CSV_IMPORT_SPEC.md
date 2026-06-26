# Especificação de Importação CSV V1

Compatível com o formato de **exportação/importação Nuvemshop / Tiendanube**.  
Não utilizamos formato CSV proprietário — apenas uma coluna opcional estendida (`image_urls`).

Referência Nuvemshop: [Como preencher a planilha de carga em massa](https://atendimento.nuvemshop.com.br/pt_BR/importar-e-exportar-produtos/como-preencher-os-campos-da-planilha-de-carga-em-massa)

**Status V1:** implementado — upload, parser, preview e importação em `/admin/import`.  
**Arquitetura:** [`IMPORT_PIPELINE.md`](IMPORT_PIPELINE.md) — sprints CSV-1…5.

Template de exemplo: [`public/templates/importacao-produtos-exemplo.csv`](../public/templates/importacao-produtos-exemplo.csv)  
URL pública: `/templates/importacao-produtos-exemplo.csv`  
Tela admin: `/admin/import`

---

## Visão geral

| Aspecto | Regra |
|---------|-------|
| Formato base | CSV Nuvemshop/Tiendanube |
| Encoding | UTF-8 |
| Separador | Vírgula; campos com vírgula entre aspas duplas |
| Agrupamento | **Identificador URL** (slug do produto) |
| Linhas | **Uma linha por variação** |
| Extensão nossa | Coluna opcional `image_urls` |

---

## Cabeçalho do template

```txt
Identificador URL,Nome (Português),Categorias,Preço,Preço promocional,Estoque,SKU,Descrição (Português),Tags,Marca,Peso (kg),Altura (cm),Largura (cm),Comprimento (cm),Nome da variação 1,Valor da variação 1,Nome da variação 2,Valor da variação 2,Nome da variação 3,Valor da variação 3,image_urls
```

---

## Mapeamento de colunas

| Coluna Nuvemshop | Campo interno | Obrigatório | Notas |
|------------------|---------------|-------------|-------|
| Identificador URL | `slug` | Sim | Chave de agrupamento; kebab-case, sem acentos |
| Nome (Português) | `name` | Sim | |
| Categorias | `categoryPath` → `category` | Sim | V1: último segmento após `>` ou valor inteiro |
| Preço | `price` | Sim | Número > 0 |
| Preço promocional | `promotionalPrice` | Não | Se preenchido, deve ser < Preço |
| Estoque | `stock` | Sim | Inteiro ≥ 0 (por variação) |
| SKU | `variationSku` | Sim | Único por linha → `ProductVariation.sku` |
| Descrição (Português) | `longDescription` | Sim | Pode conter HTML |
| *(derivado)* | `shortDescription` | — | Ver regra abaixo |
| Tags | `tags` | Não | Persistência futura |
| Marca | `brand` | Não | Persistência futura; esportes: pode mapear `club` |
| Peso (kg) | shipping weight | Não | Validar no futuro; **ignorar no MVP** |
| Altura (cm) | shipping height | Não | Validar no futuro; **ignorar no MVP** |
| Largura (cm) | shipping width | Não | Validar no futuro; **ignorar no MVP** |
| Comprimento (cm) | shipping length | Não | Validar no futuro; **ignorar no MVP** |
| Nome da variação 1–3 | atributo | Não* | *Obrigatório se houver variação |
| Valor da variação 1–3 | valor | Não* | Par com Nome da variação N |
| **image_urls** | `images[]` | Não | Extensão nossa; ver regras abaixo |

### IDs gerados pelo importador (fase futura)

- `Product.id` — derivado de `Identificador URL`
- `ProductVariation.id` — derivado de `SKU` ou combinação slug + variações

---

## Agrupamento por Identificador URL

Produto com N variações = **N linhas** com o mesmo **Identificador URL**.

Campos de produto repetidos em cada linha devem ser **idênticos**:

- Nome (Português), Categorias, Preço, Preço promocional, Descrição (Português), Tags, Marca, dimensões, `image_urls`

Campos **únicos por linha**:

- Estoque, SKU, Nome/Valor das variações 1–3

Divergência entre linhas do mesmo Identificador URL → erro `CSV_E001`.

---

## Variações (Nome / Valor 1–3)

Até 3 pares `(Nome da variação N, Valor da variação N)` por linha.

| Nome da variação (normalizado) | Campo interno |
|------------------------------|---------------|
| Tamanho, Size | `size` |
| Cor, Color | `color` |
| Outros | Atributo custom (V1: warning; não persiste) |

Exemplo Nuvemshop: Nome = `Tamanho`, Valor = `P`; Nome = `Cor`, Valor = `Amarela`.

---

## Regra de descrição

```txt
Descrição (Português)  →  longDescription   (valor literal do CSV, pode incluir HTML)
shortDescription       →  derivada automaticamente
```

Algoritmo para `shortDescription`:

1. Remover tags HTML (`<p>`, `<br>`, etc.)
2. Decodificar entidades HTML básicas (`&nbsp;`, `&amp;`, …)
3. Normalizar espaços (trim, colapsar múltiplos espaços)
4. Truncar entre **120 e 160 caracteres**, preferindo corte no último espaço antes do limite

Não existe coluna `shortDescription` no CSV.

---

## Coluna `image_urls` (extensão)

Não faz parte do export Nuvemshop padrão. Opcional; mesmo valor em todas as linhas do produto.

| Regra | Detalhe |
|-------|---------|
| Protocolo | Apenas `https://` — **bloquear** `http://` |
| Separador | `\|` (pipe) |
| Quantidade | Mínimo 0, máximo **5** URLs por produto |
| Extensões | `.jpg`, `.jpeg`, `.png`, `.webp` (case-insensitive; query string ignorada) |
| Duplicatas | Remover após normalização |
| Download V1 | **Não baixar** — apenas validar URL e exibir preview |
| Tamanho futuro | Até **5 MB/imagem** quando houver cópia para storage (V2+) |

### Fluxo V1 vs V2

```txt
V1: CSV → validar URL → preview → salvar referência (URL externa)
V2: CSV → validar → fila → download → storage próprio do cliente
```

Riscos de download em lote (fora do V1): URL quebrada, hotlink bloqueado, timeout, abuso, custo de storage.

---

## Dimensões de envio (MVP)

Colunas: Peso (kg), Altura (cm), Largura (cm), Comprimento (cm).

- **V1:** validar formato numérico quando presentes; **não persistir nem usar** no catálogo
- **Futuro:** frete e logística

---

## Catálogo de erros

| Código | Descrição |
|--------|-----------|
| CSV_E001 | Identificador URL repetido com campos de produto conflitantes |
| CSV_E002 | SKU duplicado no arquivo |
| CSV_E003 | URL de imagem inválida (protocolo, extensão ou quantidade > 5) |
| CSV_E004 | Preço promocional ≥ Preço |
| CSV_E005 | Variação sem SKU ou estoque inválido |
| CSV_E006 | Identificador URL vazio |
| CSV_E007 | Dimensões presentes com formato inválido (warning; não bloqueia MVP) |

---

## Exemplo válido

Duas linhas, mesmo produto, variações P e M — ver template em `public/templates/`.

```csv
Identificador URL,Nome (Português),...,Nome da variação 1,Valor da variação 1,...,image_urls
camisa-brasil-2024,Camisa Brasil 2024,...,Tamanho,P,...,https://cdn.exemplo.com/a.jpg|https://cdn.exemplo.com/b.webp
camisa-brasil-2024,Camisa Brasil 2024,...,Tamanho,M,...,https://cdn.exemplo.com/a.jpg|https://cdn.exemplo.com/b.webp
```

---

## Exemplos inválidos

| Problema | Erro |
|----------|------|
| `http://site.com/img.jpg` | CSV_E003 |
| 6 URLs em `image_urls` | CSV_E003 |
| `.gif` em URL | CSV_E003 |
| Preço promocional 200, Preço 189.90 | CSV_E004 |
| Mesmo SKU em duas linhas | CSV_E002 |
| Linha 1: Nome "Camisa A", linha 2: Nome "Camisa B" (mesmo Identificador URL) | CSV_E001 |

---

## Fora de escopo V1

- Upload de arquivo na interface
- Parser CSV em runtime
- Validação e preview de importação
- Persistência em banco (Supabase)
- API de importação
- Download/cópia de imagens para storage
- Alteração do tipo `Product` em TypeScript
- Autenticação admin

## Escopo V2 (futuro)

1. Parser CSV + validação com códigos de erro
2. Preview antes de salvar
3. Persistência (mock → Supabase)
4. Job/fila para copiar imagens externas para storage
5. `remotePatterns` dinâmico ou proxy de imagens no admin

---

## Mapeamento para `Product` / `ProductVariation`

Referência: [`types/product.ts`](../types/product.ts)

| Interno | Origem CSV |
|---------|------------|
| `slug` | Identificador URL |
| `name` | Nome (Português) |
| `category` | Categorias (último segmento) |
| `longDescription` | Descrição (Português) |
| `shortDescription` | derivada |
| `price` | Preço |
| `promotionalPrice` | Preço promocional |
| `images` | `image_urls` split por `\|` |
| `variations[].sku` | SKU |
| `variations[].size` | Valor quando Nome = Tamanho |
| `variations[].color` | Valor quando Nome = Cor |
| `variations[].stock` | Estoque |

Campos `tags`, `brand` e dimensões documentados para extensão futura do modelo.
