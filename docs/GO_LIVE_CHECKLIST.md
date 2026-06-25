# Go Live Checklist

Checklist executável para colocar a loja em operação com cliente real — **sem alterar código por deploy**.

**Plano:** 3 sprints · Sprint 1–2 = go-live mínimo · Sprint 3 = SEO

---

## Sprint 1 — Identidade (obrigatório)

- [ ] `StoreSettings` em `storage/store-settings.json`
- [ ] Admin `/admin/settings` — WhatsApp, URL, nome, contato
- [ ] Upload logo → favicon + OG gerados (sharp)
- [ ] Preview aparência no admin
- [ ] Header/footer consomem settings
- [ ] Carrinho usa telefone/URL do admin

## Sprint 2 — Hardening (obrigatório)

- [ ] `ProductImage` com fallback (URLs externas CSV)
- [ ] CSV preview — HEAD warnings (`CSV_W008`, nunca bloqueia)
- [ ] WhatsApp com `Pedido #TEMP-YYYYMMDD-NNNN`
- [ ] Importação exibe tempo (`durationMs`)

## Sprint 3 — SEO (antes de marketing)

- [ ] `generateMetadata` layout (title, OG, icons)
- [ ] PDP — canonical, og:image, robots
- [ ] PLP + Home — canonical + OG

## Checkpoint Go Live

Após Sprint 1 + 2:

- [ ] Novo cliente configura identidade + WhatsApp no admin
- [ ] Vitrine não quebra com imagens externas
- [ ] Pedido rastreável via `#TEMP-...`
- [ ] `npm run test` + `npm run build` verdes

## Fora de escopo V1

- Theme engine completo / page builder
- Histórico CSV
- Supabase (Fase 7)
- Bloquear import por falha HEAD

---

## Demo Polish (v1.0.0-demo)

Checklist pré-demo ao cliente:

- [ ] Admin `/admin/settings` — cores primária/secundária
- [ ] Conteúdo da Loja — hero (textos + banner), institucional
- [ ] Páginas `/sobre`, `/contato`, `/politica-de-trocas` refletem settings
- [ ] Telas de erro 404, 500, `/maintenance` (503)
- [ ] `/admin/login` — fluxo demonstrativo (credenciais demo, redirect para `/admin`)
- [ ] Header público: **Entrar** (deslogado) → `/admin/login`; **Admin** + **Sair** com flag demo
- [ ] Fluxo comercial CSV → WhatsApp `#TEMP-...`
- [ ] `npm run test` + `npm run build` verdes

## Login Admin — demonstração (V1)

- Login do Admin é **demonstrativo**; **não há autenticação real**.
- Credenciais de demo: `admin@demo.com` / `demo123`.
- Header público mostra **Entrar** (deslogado) para iniciar o fluxo demo.
- Com flag `demo-admin-session`, header mostra **Admin** + **Sair** (estado visual apenas).
- `localStorage` (`demo-admin-session`) = **estado visual de demonstração, sem proteção de rotas**.
- Rotas `/admin/*` **não estão protegidas** nesta V1 — `/admin` permanece acessível diretamente.
- “Sair” no dashboard ou header limpa a flag visual; dashboard redireciona para `/admin/login`.
- Banner/branding via Admin na demo estática exige **rebuild/deploy** para refletir na Home pública.
- Supabase / auth real → versão futura.

## Deploy Netlify (demo cliente)

