import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Booking, Conversation, Profile } from '../types';
import { fetchHostBookings, fetchStudentBookings, fetchConversations } from './api';
import { useAuthStore } from '../stores/authStore';
import { useNotificationsStore } from '../stores/notificationsStore';
import { COLORS } from '../constants';

export interface AppNotification {
  id: string;
  icon: string;          // nome de ícone Ionicons
  iconColor: string;
  title: string;
  subtitle: string;
  timestamp: string;     // ISO
  route?: string;
}

// Monta a lista de avisos a partir dos dados reais (reservas + conversas).
export function buildNotifications(
  user: Profile | null,
  bookings: Booking[],
  conversations: Conversation[],
): AppNotification[] {
  if (!user) return [];
  const isHost = user.user_type === 'host';
  const items: AppNotification[] = [];

  for (const b of bookings) {
    const propTitle = b.property?.title ?? 'imóvel';
    if (isHost) {
      const studentName = b.student?.full_name ?? 'Um estudante';
      if (b.status === 'pending') {
        items.push({
          id: `booking-${b.id}`,
          icon: 'time-outline',
          iconColor: COLORS.warning,
          title: 'Nova solicitação de reserva',
          subtitle: `${studentName} quer reservar "${propTitle}".`,
          timestamp: b.created_at,
          route: '/host/dashboard',
        });
      } else if (b.status === 'confirmed') {
        items.push({
          id: `booking-${b.id}`,
          icon: 'checkmark-circle-outline',
          iconColor: COLORS.success,
          title: 'Reserva confirmada',
          subtitle: `Você confirmou a reserva de ${studentName} em "${propTitle}".`,
          timestamp: b.created_at,
          route: '/host/dashboard',
        });
      } else if (b.status === 'cancelled') {
        items.push({
          id: `booking-${b.id}`,
          icon: 'close-circle-outline',
          iconColor: COLORS.error,
          title: 'Reserva recusada',
          subtitle: `Solicitação de ${studentName} em "${propTitle}" foi recusada.`,
          timestamp: b.created_at,
          route: '/host/dashboard',
        });
      }
    } else {
      const hostName = b.host?.full_name ?? 'o anfitrião';
      if (b.status === 'pending') {
        items.push({
          id: `booking-${b.id}`,
          icon: 'time-outline',
          iconColor: COLORS.warning,
          title: 'Reserva enviada',
          subtitle: `Aguardando ${hostName} confirmar "${propTitle}".`,
          timestamp: b.created_at,
          route: `/booking/${b.id}`,
        });
      } else if (b.status === 'confirmed') {
        items.push({
          id: `booking-${b.id}`,
          icon: 'checkmark-circle-outline',
          iconColor: COLORS.success,
          title: 'Reserva confirmada 🎉',
          subtitle: `Sua reserva em "${propTitle}" foi confirmada.`,
          timestamp: b.created_at,
          route: `/booking/${b.id}`,
        });
      } else if (b.status === 'cancelled') {
        items.push({
          id: `booking-${b.id}`,
          icon: 'close-circle-outline',
          iconColor: COLORS.error,
          title: 'Reserva recusada',
          subtitle: `Sua reserva em "${propTitle}" não foi aceita.`,
          timestamp: b.created_at,
          route: `/booking/${b.id}`,
        });
      } else if (b.status === 'completed') {
        items.push({
          id: `booking-${b.id}`,
          icon: 'flag-outline',
          iconColor: COLORS.textSecondary,
          title: 'Estadia concluída',
          subtitle: `Sua estadia em "${propTitle}" foi concluída.`,
          timestamp: b.created_at,
          route: `/booking/${b.id}`,
        });
      }
    }
  }

  for (const c of conversations) {
    const other = user.id === c.student_id ? c.host : c.student;
    items.push({
      id: `conv-${c.id}`,
      icon: 'chatbubble-ellipses-outline',
      iconColor: COLORS.primary,
      title: `Mensagem de ${other?.full_name ?? 'um contato'}`,
      subtitle: c.property?.title ? `Sobre "${c.property.title}".` : 'Toque para abrir a conversa.',
      timestamp: c.last_message_at,
      route: `/chat/${c.id}`,
    });
  }

  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

// Hook central: busca os dados, monta os avisos e calcula quantos não foram vistos.
export function useNotifications() {
  const { user } = useAuthStore();
  const isHost = user?.user_type === 'host';
  const lastSeen = useNotificationsStore((s) => s.lastSeen);

  const bookingsQuery = useQuery({
    queryKey: isHost ? ['hostBookings', user?.id] : ['studentBookings', user?.id],
    queryFn: () => (isHost ? fetchHostBookings(user!.id) : fetchStudentBookings(user!.id)),
    enabled: !!user,
  });

  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
  });

  const notifications = useMemo(
    () => buildNotifications(user, bookingsQuery.data ?? [], conversationsQuery.data ?? []),
    [user, bookingsQuery.data, conversationsQuery.data],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => new Date(n.timestamp).getTime() > lastSeen).length,
    [notifications, lastSeen],
  );

  return {
    notifications,
    unreadCount,
    lastSeen,
    isLoading: bookingsQuery.isLoading || conversationsQuery.isLoading,
    isRefetching: bookingsQuery.isRefetching || conversationsQuery.isRefetching,
    refetch: () => {
      bookingsQuery.refetch();
      conversationsQuery.refetch();
    },
  };
}
