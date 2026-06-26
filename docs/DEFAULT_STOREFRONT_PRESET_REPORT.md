# Default Storefront Preset — Investigação

**Data:** 2026-06-26  
**Objetivo:** Definir preset versionado para "Restaurar aparência padrão" sem reset de catálogo.

---

## Commit recomendado

| Papel | Commit | Motivo |
|-------|--------|--------|
| **UI aprovada (referência visual)** | `759e9e6` | Sign-off em [`docs/archive/VISUAL_QA_POST_LANDING.md`](../archive/VISUAL_QA_POST_LANDING.md) pós UI-7..UI-12 |
| **Código UI premium** | `12d59c3` | UI-12 ProductCard editorial — último commit de polish visual antes do admin StoreSettings |
| **Preset de dados** | `80df18b` | Seed completo: cores, hero copy, institucional em `storage/store-settings.seed.json` |
| **Assets empacotados** | `98bb454` | [`deploy/netlify/branding/hero.webp`](deploy/netlify/branding/hero.webp) para hero offline |

**Preset versionado no repo:** [`deploy/netlify/default-storefront-preset.json`](../deploy/netlify/default-storefront-preset.json)

---

## Timeline UI vs StoreSettings

```
8ec154d  UI-7 Footer
e9ccc49  UI-8 Tipografia Inter + Barlow Condensed
2460433  UI-9 Landing Hero premium
9342240  UI-11 Home editorial
12d59c3  UI-12 ProductCard editorial  ← último polish visual
759e9e6  Visual QA sign-off
fb5d523  StoreSettings admin + branding  ← admin passa a alterar identidade
80df18b  Cores configuráveis + seed
39c5aa8  Hero upload + textos no admin
98bb454  deploy/netlify/ + hero.webp
```

Em `12d59c3`, hero usava Unsplash hardcoded e nome "Sports Store" no componente. A partir de `fb5d523`, identidade migrou para StoreSettings editável pelo admin.

---

## Valores do preset (visual only)

| Campo | Valor |
|-------|--------|
| `description` | Sua loja esportiva de confiança |
| `primaryColor` | `#111111` |
| `secondaryColor` | `#f5f5f5` |
| `heroHeadline` | Vista o jogo |
| `heroHeadlineLine2` | Com autenticidade |
| `heroSubheadline` | Equipamento esportivo premium... |
| `heroCtaLabel` / `heroCtaHref` | Explorar produtos / `/products` |
| `heroImagePath` | `hero.webp` (asset em deploy/netlify) |
| `aboutText`, `businessHours`, `exchangePolicyText` | seed `80df18b` |

Logo/favicon/OG: gerados via [`generateBrandingFromLogo()`](../lib/store/generate-branding.ts) a partir de [`deploy/branding/logo.*`](../deploy/branding/) (nome genérico fixo). Fallback: hero do preset.

---

## Campos preservados na restauração

Decisão aprovada pelo operador:

- `storeName`
- `whatsappPhone`
- `siteUrl`
- `email`
- `phone`
- `instagram`
- `facebook`
- `whatsappMessagePrefix`

**Não restaurar / não alterar:** produtos, catálogo, pedidos, CSV.

---

## Comparação produção vs preset

| Item | Produção (pré-restore) | Preset |
|------|------------------------|--------|
| Nome | QA-Loja Browser Teste | **preservado** |
| Descrição | texto teste persist | Sua loja esportiva de confiança |
| Cores | QA-E2E vermelho | `#111111` / `#f5f5f5` |
| Hero copy | QA-E2E | seed premium |
| Produtos | 7+ seed | **intactos** |

---

## Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Perder identidade operacional | Preservar storeName + contatos |
| Apagar catálogo | Action não toca `products` |
| Home stale pós-restore | `revalidatePath` + doc GO_LIVE cache |
| Confirmação acidental | Digitar `RESTAURAR` |
| Storage órfãos Supabase | Upsert preset files no bucket `branding` |

---

## Arquivos da implementação

- [`lib/store/default-storefront-preset.ts`](../lib/store/default-storefront-preset.ts)
- [`lib/store/restore-default-storefront.ts`](../lib/store/restore-default-storefront.ts)
- [`lib/store/actions.ts`](../lib/store/actions.ts) — `restoreDefaultStorefrontAction`
- [`components/admin/settings/store-settings-form.tsx`](../components/admin/settings/store-settings-form.tsx)
