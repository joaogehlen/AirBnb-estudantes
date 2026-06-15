// ============================================================
// DESIGN SYSTEM DO STUDENTNEST — paleta derivada do ícone do app
// (bordô/vinho + creme), com dourado como acento.
// ============================================================

export const COLORS = {
  // Marca (bordô/vinho do ícone — #802030)
  primary: '#802030',
  primaryLight: '#A6334B',
  primaryDark: '#5C1622',
  primaryTint: '#F7EBEE',      // fundo suave rosado/creme

  // Secundária / acentos (dourado que combina com o vinho + creme)
  secondary: '#C0892D',
  secondaryLight: '#E7CC83',
  accent: '#9C6B1E',           // bronze/ouro (destaques / anfitrião verificado)
  accentTint: '#F6EEDD',

  // Superfícies (off-white quente, eco do creme do ícone)
  background: '#FAF6F4',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3EDEA',

  // Texto (cinza quente)
  text: '#241C1F',
  textSecondary: '#6E6166',
  textLight: '#A89DA1',

  // Bordas (neutros quentes)
  border: '#EAE3E0',
  borderDark: '#D8CFCB',

  // Status / feedback
  error: '#D11A2A',
  errorLight: '#FBE9EB',
  success: '#1E7A47',
  successLight: '#E4F2EA',
  warning: '#C98A1E',
  warningLight: '#FAF0DA',
  info: '#7A2E45',             // info em tom de marca (vinho suave)
  infoLight: '#F4E8EC',

  // Status de reserva
  pending: '#C98A1E',
  confirmed: '#1E7A47',
  cancelled: '#D11A2A',
  completed: '#6E6166',

  // Diversos
  star: '#E0A21E',
  white: '#FFFFFF',
  black: '#1A1416',
  overlay: 'rgba(0,0,0,0.5)',

  // Escala neutra quente (compat. com componentes utilitários)
  neutral100: '#F3EDEA',
  neutral200: '#EAE3E0',
  neutral300: '#D8CFCB',
  neutral400: '#C4B8B3',
  neutral500: '#A89DA1',
  neutral600: '#6E6166',
  neutral700: '#48383D',
  neutral800: '#33262A',
  neutral900: '#241C1F',
  primary100: '#F2DCE1',
  danger: '#D11A2A',
};

export const FONTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  radiusSm: 6,
  radius: 10,
  radiusMd: 14,
  radiusLg: 18,
  radiusXl: 24,
  radiusFull: 999,
};

// Sombras consistentes (iOS + Android)
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const PROPERTY_TYPES = [
  { value: 'room', label: 'Quarto', icon: 'bed-outline' },
  { value: 'studio', label: 'Kitnet', icon: 'home-outline' },
  { value: 'republic', label: 'República', icon: 'people-outline' },
  { value: 'apartment', label: 'Apartamento', icon: 'business-outline' },
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

export const STRINGS = {
  appName: 'StudentNest',
  tagline: 'Moradia universitária sem complicação',
  loading: 'Carregando...',
  error: 'Algo deu errado. Tente novamente.',
  noResults: 'Nenhum resultado encontrado.',
  seeAll: 'Ver todos',
  loginTitle: 'Bem-vindo de volta',
  loginSubtitle: 'Entre na sua conta para continuar',
  registerTitle: 'Criar conta',
  registerSubtitle: 'Junte-se ao StudentNest',
  emailLabel: 'E-mail',
  passwordLabel: 'Senha',
  nameLabel: 'Nome completo',
  loginBtn: 'Entrar',
  registerBtn: 'Criar conta',
  noAccount: 'Não tem conta? ',
  hasAccount: 'Já tem conta? ',
  signUp: 'Cadastre-se',
  signIn: 'Entrar',
  homeTitle: 'Encontre sua moradia',
  searchPlaceholder: 'Buscar cidade ou bairro...',
  nearUniversity: 'Próximo à sua universidade',
  topRated: 'Mais avaliados',
  republics: 'Repúblicas disponíveis',
  reserve: 'Reservar',
  contact: 'Contatar anfitrião',
  favorite: 'Favoritos',
  myBookings: 'Minhas reservas',
  editProfile: 'Editar perfil',
  logout: 'Sair',
  confirmLogout: 'Deseja sair da sua conta?',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  save: 'Salvar',
  perMonth: '/mês',
  months: 'meses',
  totalPrice: 'Preço total',
  checkIn: 'Entrada',
  duration: 'Duração',
  bookingConfirmed: 'Reserva enviada!',
  bookingPending: 'Aguardando confirmação do anfitrião.',
  stars: 'estrelas',
  reviews: 'avaliações',
  rules: 'Regras da casa',
  description: 'Descrição',
  amenities: 'Comodidades',
  location: 'Localização',
  hostInfo: 'Sobre o anfitrião',
  addProperty: 'Anunciar imóvel',
  myProperties: 'Meus imóveis',
  newProperty: 'Novo anúncio',
  propertyTitle: 'Título do imóvel',
  propertyType: 'Tipo de imóvel',
  propertyCity: 'Cidade',
  propertyNeighborhood: 'Bairro',
  propertyPrice: 'Preço por mês (R$)',
  propertyDescription: 'Descrição',
  propertyRules: 'Regras da casa',
  publishProperty: 'Publicar imóvel',
  pendingRequests: 'Solicitações pendentes',
  activeBookings: 'Reservas ativas',
  acceptBooking: 'Aceitar',
  rejectBooking: 'Recusar',
};
