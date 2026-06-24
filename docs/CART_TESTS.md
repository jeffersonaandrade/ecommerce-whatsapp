# Testes do carrinho (Fase 2.1)

## context/cart-context.tsx

**Status:** não testado nesta etapa.

A lógica de `addItem`, `removeItem`, `updateQuantity` e `clearCart` está acoplada a
`useState`, `useEffect` e `getProductById` dentro do provider React. Testar exigiria
`@testing-library/react` ou extração para funções puras — fora do escopo acordado.

Cobertura indireta via:

- `lib/cart-utils.test.ts` — resolução de linhas e preços
- `lib/cart-storage.test.ts` — persistência localStorage
- `/dev/cart-test` — validação manual do contexto

## Executar

```bash
npm run test
npm run build
```

## QA manual

Acesse `/dev/cart-test` em `npm run dev` (404 em produção).
