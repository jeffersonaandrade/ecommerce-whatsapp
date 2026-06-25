# Graphify — mapa estrutural do ecommerce-sports

Ferramenta de **desenvolvimento** ([Graphify](https://github.com/safishamsi/graphify)) para navegar o projeto sem reler arquivos inteiros. Não é dependência runtime do e-commerce.

## Artefatos gerados

| Arquivo | Descrição |
|---------|-----------|
| [graphify-out/GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md) | Relatório oficial: god nodes, comunidades, conexões |
| [graphify-out/graph.html](graphify-out/graph.html) | Visualização interativa (abrir no browser) |
| [graphify-out/graph.json](graphify-out/graph.json) | Grafo completo para consultas CLI |
| [.cursor/rules/graphify.mdc](.cursor/rules/graphify.mdc) | Regra Cursor (`alwaysApply`) para consultar o grafo antes de explorar código |

**Última geração:** 2026-06-25 (v1.0.1-demo) · **542 nós · 1250 arestas · 20 comunidades** · extração AST (sem API)

Novos hubs: `lib/admin/demo-session`, `AdminAccessButton`, `/admin/login`, `resolveExistingBrandingPath`.

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
│       ├── products/             # lista, new, [id]/edit
│       ├── categories/
│       ├── import/, orders/, settings/, login/
├── components/
│   ├── admin/    AdminAccessButton, admin-login-form, demo-logout-button, product-form
│   ├── cart/, product/, layout/, commerce/, ui/
├── lib/
│   ├── products.ts               # fachada server-only
│   ├── products-client.ts        # carrinho (browser)
│   ├── catalog/                  # ProductRepository, actions, utils
│   ├── cart-utils.ts, cart-storage.ts
│   ├── admin/demo-session.ts
│   └── formatters.ts, colors.ts
├── storage/
│   ├── catalog.seed.json
│   └── catalog.json              # gitignored (runtime dev)
├── data/mock-products.ts         # seed legado
├── context/cart-context.tsx
└── types/product.ts
```

### Hubs principais (god nodes)

1. `Product` — tipo central do domínio
2. `Button` — UI reutilizada
3. `getAllProducts()` / `getAllProductsAdmin()` — leitura do catálogo
4. `formatPrice()` — formatação
5. `resolveCartLines()` / `useCart()` — carrinho
6. `getProductRepository()` — persistência JSON
7. `mockProducts` — seed de referência

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
