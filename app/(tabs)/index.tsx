import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useListings } from '@/src/hooks/useListings';
import { useAppStore } from '@/src/store/useAppStore';
import type { Listing } from '@/src/types/listing';

const emptyListings: Listing[] = [];

export default function ListingsScreen() {
  const { t, i18n } = useTranslation();
  const { data } = useListings();
  const { locale, setLocale, setFavoriteListings } = useAppStore();
  const listings = data ?? emptyListings;

  useEffect(() => {
    setFavoriteListings(listings);
  }, [listings, setFavoriteListings]);

  const nextLocale = locale === 'pt-BR' ? 'en-US' : 'pt-BR';

  return (
    <View className="flex-1 bg-white px-4 py-6">
      <Text className="text-2xl font-bold text-slate-900">{t('listings')}</Text>
      <Text className="mt-2 text-slate-600">{t('objective')}</Text>

      <Pressable
        className="mt-4 rounded-lg bg-slate-900 px-4 py-3"
        onPress={() => {
          setLocale(nextLocale);
          i18n.changeLanguage(nextLocale).catch((error: unknown) => {
            console.warn('Language change failed', error);
          });
        }}>
        <Text className="text-center font-semibold text-white">
          {t('language')}: {locale}
        </Text>
      </Pressable>

      <View className="mt-4 gap-3">
        {listings.map((listing) => (
          <View key={listing.id} className="rounded-xl border border-slate-200 p-4">
            <Text className="text-lg font-semibold text-slate-900">{listing.title}</Text>
            <Text className="text-slate-500">
              {listing.university} · R$ {listing.price}
            </Text>
            <Text className="mt-1 text-slate-400">{t('closeToUniversity')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
