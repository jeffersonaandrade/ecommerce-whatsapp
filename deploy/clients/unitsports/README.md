# Implantação: UnitSports

Primeira implantação de referência do core. **Não confundir** com o produto inteiro — ver [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

---

## Resumo

| Campo | Valor |
|-------|-------|
| slug | `unitsports` |
| Domínio | https://loja-whats.netlify.app |
| Netlify site | `loja-whats` |
| Status | production |
| coreVersionInstalled | 1.0.0 |

---

## Documentação relacionada

- Notas operacionais: [`notes.md`](notes.md)
- Checklist: [`go-live-checklist.md`](go-live-checklist.md)
- Env template: [`env.example`](env.example)
- Release baseline: [`docs/releases/v1.0.0.md`](../../docs/releases/v1.0.0.md)

---

## Observações

- Migração de imagens (jun/2026): 56 OK no Storage · 35 ambíguos pendentes validação
- `ENABLE_MIGRATION_TOOLS`: ligar durante onboarding; desligar após catálogo estável
- Logo/branding: [`deploy/branding/`](../../branding/) + `npm run branding:sync`

---

## Secrets

Nunca commitar keys Supabase ou service role. Usar painel Netlify + `.env.local` local.
