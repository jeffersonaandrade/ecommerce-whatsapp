# Sports Store — Plataforma reutilizável para lojas esportivas

Plataforma **white-label**: um core Next.js + Supabase compartilhado, com **um deploy Netlify e um projeto Supabase por loja** (não multi-tenant no mesmo banco).

**Primeira implantação de referência:** [UnitSports](deploy/clients/unitsports/) (`loja-whats.netlify.app`).

## Arquitetura multi-cliente

| Documento | Conteúdo |
|-----------|----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Core vs deploy, anti-padrões |
| [`docs/CORE_VERSION.md`](docs/CORE_VERSION.md) | Semver do core, rollout por loja |
| [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md) | Migrations, defaults, breaking changes |
| [`docs/MULTI_CLIENT_DEPLOYMENT.md`](docs/MULTI_CLIENT_DEPLOYMENT.md) | Fluxo operacional N lojas |
| [`docs/MULTI_CLIENT_AUDIT.md`](docs/MULTI_CLIENT_AUDIT.md) | Acoplamentos classificados |
| [`deploy/registry/README.md`](deploy/registry/README.md) | Cadastro de implantações |

## 🎯 Objetivo

Base de e-commerce esportivo **reutilizável** entre clientes:
- ✅ Estrutura limpa e reaproveitável
- ✅ Mobile-first design
- ✅ Dados mockados inicialmente
- ✅ Preparado para expansão futura

## 🚀 Stack

- **Next.js 16** - Framework React moderno
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utilitária
- **App Router** - Roteamento moderno
- **Node.js 18+** - Runtime

## 📦 Instalação

\\\ash
npm install
npm run dev
\\\

## 📁 Estrutura do Projeto

- \pp/\ - Páginas e rotas
- \components/\ - Componentes React
- \data/\ - Dados mockados
- \	ypes/\ - Tipos TypeScript
- \lib/\ - Funções utilitárias
- \config/\ - Configuração do site

## 🎨 Features

- ✅ Home com hero section
- ✅ Listagem de produtos
- ✅ Página de detalhe
- ✅ Dashboard admin
- ✅ Mobile-first design

## 🛑 O que NÃO está no MVP

- ❌ Pagamento real
- ❌ Banco de dados
- ❌ Autenticação
- ❌ Carrinho persistente
- ❌ Checkout funcional

## Ferramentas de desenvolvimento

O projeto usa [Graphify](https://github.com/safishamsi/graphify) para mapear a estrutura do código e reduzir leitura repetida de arquivos no assistente de IA.

- **Guia completo:** [GRAPHIFY_MAP.md](GRAPHIFY_MAP.md)
- **Regenerar mapa:** `graphify .` (na raiz do repositório; requer `uv tool install graphifyy`)
- **Relatório:** [graphify-out/GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md)