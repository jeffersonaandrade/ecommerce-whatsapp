# Roadmap por Módulos — Sports Store

Ordem orientada ao **uso real do lojista**: cadastrar → importar → vender. Não por infraestrutura antecipada.

Referências: [`ARCHITECTURE.md`](ARCHITECTURE.md), [`DOMAIN_MODEL.md`](DOMAIN_MODEL.md).

---

## Fases consolidadas

| Fase | Nome | Status | Foco |
|------|------|--------|------|
| 1 | Foundation | ✅ Concluída | Next.js, tipos, UI base, mocks |
| 2 | Cart | ✅ Concluída | Context + localStorage, PDP, testes |
| 3 | Domínio enxuto | ✅ Esta fase | DOMAIN_MODEL, ARCHITECTURE, skeleton admin |
| **4** | **Catálogo Admin** | ✅ Concluída | CRUD, galeria, variações, categorias |
| **5** | **Import Pipeline (Catálogo)** | 📅 **Próxima** | CSV-1…5 — ver [`IMPORT_PIPELINE.md`](IMPORT_PIPELINE.md) |
| 6 | WhatsApp | 📅 Planejada | Mensagem estruturada, links PDP, config loja |
| 7 | Supabase | 📅 Planejada | Persistência + `DATABASE_PLAN` |
| 8 | Pedidos | 📅 V2 | Gestão real (após checkout ou registro manual) |
| 9 | Checkout Online | 📅 V2 | Gateway, pagamento, entrega no site |

**Critério de valor (~1 semana):** criar produto manual · importar ~80 via CSV · receber solicitações organizadas no WhatsApp.

---

## Fase 4 — Catálogo Admin ✅

### Objetivo

Permitir operação diária do catálogo sem depender só de mocks ou CSV.

### Entregáveis

```text
Catálogo
├── Lista                    ✅
├── Criar Produto            ✅
├── Editar Produto           ✅
├── Galeria (1–5, principal) ✅ UPLOAD preview local
├── Variações + SKU + estoque✅
├── Importar CSV             → link Fase 5 (CSV-1…5)
└── Ativar / Inativar        ✅ draft | active
```

### Dependências

- Fase 3 (domínio documentado)
- `lib/products.ts` estendido para escrita temporária

### Critérios de pronto

- Admin cria produto com 2+ variações e imagens
- Produto aparece na vitrine quando `active`
- Rascunho não aparece na loja

### Riscos

- Persistência mock divergir do schema futuro — mitigar com DOMAIN_MODEL
- Upload sem storage — preview local até Fase 7

### Fora de escopo

- Parser CSV (Fase 5)
- Supabase (Fase 7)

---

## Fase 5 — Import Pipeline (Catálogo)

### Objetivo

Importar dezenas/centenas de produtos em **< 15 minutos** — dor #1 do lojista.

**Arquitetura:** [`IMPORT_PIPELINE.md`](IMPORT_PIPELINE.md)  
**Formato CSV:** [`CSV_IMPORT_SPEC.md`](CSV_IMPORT_SPEC.md)

### Sprints

| Sprint | Entrega |
|--------|---------|
| CSV-1 | Tela upload + wizard (template, selecionar, próximo) |
| CSV-2 | Parser + validação (sem persistir) |
| CSV-3 | Preview (totais, tabela, erros) |
| CSV-4 | Importação → `ProductRepository` + rollback |
| CSV-5 | Relatório + histórico `/admin/import/history` |

### Dependências

- Fase 4 ✅ (`ProductRepository`, `storage/catalog.json`)
- Spec CSV V1 ✅

### Critérios de pronto

- Template exemplo importa sem erros bloqueantes
- Preview obrigatório antes de gravar
- Produtos WhatsApp-ready (slug, SKU, preço, variações, imagens URL)
- Histórico consultável

### Fora de escopo Fase 5

- Download de imagens para storage (V2+)
- Exportação CSV (pós CSV-5, sprint separada)
- Supabase (Fase 7)

---

## Fase 6 — Finalização via WhatsApp

### Objetivo

Transformar carrinho em solicitação estruturada no WhatsApp.

### Entregáveis

- `WhatsappStrategy` em `lib/order-completion/`
- Botão **Finalizar Pedido** ativo no carrinho
- Mensagem com SKU, links PDP, total
- Config: telefone e mensagem padrão (`config/site.ts` → settings)
- Opcional: evoluir `/order-intent/demo`

### Dependências

- Fase 2 (carrinho)
- Catálogo com slugs válidos (Fase 4)

### Critérios de pronto

- Cliente abre WhatsApp com mensagem completa
- Sem Order no banco; sem formulário de pagamento

### Fora de escopo

- Gateway, PIX, pedidos persistidos

---

## Fase 7 — Persistência (Supabase)

### Objetivo

Substituir mock por banco real.

### Entregáveis

- `DATABASE_PLAN.md` + migrations
- Repositórios em `lib/products.ts` e módulos adjacentes
- `StoreSettings` persistido
- Storage para imagens `UPLOAD`

### Dependências

- Catálogo e import já validados em mock (Fases 4–5)

### Fora de escopo

- Checkout online (Fase 9)

---

## Fase 8 — Pedidos

### Objetivo

Registrar e gerenciar pedidos (quando fizer sentido comercial).

### Dependências

- Fase 7 ou registro manual pós-WhatsApp (decisão futura)

---

## Fase 9 — Checkout Online

### Objetivo

`CheckoutStrategy` + gateway + frete no site.

### Dependências

- Entidade `Order` no domínio e banco
- `StoreSettings.completionMode` = `CHECKOUT` ou `BOTH`

---

## Módulos transversais

### Admin

Evolui nas Fases 4 (catálogo), 6 (settings WhatsApp), 7 (persistência).

### Order Completion

| Versão | Escopo |
|--------|--------|
| V1 | WhatsApp + demo mock |
| V1.5 | `/order-intent/[id]` persistido |
| V2 | Order + Checkout |

### O que não entra no roadmap

Marketplace, multi-tenant, cashback, afiliados, ERP, app mobile, IA, programa de pontos.

---

## Como o lojista usa o sistema (ordem real)

```text
1. Cadastrar produto manualmente     → Fase 4
2. Importar lote via CSV             → Fase 5
3. Cliente compra pelo site          → Carrinho (feito)
4. Finalizar via WhatsApp            → Fase 6
5. Loja negocia pagamento/entrega    → Fora da plataforma (V1)
```

---

## Produção (pós-Fase 9)

Deploy, SEO, monitoramento, auth admin robusta — conforme necessidade do cliente.
