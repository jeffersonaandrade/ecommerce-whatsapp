# CLIENT SETUP CHECKLIST - Sports Store

Checklist para customizar o projeto para um novo cliente esportivo.

> **Go-live por cliente:** use o checklist em [`deploy/clients/template/go-live-checklist.md`](../../deploy/clients/template/go-live-checklist.md) (copie para `deploy/clients/<slug>/` ao onboardar). Este documento resume o fluxo no repositório.

## 📋 Checklist de Configuração

### 1. Informações Básicas
- [ ] Nome da loja
- [ ] Descrição da loja
- [ ] URL do domínio
- [ ] Email de contato
- [ ] Telefone de suporte

### 2. Branding & Design
- [ ] Cores primárias (Tailwind theme)
- [ ] Logo e favicon
- [ ] Fotos de produtos reais
- [ ] Imagens para hero section
- [ ] Fonte customizada (se houver)

### 3. Produtos
- [ ] Listar todos os produtos
- [ ] Informações de cada produto:
  - [ ] Nome
  - [ ] Descrição curta
  - [ ] Descrição longa
  - [ ] Preço
  - [ ] Preço promocional (se houver)
  - [ ] Categoria
  - [ ] Clube/Time (se aplicável)
  - [ ] Imagens (mínimo 2)
  - [ ] Tamanhos disponíveis
  - [ ] Cores disponíveis
  - [ ] SKUs
  - [ ] Estoque por variação

### 4. Categorias
- [ ] Definir categorias de produtos
- [ ] Ordenar por relevância
- [ ] Ícones/emojis para cada

### 5. Configuração Técnica
- [ ] Atualizar \config/site.ts\:
  - [ ] \
ame\
  - [ ] \description\
  - [ ] \
avigation\ (links relevantes)
  - [ ] \categories\ (do cliente)
- [ ] Atualizar \data/mock-products.ts\:
  - [ ] Substituir produtos mockados
  - [ ] Adicionar imagens do cliente
- [ ] Atualizar \	ypes/product.ts\ (se novos campos)

### 6. Páginas & Conteúdo
- [ ] Home page:
  - [ ] Headline principal
  - [ ] Subheadline
  - [ ] CTA primary
  - [ ] CTA secondary
- [ ] Sobre:
  - [ ] História da marca
  - [ ] Missão/Valores
- [ ] Contato:
  - [ ] Email
  - [ ] Telefone
  - [ ] Endereço
  - [ ] Formulário

### 7. Políticas
- [ ] Política de Privacidade
- [ ] Termos de Serviço
- [ ] Política de Devolução
- [ ] Política de Envio
- [ ] FAQ

### 8. Redes Sociais & Marketing
- [ ] Links do Instagram
- [ ] Links do Facebook
- [ ] Links do TikTok (se houver)
- [ ] Email para newsletter
- [ ] Google Analytics ID
- [ ] Facebook Pixel ID

### 9. Integrações Futuras (Roadmap)
- [ ] Decidir sobre pagamento:
  - [ ] Stripe
  - [ ] Mercado Pago
  - [ ] PagSeguro
  - [ ] Outro
- [ ] Decidir sobre BD:
  - [ ] Supabase
  - [ ] PostgreSQL
  - [ ] MongoDB
- [ ] Decidir sobre autenticação:
  - [ ] Clerk
  - [ ] Auth0
  - [ ] NextAuth

### 10. Deploy
- [ ] Vercel account
- [ ] GitHub repository
- [ ] Domain registrado
- [ ] SSL configurado
- [ ] Email configurado

### 11. Testing
- [ ] Testar home page em mobile
- [ ] Testar listagem de produtos
- [ ] Testar detalhe de produto
- [ ] Testar admin dashboard
- [ ] Testar navegação completa
- [ ] Verificar responsividade
- [ ] Verificar performance

### 12. Documentação
- [ ] README atualizado
- [ ] ROADMAP adaptado
- [ ] Instruções de deployment
- [ ] Contato do suporte

## 🔧 Arquivos para Editar

### Sempre Editar:
`
config/site.ts
data/mock-products.ts
app/layout.tsx (metadata)
`

### Normalmente Editar:
`
components/commerce/sports-hero.tsx
components/layout/header.tsx
components/layout/footer.tsx
`

### Raramente Editar:
`
types/product.ts
lib/formatters.ts
components/ui/* (design system)
`

## 📸 Especificações de Imagens

### Produtos
- Tamanho: 500x600px mínimo
- Formato: JPG ou PNG
- Otimizar com TinyPNG
- Múltiplas imagens (mínimo 2)

### Hero
- Tamanho: 1200x600px mínimo
- Formato: JPG ou PNG
- Otimizado para web

### Favicon
- Tamanho: 32x32px
- Formato: PNG ou ICO
- Colocar em /public/

## 🎨 Tailwind Customization

No \	ailwind.config.ts\, editar:
- Cores primárias
- Fonts
- Spacing
- Breakpoints

## 📱 Teste de Responsividade

Verificar em:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)
- [ ] Dark mode (se aplicável)

## ✅ Pré-Launch Checklist

- [ ] Todos arquivos atualizados
- [ ] Sem erros de TypeScript
- [ ] Testes passando
- [ ] Performance OK (Lighthouse)
- [ ] SEO OK (meta tags)
- [ ] Analytics configurado
- [ ] Domain funcionando
- [ ] Email funcionando
- [ ] Backup realizado

## 🚀 Launch!

Quando tudo estiver pronto:
1. Fazer backup completo
2. Deploy em produção
3. Smoke test de todas rotas
4. Notificar cliente
5. Monitorar primeiras horas
6. Coletar feedback

---

**Tempo estimado de setup:** 3-5 horas para um novo cliente
**Tempo estimado de deploy:** 1-2 horas
