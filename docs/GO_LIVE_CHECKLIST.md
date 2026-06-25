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

- Cores customizadas (theme engine)
- Histórico CSV
- Supabase (Fase 7)
- Bloquear import por falha HEAD
