# Graphify — mapa estrutural do ecommerce-sports

Ferramenta de **desenvolvimento** ([Graphify](https://github.com/safishamsi/graphify)) para navegar o projeto sem reler arquivos inteiros. Não é dependência runtime do e-commerce.

## Artefatos gerados

| Arquivo | Descrição |
|---------|-----------|
| [graphify-out/GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md) | Relatório oficial: god nodes, comunidades, conexões |
| [graphify-out/graph.html](graphify-out/graph.html) | Visualização interativa (abrir no browser) |
| [graphify-out/graph.json](graphify-out/graph.json) | Grafo completo para consultas CLI |
| [.cursor/rules/graphify.mdc](.cursor/rules/graphify.mdc) | Regra Cursor (`alwaysApply`) para consultar o grafo antes de explorar código |

**Última geração:** 2026-06-27 (pós arquitetura multi-cliente + branding por slug) · **1614 nós · 4146 arestas · 83 comunidades** · extração AST (sem API)

God nodes: `getButtonClassName`, `requireAdmin`, `getDataProvider`, `getStoreSettings`, `Product`, `Category`.

Hubs recentes (catálogo/admin): `ProductGallery`, `stripHtml`, `local-image-migration`, `isMigrationToolsEnabled`, `apply_product_import_batch`.

## Arquitetura multi-cliente (deploy)

```text
Core (main) — app/, lib/, supabase/migrations/
  ↓
deploy/
  ├── branding/              # legacy: bancada operador (scripts atuais)
  ├── clients/
  │   ├── template/            # nova loja (sem branding/)
  │   └── unitsports/          # implantação referência
  │       ├── branding/logo.jpeg
  │       ├── env.example, notes.md, go-live-checklist.md
  ├── registry/                # índice de slugs
  └── netlify/                 # preset demo
```

Docs: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/MULTI_CLIENT_DEPLOYMENT.md`](docs/MULTI_CLIENT_DEPLOYMENT.md) · [`deploy/clients/unitsports/`](deploy/clients/unitsports/)

## Árvore do projeto (rotas e módulos)

```
ecommerce-sports/
├── app/
│   ├── page.tsx, layout.tsx
│   ├── products/                 # /products, /products/[slug]
│   ├── cart/, checkout/
│   ├── order-intent/demo/        # protótipo PurchaseIntent
│   ├── api/products/route.ts     # cache catálogo (carrinho)
│   └── admin/
│       ├── page.tsx
│       ├── products/             # lista, new, [id]/edit, media/
│       ├── categories/
│       ├── import/               # ENABLE_MIGRATION_TOOLS
│       ├── orders/, settings/, login/
│       ├── banners/, content/benefits/
├── components/
│   ├── admin/    product-form, image-gallery-field, media/*, import/*
│   ├── product/  product-gallery.tsx
│   ├── cart/, layout/, commerce/, ui/
├── lib/
│   ├── catalog/                  # import/, media/local-image-migration/, category-utils
│   ├── store/                    # generate-branding, branding-logo-source
│   ├── env/migration-tools.ts
│   ├── supabase/
│   ├── cart-utils.ts, cart-storage.ts
│   ├── admin/demo-session.ts
│   └── formatters.ts, colors.ts
├── deploy/
│   ├── branding/                 # legacy operador (logo.jpeg)
│   ├── clients/template|unitsports/
│   └── registry/
├── scripts/
│   ├── deploy/                   # sync-branding-logo, prepare-netlify-build
│   ├── migration/                # migrate:images:*
│   └── operator/                 # convenção futura
├── storage/
│   ├── catalog.seed.json
│   └── catalog.json              # gitignored (runtime dev)
├── data/mock-products.ts         # seed legado
├── context/cart-context.tsx
└── types/product.ts
```

### Hubs principais (god nodes — ver GRAPH_REPORT)

1. `getButtonClassName()` / `Button` — UI base
2. `requireAdmin()` — proteção rotas admin
3. `getDataProvider()` / `getStoreSettings()` — persistência e config
4. `Product` / `Category` — domínio catálogo
5. `getProductRepository()` — JSON local / demo
6. `resolveCartLines()` / `useCart()` — carrinho

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
