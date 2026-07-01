# PROJECT SCOPE - Sports Store E-commerce

**Versão:** 0.2.0 (pós Fase 3)  
**Documentação:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/DOMAIN_MODEL.md`](docs/DOMAIN_MODEL.md) · [`docs/MODULE_ROADMAP.md`](docs/MODULE_ROADMAP.md)

## Posicionamento

Loja esportiva **reutilizável** (core único, N deploys). **Single-client** = **sem multi-tenant no mesmo banco** — não significa “apenas uma loja”. V1 operacional:

- Cadastro manual de produtos + importação CSV
- Vitrine + carrinho
- Finalização via **WhatsApp** (PurchaseIntent — não Order)

## O que está pronto

### Público

- Home, listagem, PDP com variações
- Carrinho funcional (localStorage)
- Botão "Finalizar Pedido" (WhatsApp na Fase 6)

### Admin

- Dashboard reorganizado (Produtos: Lista / Novo / Importar)
- Lista de produtos, import CSV (template), settings (visual)
- Placeholders: novo produto, categorias, pedidos

### Engenharia

- `lib/products.ts` como abstração de catálogo
- Spec CSV: [`docs/CSV_IMPORT_SPEC.md`](docs/CSV_IMPORT_SPEC.md)
- Testes do carrinho

## V1 — o que NÃO coleta no site

Endereço, CEP, CPF, pagamento, frete — negociados no WhatsApp.

## V1 — o que NÃO existe

- Entidade **Order** (pedido persistido)
- Checkout online, gateway, Supabase
- Parser CSV funcional (Fase 5)

## Próximas fases (resumo)

| Fase | Foco |
|------|------|
| 4 | Catálogo Admin funcional |
| 5 | CSV import |
| 6 | WhatsApp |
| 7 | Supabase |
| 8–9 | Pedidos + Checkout |

Ver [`ROADMAP.md`](ROADMAP.md).

## Fora do escopo permanente

Marketplace, multi-tenant, SaaS, cashback, afiliados, ERP, app mobile.

## Princípios

1. Primeiro vender (catálogo + WhatsApp)
2. Mobile-first
3. Sem overengineering
4. Estado da UI sempre claro
5. `lib/products.ts` = fronteira de dados até Supabase

## Customização por cliente

- [`config/site.ts`](config/site.ts) — nome, navegação
- [`data/mock-products.ts`](data/mock-products.ts) — catálogo inicial (até Fase 4/7)

---

*Escopo histórico das fases 1–2 permanece no histórico do repositório; carrinho e foundation estão concluídos.*
