# Graphify — mapa estrutural do ecommerce-sports

Ferramenta de **desenvolvimento** ([Graphify](https://github.com/safishamsi/graphify)) para navegar o projeto sem reler arquivos inteiros. Não é dependência runtime do e-commerce.

## Artefatos gerados

| Arquivo | Descrição |
|---------|-----------|
| [graphify-out/GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md) | Relatório oficial: god nodes, comunidades, conexões |
| [graphify-out/graph.html](graphify-out/graph.html) | Visualização interativa (abrir no browser) |
| [graphify-out/graph.json](graphify-out/graph.json) | Grafo completo para consultas CLI |
| [.cursor/rules/graphify.mdc](.cursor/rules/graphify.mdc) | Regra Cursor (`alwaysApply`) para consultar o grafo antes de explorar código |

**Última geração:** 156 nós · 304 arestas · 10 comunidades · extração 99% AST (sem API).

## Árvore do projeto (rotas e módulos)

```
ecommerce-sports/
├── app/                          # App Router (Next.js 16)
│   ├── page.tsx                  # /
│   ├── layout.tsx
│   ├── products/
│   │   ├── page.tsx              # /products
│   │   └── [slug]/page.tsx       # /products/:slug
│   ├── cart/page.tsx             # /cart
│   ├── checkout/page.tsx         # /checkout
│   └── admin/
│       ├── page.tsx              # /admin
│       ├── import/page.tsx       # /admin/import
│       ├── products/page.tsx
│       └── orders/page.tsx
├── components/
│   ├── layout/     header.tsx, footer.tsx
│   ├── commerce/   sports-hero.tsx
│   ├── product/    product-card.tsx
│   └── ui/         button.tsx, badge.tsx
├── config/site.ts
├── data/mock-products.ts
├── lib/formatters.ts             # formatPrice, calculateDiscount
└── types/product.ts
```

### Hubs principais (god nodes)

1. `Button` — componente UI reutilizado em várias páginas
2. `mockProducts` — fonte de dados mock
3. `formatPrice()` / `calculateDiscount()` — formatação e desconto
4. `ProductCard()` — cartão de produto nas listagens
5. `siteConfig` — configuração global do site

## Comandos

### Regenerar o mapa

```powershell
cd C:\Projetos\ecommerce-sports
graphify .
graphify cluster-only .
```

Após alterar **apenas código** (mais rápido, sem API):

```powershell
graphify update .
graphify cluster-only .
```

### Consultar o grafo

```powershell
graphify query "quais paginas usam ProductCard?"
graphify path "mockProducts" "ProductCard()"
graphify explain "formatPrice"
graphify export callflow-html
```

### Integração Cursor

```powershell
graphify cursor install --project   # já aplicado
```

## Configuração local

- [`.graphifyignore`](.graphifyignore) — exclui `*.md` e `public/**` da extração semântica (evita exigir API key para docs/imagens). Código `.ts`/`.tsx` é extraído localmente via tree-sitter.
- [`.gitignore`](.gitignore) — ignora apenas `graphify-out/cost.json`; o restante de `graphify-out/` pode ser versionado para o time.

## Instalação (Windows)

Instalação realizada com sucesso neste ambiente:

```powershell
winget install astral-sh.uv
uv tool install graphifyy
```

Validar:

```powershell
uv --version
graphify --version
```

**PATH:** o `uv tool install` coloca o CLI em `%USERPROFILE%\.local\bin`. Se `graphify` não for encontrado:

```powershell
$env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
uv tool update-shell   # persiste no perfil do shell
```

### Fallback se a instalação falhar

| Ordem | Comando | Observação |
|-------|---------|------------|
| 1 | `winget install astral-sh.uv` + `uv tool install graphifyy` | Recomendado oficialmente |
| 2 | `pip install pipx` → `pipx ensurepath` → `pipx install graphifyy` | Alternativa isolada |
| 3 | `python -m pip install --user graphifyy` + `python -m graphify .` | Último recurso; PATH em `%APPDATA%\Python\Python313\Scripts` |

Evitar `pip install graphifyy` direto no Windows quando possível — risco de `ModuleNotFoundError` por ambientes Python divergentes.

### Erro: `no LLM API key found`

Ocorre quando há arquivos `.md`/imagens na extração sem API configurada. Neste projeto, `.graphifyignore` limita a extração ao código. Para incluir docs com semântica LLM, defina `GOOGLE_API_KEY` ou `ANTHROPIC_API_KEY` e remova as entradas correspondentes do `.graphifyignore`.

## Opcional

```powershell
graphify hook install   # rebuild automático após commits
```
