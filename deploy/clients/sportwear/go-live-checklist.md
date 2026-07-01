# Checklist go-live — nova loja

Use na **criação** da implantação. Não re-aplicar seeds em loja existente ([`docs/SEEDS.md`](../../../docs/SEEDS.md)).

---

## Infraestrutura

- [ ] Criar projeto Supabase do cliente
- [ ] Aplicar todas migrations do core ([`DATABASE_PLAN.md`](../../../docs/DATABASE_PLAN.md))
- [ ] Criar buckets Storage (`branding`, `products`) se não existirem via migration
- [ ] Criar usuário admin (`app_metadata.role=admin`)
- [ ] Criar site Netlify (conectado ao repo `main` ou tag)
- [ ] Configurar env vars ([`env.example`](env.example))
- [ ] Configurar domínio customizado + HTTPS

## Branding e conteúdo

- [ ] Colocar logo do cliente em `deploy/clients/sportwear/branding/logo.jpeg` (criar pasta `branding/`)
- [ ] Sincronizar favicon/OG/logo: `npm run branding:sync -- --client sportwear`
- [ ] Validar header, favicon e OG na URL pública
- [ ] Configurar nome, WhatsApp, e-mail em `/admin/settings`
- [ ] Revisar textos institucionais (sobre, política de trocas)

## Catálogo

- [ ] `ENABLE_MIGRATION_TOOLS=true` durante onboarding
- [ ] Importar produtos (CSV) ou cadastro manual
- [ ] Revisar imagens (Central de Mídia)
- [ ] Categorias visíveis configuradas
- [ ] Banners desktop e mobile ativos

## Validação

- [ ] Tour de onboarding concluído (opcional)
- [ ] Smoke: home, PLP, PDP, carrinho, WhatsApp
- [ ] `npm run test` + build verdes no commit deployado
- [ ] Registrar `coreVersionInstalled` em `notes.md` e `clients.local.json`
- [ ] Desligar `ENABLE_MIGRATION_TOOLS` pós-go-live

## Entrega

- [ ] Cliente recebe URL + acesso admin
- [ ] Entrada no [`deploy/registry/README.md`](../../registry/README.md)
