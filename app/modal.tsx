import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';

import { createReservationPayment } from '@/src/services/payments';

export default function ModalScreen() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-slate-900">{t('payment')}</Text>
      <Pressable
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-3"
        onPress={async () => {
          try {
            await createReservationPayment(1000);
            setMessage(t('paymentReady'));
          } catch {
            setMessage(t('paymentError'));
          }
        }}>
        <Text className="text-center font-semibold text-white">{t('createPayment')}</Text>
      </Pressable>
      {message ? <Text className="mt-3 text-slate-600">{message}</Text> : null}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
