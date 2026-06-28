# Notas operacionais — unitsports

---

## Versão do core

| Campo | Valor |
|-------|-------|
| coreVersionInstalled | 1.0.0 |
| lastDeployAt | 2026-06-27 |
| lastMigrationApplied | 20260627210000_store_onboarding |

---

## Supabase / Netlify

| Campo | Valor |
|-------|-------|
| netlifySite | loja-whats |
| domain | https://loja-whats.netlify.app |
| supabaseProjectRef | (registrar em clients.local.json — não versionar) |
| status | production |

---

## Migrations aplicadas (referência)

Registro completo: [`docs/DATABASE_PLAN.md`](../../../docs/DATABASE_PLAN.md) — seção implantação unitsports.

---

## Onboarding / migração

- Import CSV: operacional
- Central de Mídia: 56 produtos Storage OK · 35 ambíguos pendentes (2026-06-26)
- Tour guiado: 8 passos (Fase 3)

---

## Pendências

- Validar 35 associações de imagem ambíguas com cliente
- Desligar `ENABLE_MIGRATION_TOOLS` após go-live estável
- Domínio próprio (quando contratado)

---

## Contato operacional

Registrar observações de suporte aqui (sem dados sensíveis).
