# StudentNest 🏠

Plataforma mobile de moradia universitária — React Native + Expo (Android)

## Configuração em 5 passos

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo `supabase_migration.sql`
3. Copie a URL e a chave anon do projeto
4. Cole em `lib/supabase.ts`:
```ts
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON';
```

### 3. Remover o usuário mock (quando integrar o Supabase)
Em `app/_layout.tsx`, remova o bloco `useEffect` que chama `setUser(MOCK_USER)` e substitua pela lógica real de sessão do Supabase Auth.

### 4. Rodar no Android
```bash
npx expo start --android
# ou para build APK:
npx expo run:android
```

### 5. Rodar no Expo Go (mais fácil para testes)
```bash
npx expo start
# Escaneie o QR Code com o app Expo Go no celular
```

---

## Estrutura do projeto

```
app/
  (auth)/         → login.tsx, register.tsx
  (tabs)/         → index, search, favorites, messages, profile
  listing/[id]    → Detalhe do imóvel
  booking/[id]    → Tela de reserva
  booking/list    → Lista de reservas do estudante
  host/
    dashboard     → Painel do anfitrião
    new-listing   → Cadastro de imóvel (5 etapas)

components/
  ui/             → Button, Input, Badge
  cards/          → PropertyCard

lib/
  supabase.ts     → Cliente Supabase
  mockData.ts     → Dados de exemplo para desenvolvimento
  helpers.ts      → Utilitários (formatDate, formatCurrency...)

stores/           → Zustand (auth, favorites, search)
types/            → Interfaces TypeScript
constants/        → Cores, textos, tamanhos
supabase_migration.sql → SQL completo para o banco de dados
```

## Funcionalidades implementadas

### Para estudantes
- [x] Cadastro com validação de e-mail universitário (.edu.br)
- [x] Login / logout
- [x] Home com seções (próximos, mais avaliados, repúblicas)
- [x] Busca por texto com filtros (tipo, preço)
- [x] Detalhe completo do imóvel (fotos, avaliações, anfitrião)
- [x] Fluxo de reserva (selecionar meses, calcular total, confirmar)
- [x] Lista de reservas com status
- [x] Favoritos (persistido localmente via Zustand)

### Para anfitriões
- [x] Cadastro como anfitrião
- [x] Painel com estatísticas, imóveis e reservas
- [x] Aceitar / recusar solicitações de reserva
- [x] Cadastro de imóvel em 5 etapas (tipo → local → fotos → detalhes → revisão)

### Banco de dados (Supabase)
- [x] 10 tabelas com RLS completo
- [x] Trigger de rating médio automático
- [x] Full-text search em português
- [x] Storage buckets para fotos

## Próximos passos (para integração real)
- [ ] Integrar Supabase Auth (substituir mock)
- [ ] Upload de fotos para Supabase Storage
- [ ] Chat em tempo real (Supabase Realtime)
- [ ] Notificações push (Expo Notifications)
- [ ] Mapa interativo (react-native-maps)
