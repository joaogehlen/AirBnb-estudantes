import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { COLORS } from '../../constants';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(focused: boolean, base: IoniconName, filled: IoniconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={focused ? filled : base} size={size} color={color} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ focused, color, size }) => tabIcon(focused, 'home-outline', 'home')({ color, size }) }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Buscar', tabBarIcon: ({ focused, color, size }) => tabIcon(focused, 'search-outline', 'search')({ color, size }) }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favoritos', tabBarIcon: ({ focused, color, size }) => tabIcon(focused, 'heart-outline', 'heart')({ color, size }) }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Mensagens', tabBarIcon: ({ focused, color, size }) => tabIcon(focused, 'chatbubble-outline', 'chatbubble')({ color, size }) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ focused, color, size }) => tabIcon(focused, 'person-outline', 'person')({ color, size }) }}
      />
    </Tabs>
  );
}
