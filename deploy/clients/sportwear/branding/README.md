# Branding — SportWear

Logo **desta implantação**. Não reutilizar em outras lojas.

| Arquivo | Uso |
|---------|-----|
| `logo.jpeg` | Fonte canônica para gerar favicon, OG e logo no Storage |

---

## Processo recomendado

1. Substituir `logo.jpeg` aqui quando o cliente enviar nova arte
2. Garantir env do **próprio** cliente em `deploy/clients/sportwear/.env.local` (Supabase no go-live)
3. Sincronizar: `npm run branding:sync -- --client sportwear`
4. Validar header, favicon e OG na URL pública após deploy

Fluxo preferido sem copiar env para a raiz:

```bash
npm run branding:sync -- --client sportwear
```

(O script carrega env de `deploy/clients/sportwear/.env.local` quando `--client` é informado.)

---

## O que não fazer

- Copiar esta logo para `deploy/clients/<outro-slug>/`
- Commitar logo de outro cliente nesta pasta
- Usar credenciais ou Supabase de outra implantação
- Assumir que `deploy/branding/` é a fonte permanente — ver [`deploy/branding/README.md`](../../../branding/README.md)
