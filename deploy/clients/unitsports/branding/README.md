# Branding — UnitSports

Logo **desta implantação**. Não reutilizar em outras lojas.

| Arquivo | Uso |
|---------|-----|
| `logo.jpeg` | Fonte canônica para gerar favicon, OG e logo no Storage |

---

## Processo recomendado

1. Substituir `logo.jpeg` aqui quando o cliente enviar nova arte
2. Confirmar env apontando para Supabase **UnitSports** (`.env.local` ou Netlify)
3. **Hoje:** copiar para [`deploy/branding/logo.jpeg`](../../../branding/logo.jpeg) e rodar `npm run branding:sync`
4. **Futuro:** `npm run branding:sync -- --client unitsports` (lerá esta pasta diretamente)
5. Validar header, favicon e OG em https://unitsports.netlify.app

---

## O que não fazer

- Copiar esta logo para `deploy/clients/<outro-slug>/`
- Commitar logo de outro cliente nesta pasta
- Assumir que `deploy/branding/` é a fonte permanente — ver [`deploy/branding/README.md`](../../../branding/README.md)
