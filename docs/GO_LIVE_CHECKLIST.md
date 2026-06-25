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
- [ ] `/admin/login` — toast ao clicar Entrar (sem auth real)
- [ ] Fluxo comercial CSV → WhatsApp `#TEMP-...`
- [ ] `npm run test` + `npm run build` verdes
