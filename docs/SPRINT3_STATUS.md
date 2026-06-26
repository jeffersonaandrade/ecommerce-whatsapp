# Sprint 3 — Status de Validação

**Data:** 2026-06-26  
**Sprint:** Mídia e Storefront Visual (Parte B: imagem de categoria · Parte C: banner carrossel)

---

## 1. TypeScript

| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ Limpo (0 erros) |
| Fix aplicado | `restore-default-storefront.test.ts:22` — `as const` em `headerBrandDisplay: 'logo_only'` (bug preexistente, introduzido em commit `2cd7061`) |

---

## 2. Testes

| Check | Status |
|-------|--------|
| `npx vitest run` | ✅ 31 test files · 138 tests passed |
| Fixture corrigido | `supabase-category-mapper.test.ts` — campo `image_path: null` adicionado ao fixture de `CategoryRow` |

---

## 3. Migration SQL

### Arquivo

**`scripts/migration/supabase-migrations.sql`** — bloco adicionado no final:

```
-- 20260626200000_sprint3_media_storefront
```

### Conteúdo verificado no arquivo

| Item | No arquivo? |
|------|------------|
| `ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_path text` | ✅ |
| `CREATE TABLE IF NOT EXISTS banner_slides` | ✅ |
| Constraint `banner_slides_cta_both_or_none` | ✅ |
| Índice `banner_slides_sort_idx` | ✅ |
| Índice `banner_slides_active_idx` (partial, WHERE active = true) | ✅ |
| Trigger `banner_slides_set_updated_at` (usa `set_updated_at()` existente) | ✅ |
| `ALTER TABLE banner_slides ENABLE ROW LEVEL SECURITY` | ✅ |
| Policy `banner_slides_public_read` (SELECT para anon/authenticated onde active=true) | ✅ |
| Policy `banner_slides_admin_select` (SELECT completo para admin) | ✅ |
| Policy `banner_slides_admin_insert` | ✅ |
| Policy `banner_slides_admin_update` | ✅ |
| Policy `banner_slides_admin_delete` | ✅ |
| GRANT SELECT para anon/authenticated | ✅ |
| GRANT INSERT/UPDATE/DELETE para authenticated | ✅ |

### Status de aplicação no Supabase

✅ **APLICADO** — via MCP Supabase (`apply_migration`) em 2026-06-26.

| Version MCP | Nome | Arquivo incremental |
|-------------|------|---------------------|
| `20260626190619` | `sprint3_media_storefront` | [`supabase/migrations/20260626200000_sprint3_media_storefront.sql`](../supabase/migrations/20260626200000_sprint3_media_storefront.sql) |
| `20260626190630` | `sprint4a_benefit_items` | [`supabase/migrations/20260626210000_sprint4a_benefit_items.sql`](../supabase/migrations/20260626210000_sprint4a_benefit_items.sql) |

Agregado canônico: [`scripts/migration/supabase-migrations.sql`](../scripts/migration/supabase-migrations.sql) (blocos `20260626200000` e `20260626210000`).

**Validação pós-migration (executada via MCP `execute_sql`):**

| Check | Resultado |
|-------|-----------|
| `categories.image_path` | ✅ presente |
| Tabela `banner_slides` | ✅ existe (0 slides) |
| Policies `banner_slides` | ✅ 5 policies (public_read + admin CRUD) |
| Trigger `banner_slides_set_updated_at` | ✅ presente |
| `store_settings.benefits_eyebrow/title` | ✅ presente (Sprint 4A) |
| Tabela `benefit_items` + seed | ✅ 3 rows (`benefit-default-1..3`) |
| Policies `benefit_items` | ✅ 5 policies |

```sql
-- Revalidar a qualquer momento
SELECT column_name FROM information_schema.columns
  WHERE table_name = 'categories' AND column_name = 'image_path';

SELECT COUNT(*) FROM public.banner_slides;

SELECT policyname FROM pg_policies WHERE tablename = 'banner_slides';

SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_table = 'banner_slides';
```

