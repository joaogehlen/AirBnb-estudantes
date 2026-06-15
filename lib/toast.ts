import Toast from 'react-native-toast-message';

// Helper central de notificações (toasts) do StudentNest.
// Uso: toast.success('Pronto!'), toast.error('Algo deu errado', 'Detalhe...')

export const toast = {
  success(title: string, message?: string) {
    Toast.show({ type: 'success', text1: title, text2: message, visibilityTime: 2800 });
  },
  error(title: string, message?: string) {
    Toast.show({ type: 'error', text1: title, text2: message, visibilityTime: 3500 });
  },
  info(title: string, message?: string) {
    Toast.show({ type: 'info', text1: title, text2: message, visibilityTime: 2800 });
  },
  hide() {
    Toast.hide();
  },
};

export default toast;
