# Release Notes — v1.0.0-demo

Template freeze para demo com cliente. Ponto de retorno: `git checkout v1.0.0-demo`.

## Escopo V1

- **Catálogo:** CRUD admin + importação CSV
- **Branding:** logo, favicon, OG, cores primária/secundária
- **Conteúdo da loja:** hero configurável, páginas institucionais (`/sobre`, `/contato`, `/politica-de-trocas`)
- **WhatsApp:** finalização com `Pedido #TEMP-YYYYMMDD-NNNN`
- **SEO:** metadata dinâmica por loja
- **Erros:** 404, 500, 503 com identidade da loja

## Instalação limpa

```bash
git clone <repo>
cd ecommerce-sports
npm install
npm run build
npm run start
```

Na primeira execução, `storage/store-settings.json` é criado a partir do seed. Configure em `/admin/settings`.

## Próxima fase

Demo → Feedback → **Fase 7** (Supabase + Auth).