---

## 4. Código entregue

### Parte B — Imagem de categoria

| Arquivo | Status |
|---------|--------|
| `types/category.ts` — `imagePath?: string \| null` | ✅ |
| `lib/catalog/supabase-category-mapper.ts` — `image_path` no row | ✅ |
| `lib/catalog/json-category-repository.ts` — `buildCategory` e `update` | ✅ |
| `lib/catalog/category-image-storage.ts` (novo) | ✅ |
| `lib/catalog/category-actions.ts` — `uploadCategoryImageAction`, `removeCategoryImageAction` | ✅ |
| `components/admin/category-form.tsx` — seção de upload + remoção | ✅ |
| `components/commerce/home-categories.tsx` — cards visuais com fallback | ✅ |

### Parte C — Banner carrossel

| Arquivo | Status |
|---------|--------|
| `types/banner-slide.ts` (novo) | ✅ |
| `lib/banners/banner-repository.ts` (novo, interface) | ✅ |
| `lib/banners/json-banner-repository.ts` (novo) | ✅ |
| `lib/banners/supabase-banner-mapper.ts` (novo) | ✅ |
| `lib/banners/supabase-banner-repository.ts` (novo) | ✅ |
| `lib/banners/banner-storage.ts` (novo) | ✅ |
| `lib/banners/banner-actions.ts` (novo) | ✅ |
| `lib/banners/get-banner-repository.ts` (novo) | ✅ |
| `lib/banners/index.ts` (novo) | ✅ |
| `components/commerce/banner-carousel.tsx` (novo) | ✅ |
| `components/admin/banner-slide-form.tsx` (novo) | ✅ |
| `components/admin/reorder-banner-buttons.tsx` (novo) | ✅ |
| `components/admin/toggle-banner-active-button.tsx` (novo) | ✅ |
| `app/admin/banners/page.tsx` (novo) | ✅ |
| `app/admin/banners/new/page.tsx` (novo) | ✅ |
| `app/admin/banners/[id]/page.tsx` (novo) | ✅ |
| `app/page.tsx` — `BannerCarousel` quando slides ativos, senão `SportsHero` | ✅ |
| `app/admin/page.tsx` — card "Banners" no dashboard | ✅ |

---

## 5. O que ainda falta para Sprint 3 estar 100% fechada

| Item | Responsável | Bloqueante? |
|------|------------|------------|
| ~~Aplicar migration no Supabase remoto~~ | ~~Operador~~ | ✅ Concluído (MCP) |
| ~~Testar no browser (ver `BROWSER_TESTING_CHECKLIST.md`)~~ | QA / dev | ✅ Parcial — local `localhost:3003` 2026-06-26 (uploads de arquivo ⏭️ MCP) |
| `storage/banner-slides.json` criado com `[]` | Auto (json-banner-repository cria ao primeiro write) | Não — cria automaticamente na primeira gravação |

---

## 6. Dívidas técnicas registradas

| ID | Arquivo | Descrição | Severidade |
|----|---------|-----------|-----------|
| DT-001 | `lib/store/restore-default-storefront.test.ts:22` | `headerBrandDisplay: 'logo_only'` precisava de `as const` — TypeScript não inferia literal. Corrigido nesta sessão. | Resolvido |
| DT-002 | `app/page.tsx` | Home é rota `○` (estática). `revalidatePath('/')` invalida o cache Next.js mas o HTML estático só é regenerado no próximo request ISR ou rebuild. Mudanças de slides ativos podem demorar até o próximo acesso. | Baixa — documentado em `GO_LIVE_CHECKLIST.md` §Cache |
| DT-003 | `lib/banners/banner-actions.ts` + `banner-slide-form.tsx` | Criação exige imagem desktop via `createBannerSlideWithDesktopAction`; botão "Criar slide" desabilitado sem arquivo; redirect para `/admin/banners/[id]`; vitrine filtra slides sem path. | Resolvido |
