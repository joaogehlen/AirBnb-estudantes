# AirBnb Estudantes

Aplicativo mobile com **React Native + Expo** para conectar estudantes universitários a anfitriões com moradias próximas às universidades.

## Stack adotada

- Expo SDK + Expo Router (navegação baseada em arquivos)
- TypeScript
- Supabase (`@supabase/supabase-js`) para dados/auth/storage
- React Query (TanStack Query) para fetch/cache
- Zustand para estado global
- NativeWind (Tailwind para React Native)
- `react-native-maps` para mapa de moradias
- Stripe (`@stripe/stripe-react-native`) com criação de pagamento via Supabase Edge Function
- i18n com `pt-BR` e `en-US`

## Configuração

1. Instale dependências:

```bash
npm install
```

2. Crie um arquivo `.env` a partir de `.env.example`.

3. Execute:

```bash
npm run start
```

## Edge Function esperada

O app chama a função Supabase `create-payment-intent` em `src/services/payments.ts` para iniciar pagamentos com Stripe.
