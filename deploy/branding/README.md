# Branding — área de trabalho legacy (operador)

**Não é branding permanente do core.** Esta pasta existe porque os scripts atuais (`npm run branding:sync`, prebuild Netlify) leem `deploy/branding/logo.*` como fonte.

---

## Risco operacional (multi-cliente)

| Problema | Consequência |
|----------|--------------|
| Uma logo no core | Logo da UnitSports pode virar “global” no repo |
| Trocar arquivo sem contexto | Favicon/OG errado na implantação ativa |
| Operador no cliente errado | Branding aplicado no Supabase/Netlify errado |

**Regra:** trate esta pasta como **bancada temporária** até o script por cliente existir. A fonte canônica por loja é:

```text
deploy/clients/<slug>/branding/logo.jpeg
```

---

## Uso atual (até adaptação do script)

1. Identificar o **slug** do cliente (ex.: `unitsports`)
2. Copiar a logo do cliente para `deploy/clients/<slug>/branding/logo.jpeg`
3. **Copiar manualmente** (ou symlink local) para `deploy/branding/logo.jpeg` **somente** antes de rodar `npm run branding:sync`
4. Confirmar `.env.local` / Netlify apontam para o **Supabase correto** daquele cliente
5. Rodar `npm run branding:sync`
6. Validar header, favicon e OG na URL pública do cliente

**Nunca** deixar logo de um cliente em `deploy/branding/` como padrão permanente no repositório.

---

## Futuro (documentado, não implementado)

```bash
npm run branding:sync -- --client unitsports
```

Comportamento esperado:

- Ler `deploy/clients/<slug>/branding/logo.jpeg`
- Validar arquivo (formato, dimensões mínimas)
- Gerar favicon, OG e derivados de logo
- Publicar **apenas** no Supabase Storage da implantação daquele cliente
- Não depender de `deploy/branding/` como fonte global

Ver [`docs/MULTI_CLIENT_DEPLOYMENT.md`](../../docs/MULTI_CLIENT_DEPLOYMENT.md) § Branding por cliente.
