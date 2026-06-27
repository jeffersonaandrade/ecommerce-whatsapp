# Banner Carousel — Performance QA

**Atualizado:** 2026-06-27  
**Escopo:** `BannerCarousel`, `HomeHero`, preload policy, visibility por dispositivo.

## Métricas alvo

| Métrica | Antes (baseline estimado) | Depois (meta) | Como medir |
|---------|---------------------------|---------------|------------|
| Tempo até 1º banner visível | ~1,8s (proxy API + mount-on-activate) | < 1,0s perceptível | DevTools Network: first `banners/*-desktop.webp`; Lighthouse LCP |
| Flash na troca de slide | Flash cinza visível | 0 flashes | Observação headed ou gravação de tela durante autoplay 5s |
| Preload banda (12 slides) | N/A (sem preload) | ≤ 1 request extra (policy >5) | Network tab: apenas `(current+1)` preload |

## Causa raiz corrigida

- **Antes:** `mount-on-activate` + crossfade 700ms sem gate de `onLoad`
- **Depois:** DOM persistente, `displayed` aguarda `onLoad`, preload adjacente com policy (`≤5` vizinhos, `>5` só próximo)

## Visibility por dispositivo

| visibility | Desktop | Mobile |
|------------|---------|--------|
| `all` | Sim | Sim (mobile img ou fallback desktop) |
| `desktop` | Sim | Não → SportsHero se único tipo |
| `mobile` | Não | Sim |

## Checklist manual

- [ ] 1º slide aparece sem flash de fundo cinza
- [ ] Autoplay pausa em hover / touch / foco nos controles
- [ ] `prefers-reduced-motion`: sem autoplay, transição instantânea
- [ ] Slide desktop-only oculto no mobile (≤768px)
- [ ] Slide mobile-only oculto no desktop
- [ ] Sem slides para viewport → SportsHero

## Migration

Aplicar `20260627153700_banner_slide_visibility.sql` via MCP Supabase (coluna `visibility` + `desktop_image_path` nullable).
