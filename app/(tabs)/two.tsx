import { useMemo } from 'react';
import { Platform, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppStore } from '@/src/store/useAppStore';

export default function MapScreen() {
  const { t } = useTranslation();
  const favoriteListings = useAppStore((state) => state.favoriteListings);

  const initialRegion = useMemo(
    () => ({
      latitude: favoriteListings[0]?.latitude ?? -8.050951,
      longitude: favoriteListings[0]?.longitude ?? -34.951151,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    }),
    [favoriteListings],
  );

  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-slate-600">{t('map')}</Text>
      </View>
    );
  }

  const { default: MapView, Marker } = require('react-native-maps') as typeof import('react-native-maps');

  return (
    <View className="flex-1 bg-white">
      <MapView className="flex-1" initialRegion={initialRegion}>
        {favoriteListings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{ latitude: listing.latitude, longitude: listing.longitude }}
            title={listing.title}
            description={listing.university}
          />
        ))}
      </MapView>
    </View>
  );
}
