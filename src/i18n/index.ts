import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      objective: 'Conectamos estudantes a moradias próximas às universidades com segurança e confiança.',
      listings: 'Opções de moradia',
      map: 'Mapa',
      language: 'Idioma',
      closeToUniversity: 'Próximo à universidade',
      payment: 'Pagamento de reserva',
      createPayment: 'Criar pagamento via Edge Function',
      paymentReady: 'Pagamento criado com sucesso.',
      paymentError: 'Não foi possível criar o pagamento.',
    },
  },
  'en-US': {
    translation: {
      objective: 'We connect students to safe, trusted housing close to universities.',
      listings: 'Housing options',
      map: 'Map',
      language: 'Language',
      closeToUniversity: 'Close to university',
      payment: 'Reservation payment',
      createPayment: 'Create payment via Edge Function',
      paymentReady: 'Payment intent created.',
      paymentError: 'Could not create payment.',
    },
  },
} as const;

const locale = getLocales()[0]?.languageTag === 'pt-BR' ? 'pt-BR' : 'en-US';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    lng: locale,
    fallbackLng: 'en-US',
    resources,
    interpolation: { escapeValue: false },
  })
  .catch((error: unknown) => {
    console.warn('i18n initialization failed', error);
  });

export { i18n };
