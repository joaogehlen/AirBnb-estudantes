import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { fetchMessages, sendMessage, fetchConversations } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../lib/toast';
import { COLORS, SIZES } from '../../constants';
import { Message, Conversation, Profile } from '../../types';
import { timeAgo } from '../../lib/helpers';

type MessageWithSender = Message & { sender?: Profile };

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !user) return;

    loadData();

    // Supabase Realtime — escuta novas mensagens desta conversa
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        async (payload) => {
          // Não duplicar mensagens próprias (já adicionadas otimisticamente)
          if (payload.new.sender_id === user.id) return;

          const { data } = await supabase
            .from('messages')
            .select(`*, sender:profiles!sender_id(id, full_name, avatar_url)`)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as MessageWithSender]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [msgs, convos] = await Promise.all([
        fetchMessages(id!),
        fetchConversations(user.id),
      ]);
      setMessages(msgs as MessageWithSender[]);
      const conv = convos.find((c) => c.id === id);
      if (conv) setConversation(conv);
    } catch {
      // ignora falha silenciosa
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useCallback(async () => {
    if (!text.trim() || !user || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);

    // Mensagem otimista
    const optimistic: MessageWithSender = {
      id: `opt_${Date.now()}`,
      conversation_id: id!,
      sender_id: user.id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: user as Profile,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await sendMessage(id!, user.id, content);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? (saved as MessageWithSender) : m))
      );
    } catch {
      // Reverte em caso de erro
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(content);
      toast.error('Mensagem não enviada', 'Verifique sua conexão e tente novamente.');
    } finally {
      setSending(false);
    }
  }, [text, user, id, sending]);

  // Scroll para o final quando chegam novas mensagens
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const other = conversation
    ? user?.id === conversation.student_id
      ? conversation.host
      : conversation.student
    : null;

  const renderMessage = ({ item }: { item: MessageWithSender }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          other?.avatar_url ? (
            <Image source={{ uri: other.avatar_url }} style={styles.msgAvatar} />
          ) : (
            <View style={[styles.msgAvatar, styles.msgAvatarPlaceholder]}>
              <Text style={styles.msgAvatarText}>{other?.full_name?.[0] ?? '?'}</Text>
            </View>
          )
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {other?.avatar_url ? (
            <Image source={{ uri: other.avatar_url }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
              <Text style={styles.headerAvatarText}>{other?.full_name?.[0] ?? '?'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{other?.full_name ?? '...'}</Text>
            {conversation?.property && (
              <Text style={styles.headerProperty} numberOfLines={1}>{(conversation.property as any).title}</Text>
            )}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Nenhuma mensagem ainda. Diga olá!</Text>
              </View>
            }
            renderItem={renderMessage}
          />
        )}

        {/* Campo de digitação */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={COLORS.textLight}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            accessibilityLabel="Campo de mensagem"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            accessibilityLabel="Enviar mensagem"
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={18} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: SIZES.lg, backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarPlaceholder: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  headerProperty: { fontSize: 12, color: COLORS.textSecondary },
  loader: { flex: 1, alignSelf: 'center', marginTop: 60 },
  messageList: { padding: SIZES.md, paddingBottom: 8, flexGrow: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 30, height: 30, borderRadius: 15 },
  msgAvatarPlaceholder: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  msgAvatarText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  bubble: {
    maxWidth: '75%', padding: 10, borderRadius: 16,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 4,
  },
  bubbleThem: {},
  bubbleText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTextMe: { color: COLORS.white },
  bubbleTime: { fontSize: 10, color: COLORS.textLight, marginTop: 3, alignSelf: 'flex-end' },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: SIZES.sm, paddingHorizontal: SIZES.md,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: COLORS.surfaceSecondary, borderRadius: 20, fontSize: 14, color: COLORS.text,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