**Primeiro deploy:** [Netlify Dashboard](https://app.netlify.com) → Add new site → Import from Git → selecionar repositório.

| Setting | Valor |
|---------|-------|
| Build command | `npm run build:netlify` (via [`netlify.toml`](../netlify.toml)) |
| Node | 20 |
| Variáveis obrigatórias | Nenhuma para demo básica (`URL` injetada automaticamente no `siteUrl`) |

**Fluxo para o cliente:** abrir o site → **Entrar** no header → credenciais demo → explorar `/admin`.

**Limitações na Netlify (V1):**

- Admin (settings, upload logo/hero, import CSV) **não persiste** entre requests ou redeploys (filesystem efêmero em serverless).
- Vitrine, carrinho, WhatsApp e login demo funcionam.
- Banner/hero na Home reflete assets do **prebuild** ([`deploy/netlify/`](../deploy/netlify/)), não upload pós-deploy.

**CLI alternativa:** `netlify login` → `netlify init` → `netlify deploy --build --prod`

**Push:** manual após commit local — Netlify não recebe deploy sem push ao remoto.

## Limitação conhecida V1 — cache estático da Home

Páginas pré-renderizadas no build (ex.: `/`) podem **não refletir imediatamente** mudanças de identidade feitas no admin (favicon `?v=`, cores CSS no `<html>`, metadata do layout) até **novo deploy** ou hard refresh agressivo.

| O que funciona sem redeploy | O que pode ficar stale na Home |
|-----------------------------|--------------------------------|
| Carrinho, WhatsApp, settings persistidos | Favicon/metadata do root layout |
| `/api/branding/*` com cache-bust `?v=` | Cores CSS injetadas no `<html>` |
| Admin preview de logo/OG | Hero/textos se a Home foi static no build |

**Mitigação V1:** após alterar logo/cores/banner, validar no admin preview; a Home pública exige **`npm run build` + restart** (`next start`) para refletir mudanças. `revalidatePath` sozinho **não** regenera HTML estático da `/` (rota `○` no build).

**Promessa honesta V1:** upload no admin persiste em `storage/` e a API `/api/branding/*` responde na hora; a vitrine da Home só mostra o banner novo após rebuild/restart.

**V2:** ISR com `revalidateTag` ou `dynamic` por rota (fora do root layout).

---

## Validação layout — 2026-06-25

**Ambiente:** `npm run start -p 3003` (produção local). **Não usar porta 3000** se 3003 já estiver em uso.

### Diagnóstico do “site quebrou”

| Causa | Sintoma | Status |
|-------|---------|--------|
| Cache Turbopack corrompido (`npm run dev`) | HTML sem Tailwind | Workaround: usar `npm run build` + `next start -p 3003` |
| `logoPath` / `heroImagePath` no JSON sem arquivo em `storage/branding/` | Quadrado verde/ícone quebrado no header; hero sem imagem | Corrigido: fallback para Unsplash (hero) e inicial do nome (logo) |
| Apagar `.next` com servidor rodando | Servidor cai; página pode ficar inconsistente | Evitar — parar servidor antes de limpar cache |

### Resultados automatizados

- `npm run test`: **45 passed**
- `npm run build`: **OK**
- Rotas HTTP (3003): `/`, `/products`, PDP, `/cart`, institucional, admin, `/maintenance` → **200**; 404 em rota inexistente → **404**
- Branding API: `favicon-32.png`, `og-default.png` (alias jpg) → **200**, `Cache-Control: max-age=60`

### CSS / DS (browser)

- `body` background `rgb(255,255,255)`, fonte **Inter** — **PASS**
- Classes Tailwind no HTML (`bg-canvas`, `font-sans`, `font-display`) — **PASS**
- Hero, categorias, vitrine, footer renderizados — **PASS**

### Ação pós-validação

1. Reiniciar servidor na **3003** após `npm run build` para aplicar fallback de logo/hero.
2. Re-enviar logo no admin se `storage/branding/` estiver vazio.
3. Para dev: `Remove-Item -Recurse -Force .next` **somente com servidor parado**, depois `npm run dev`.

---

## Investigação hero pós-build — 2026-06-25

**Protocolo executado:** upload real em `/admin/settings` (Banner do hero) → validar `storage/store-settings.json` + `storage/branding/hero.webp` → parar servidor → `Remove-Item -Recurse -Force .next` → `npm run test` + `npm run build` → `npx next start -p 3003` → inspecionar HTML da Home.

### Causa raiz do relatório “Home não pegou hero”

**Falso positivo de validação.** Buscar `unsplash` no view-source da página inteira mistura o hero com outras seções. A mesma URL do fallback do hero (`photo-1461896836934`) também aparece em **produto** do catálogo (ex.: Camisa São Paulo FC 2024), o que invalida grep amplo.

### Evidência pós-build (`.next/server/app/index.html`)

Hero (primeira `<section class="w-full">`):

```html
<img src="/api/branding/hero.webp?v=2026-06-25T02%3A46%3A06.812Z" alt="Vista o jogo" .../>
```

- `branding/hero.webp` no hero: **sim**
- `DEFAULT_HERO_IMAGE` (`photo-1461896836934`) **no hero**: **não**
- `photo-1461896836934` na página: **sim**, mas em card de produto (`/products/camisa-sao-paulo-2024`), não no hero

### Onde Unsplash ainda aparece (esperado na V1)

| Origem | Arquivo | Observação |
|--------|---------|------------|
| Catálogo de produtos | `storage/catalog.seed.json` | ~12 URLs Unsplash em cards da vitrine |
| Banner editorial | `components/commerce/editorial-banner.tsx` | Imagem hardcoded (`photo-1574629810360`) |
| Fallback do hero | `lib/store/settings-defaults.ts` | Só se `heroImagePath` for null ou arquivo ausente no build |

### Como validar o hero (não confundir com produtos)

1. View-source de `http://localhost:3003/` e isolar o bloco do hero (primeira `<section class="w-full">`).
2. Confirmar `/api/branding/hero.webp?v=...` na tag `<img>` do hero.
3. **Não** usar grep global por `unsplash` na página inteira como critério de falha do banner.

Offline:

```powershell
Select-String -Path .next/server/app/index.html -Pattern 'section class="w-full">.*?<img src="([^"]+)"'
```

### Resultados do protocolo

- Upload admin: `updatedAt` atualizado, `heroImagePath: "hero.webp"`, `GET /api/branding/hero.webp` → **200** `image/webp`
- `npm run test`: **45 passed**
- `npm run build`: **OK** (`/` estática `○`)
- Hero pós-build: **`/api/branding/hero.webp`** — **PASS**

### Fora de escopo nesta investigação

- Link de login no admin/header
- `force-dynamic` / `unstable_noStore` no layout
- Commit de `resolveExistingBrandingPath` — não necessário; arquivo existia no momento do build
