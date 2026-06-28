<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Core multi-cliente

Um **único código** (core) alimenta várias lojas: cada implantação tem seu Supabase e seu deploy Netlify. **UnitSports** é a primeira implantação de referência — não é o nome do produto. Não adicionar `if (storeName === 'UnitSports')` nem lógica por cliente no código. Configuração por loja via `store_settings` e env por deploy. Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/CORE_VERSION.md`](docs/CORE_VERSION.md) e [`docs/MULTI_CLIENT_AUDIT.md`](docs/MULTI_CLIENT_AUDIT.md).

## Supabase (banco de dados)

Alterações de schema e consultas no Postgres remoto devem usar o **MCP Supabase** do projeto (`project-0-ecommerce-sports-supabase`):

| Operação | Ferramenta MCP |
|----------|----------------|
| DDL (colunas, tabelas, constraints) | `apply_migration` |
| SELECT / verificação | `execute_sql` |
| Inspeção | `list_tables`, `list_migrations` |

Não pedir ao usuário copiar SQL no dashboard, salvo bloqueio do MCP. Documentar migrations aplicadas em `docs/DATABASE_PLAN.md` e adicionar o SQL em `scripts/migration/supabase-migrations.sql`.

**Debug onboarding (Fase 2):** `NEXT_PUBLIC_DEBUG_ONBOARDING=true` — logs `[onboarding]` no console durante o tour Driver.js.

## Headroom (economia de tokens)

Este projeto usa [Headroom](https://github.com/headroomlabs-ai/headroom) para comprimir saídas de ferramentas, logs e arquivos grandes antes de chegarem ao LLM (60–95% menos tokens, respostas equivalentes).

### Instalação (uma vez por máquina)

```powershell
pip install "headroom-ai[proxy,mcp]"
```

Python **3.10–3.13** recomendado (3.13 para métricas de custo no dashboard).

### Modo 1 — Proxy (máxima economia, recomendado)

1. Na raiz do repo, inicie o proxy:

   ```powershell
   npm run headroom:cursor
   # ou: .\scripts\dev\start-headroom-cursor.ps1
   ```

2. No **Cursor**: `Settings → Models → OpenAI API Key → Override OpenAI Base URL`

   ```
   http://127.0.0.1:8787/p/ecommerce-sports/v1
   ```

   Para modelos Anthropic, use `http://127.0.0.1:8787/p/ecommerce-sports` (sem `/v1`).

3. Mantenha o terminal aberto enquanto usa o Cursor.

4. Verifique economia: `headroom perf` ou `headroom dashboard` (com proxy rodando).

### Modo 2 — MCP (ferramentas on-demand)

O servidor MCP já está em [`.cursor/mcp.json`](.cursor/mcp.json). Após reiniciar o Cursor, ferramentas disponíveis:

| Ferramenta | Uso |
|------------|-----|
| `headroom_compress` | Comprimir output grande antes de analisar |
| `headroom_retrieve` | Recuperar trecho original por hash (CCR) |
| `headroom_stats` | Estatísticas de compressão da sessão |

O MCP usa o proxy em `http://127.0.0.1:8787` quando ele estiver ativo.

### Orientação para agentes

- Prefira `headroom_compress` em outputs de terminal, diffs enormes ou JSON com centenas de linhas.
- Use `headroom_retrieve` só quando precisar de detalhe que sumiu na versão comprimida.
- Não comprima arquivos pequenos (< ~50 linhas) — overhead não compensa.

### Referências

- Repositório: https://github.com/headroomlabs-ai/headroom
- Docs: https://headroom-docs.vercel.app/docs/quickstart
