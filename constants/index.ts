// ============================================================
// DESIGN SYSTEM DO STUDENTNEST — inspirado no Airbnb
// ============================================================

export const COLORS = {
  // Marca (coral "rausch" estilo Airbnb)
  primary: '#FF385C',
  primaryLight: '#FF6B81',
  primaryDark: '#D70466',
  primaryTint: '#FFF0F2',      // fundo suave coral (substitui o antigo azul claro)

  // Secundária / acentos
  secondary: '#FF9F1C',
  secondaryLight: '#FFD166',
  accent: '#00A699',           // teal Airbnb (verificado / destaques)
  accentTint: '#E6F7F5',

  // Superfícies
  background: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F3F5',

  // Texto
  text: '#222222',
  textSecondary: '#717171',
  textLight: '#B0B0B0',

  // Bordas
  border: '#EBEBEB',
  borderDark: '#DDDDDD',

  // Status / feedback
  error: '#E11900',
  errorLight: '#FDECEA',
  success: '#008A05',
  successLight: '#E3F6E5',
  warning: '#F5A623',
  warningLight: '#FEF3E2',
  info: '#2E86C1',
  infoLight: '#E8F2FB',

  // Status de reserva
  pending: '#F5A623',
  confirmed: '#008A05',
  cancelled: '#E11900',
  completed: '#717171',

  // Diversos
  star: '#FFB400',
  white: '#FFFFFF',
  black: '#1A1A1A',
  overlay: 'rgba(0,0,0,0.5)',

  // Escala neutra (compat. com componentes utilitários)
  neutral100: '#F2F3F5',
  neutral200: '#EBEBEB',
  neutral300: '#DDDDDD',
  neutral400: '#CED4DA',
  neutral500: '#B0B0B0',
  neutral600: '#717171',
  neutral700: '#484848',
  neutral800: '#343A40',
  neutral900: '#222222',
  primary100: '#FFE2E7',
  danger: '#E11900',
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
