import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Switch, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import {
  fetchProperty, updateProperty, deletePropertyPhoto, uploadAndInsertPhoto,
} from '../../../lib/api';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from '../../../lib/toast';
import { COLORS, SIZES, PROPERTY_TYPES } from '../../../constants';
import { PropertyType, PropertyPhoto } from '../../../types';

type NewPhoto = { uri: string; base64: string | null; mimeType: string | null };

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
  });

  const [type, setType] = useState<PropertyType>('room');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [stateUf, setStateUf] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [price, setPrice] = useState('');
  const [minStay, setMinStay] = useState('6');
  const [rules, setRules] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [existingPhotos, setExistingPhotos] = useState<PropertyPhoto[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (property && !initialized.current) {
      initialized.current = true;
      setType(property.type);
      setTitle(property.title);
      setDescription(property.description);
      setCity(property.city);
      setStateUf(property.state);
      setNeighborhood(property.neighborhood);
      setPrice(String(property.price_per_month));
      setMinStay(String(property.min_stay_months));
      setRules(property.rules ?? '');
      setIsActive(property.is_active);
      const sorted = [...(property.photos ?? [])].sort((a, b) => a.order_index - b.order_index);
      setExistingPhotos(sorted);
    }
  }, [property]);

  const totalPhotos = existingPhotos.length + newPhotos.length;

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error('Permissão necessária', 'Autorize o acesso às fotos para editar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) {
      const picked: NewPhoto[] = result.assets.map((a) => ({
        uri: a.uri,
        base64: a.base64 ?? null,
        mimeType: a.mimeType ?? null,
      }));
      setNewPhotos((prev) => [...prev, ...picked].slice(0, 10));
    }
  };

  const removeExisting = (photoId: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setRemovedIds((prev) => [...prev, photoId]);
  };

  const removeNew = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, j) => j !== index));
  };

  const handleSave = async () => {
    if (!property) return;
    if (!title.trim() || !description.trim() || !city.trim() || !neighborhood.trim()) {
      toast.error('Campos obrigatórios', 'Preencha título, descrição, cidade e bairro.');
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error('Preço inválido', 'Informe um preço maior que zero.');
      return;
    }
    if (totalPhotos < 1) {
      toast.error('Sem fotos', 'O imóvel precisa de pelo menos 1 foto.');
      return;
    }

    setSaving(true);
    try {
      setProgress('Salvando alterações...');
      await updateProperty(property.id, {
        title: title.trim(),
        description: description.trim(),
        type,
        city: city.trim(),
        state: stateUf.trim() || city.trim(),
        neighborhood: neighborhood.trim(),
        price_per_month: Number(price),
        min_stay_months: Number(minStay) || 6,
        rules: rules.trim() || null,
        is_active: isActive,
      });

      // Remove fotos marcadas
      for (const photoId of removedIds) {
        await deletePropertyPhoto(photoId);
      }

      // Envia novas fotos (continua a numeração das que ficaram)
      if (newPhotos.length > 0) {
        const nextIndex = existingPhotos.length > 0
          ? Math.max(...existingPhotos.map((p) => p.order_index)) + 1
          : 0;
        for (let j = 0; j < newPhotos.length; j++) {
          const p = newPhotos[j];
          if (!p.base64) continue;
          setProgress(`Enviando foto ${j + 1} de ${newPhotos.length}...`);
          await uploadAndInsertPhoto(p.base64, property.id, nextIndex + j, p.mimeType || 'image/jpeg');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      queryClient.invalidateQueries({ queryKey: ['hostProperties', user?.id] });

      setProgress('');
      setSaving(false);
      toast.success('Imóvel atualizado! ✅', 'As alterações já estão visíveis.');
      setTimeout(() => router.back(), 600);
    } catch (err: any) {
      setProgress('');
      setSaving(false);
      toast.error('Erro ao salvar', err?.message ?? 'Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.textSecondary }}>Imóvel não encontrado.</Text>
        <Button label="Voltar" onPress={() => router.back()} variant="outline" style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (user?.id !== property.host_id) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color={COLORS.textLight} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>Você só pode editar seus próprios imóveis.</Text>
        <Button label="Voltar" onPress={() => router.back()} variant="outline" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar imóvel</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {/* Status */}
        <View style={styles.activeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activeTitle}>Anúncio ativo</Text>
            <Text style={styles.activeHint}>Quando desativado, não aparece nas buscas.</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ true: COLORS.primary, false: COLORS.border }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* Tipo */}
        <Text style={styles.label}>Tipo de imóvel</Text>
        <View style={styles.typeGrid}>
          {PROPERTY_TYPES.map((t) => {
            const selected = type === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeCard, selected && styles.typeCardSelected]}
                onPress={() => setType(t.value as PropertyType)}
                accessibilityLabel={`Tipo ${t.label}`}
              >
                <Ionicons name={t.icon as any} size={22} color={selected ? COLORS.white : COLORS.primary} />
                <Text style={[styles.typeCardLabel, selected && styles.typeCardLabelSelected]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Fotos */}
        <Text style={styles.label}>Fotos</Text>
        <View style={styles.photoGrid}>
          {existingPhotos.map((p, i) => (
            <View key={p.id} style={styles.photoWrapper}>
              <Image source={{ uri: p.url }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => removeExisting(p.id)} accessibilityLabel="Remover foto">
                <Ionicons name="close-circle" size={22} color={COLORS.error} />
              </TouchableOpacity>
              {i === 0 && <View style={styles.coverBadge}><Text style={styles.coverBadgeText}>Capa</Text></View>}
            </View>
          ))}
          {newPhotos.map((p, i) => (
            <View key={`new-${i}`} style={styles.photoWrapper}>
              <Image source={{ uri: p.uri }} style={styles.photoThumb} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => removeNew(i)} accessibilityLabel="Remover foto">
                <Ionicons name="close-circle" size={22} color={COLORS.error} />
              </TouchableOpacity>
              <View style={styles.newBadge}><Text style={styles.coverBadgeText}>Nova</Text></View>
            </View>
          ))}
          {totalPhotos < 10 && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages} accessibilityLabel="Adicionar fotos">
              <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
              <Text style={styles.addPhotoText}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.photoCount}>{totalPhotos}/10 fotos</Text>

        {/* Detalhes */}
        <Text style={styles.label}>Detalhes</Text>
        <Input label="Título *" value={title} onChangeText={setTitle} accessibilityLabel="Campo título" />
        <Input label="Descrição *" value={description} onChangeText={setDescription} multiline numberOfLines={4} accessibilityLabel="Campo descrição" />
        <Input label="Preço por mês (R$) *" value={price} onChangeText={setPrice} keyboardType="numeric" accessibilityLabel="Campo preço" />
        <Input label="Estadia mínima (meses)" value={minStay} onChangeText={setMinStay} keyboardType="numeric" accessibilityLabel="Campo estadia mínima" />

        <Text style={styles.label}>Localização</Text>
        <Input label="Cidade *" value={city} onChangeText={setCity} accessibilityLabel="Campo cidade" />
        <Input label="Estado" value={stateUf} onChangeText={setStateUf} accessibilityLabel="Campo estado" />
        <Input label="Bairro *" value={neighborhood} onChangeText={setNeighborhood} accessibilityLabel="Campo bairro" />

        <Input label="Regras da casa" value={rules} onChangeText={setRules} multiline numberOfLines={3} accessibilityLabel="Campo regras" />

        {progress ? <Text style={styles.progressText}>{progress}</Text> : null}
        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Cancelar" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} disabled={saving} accessibilityLabel="Cancelar edição" />
        <Button
          label={saving ? progress || 'Salvando...' : 'Salvar alterações'}
          onPress={handleSave}
          loading={saving}
          style={{ flex: 1 }}
          accessibilityLabel="Salvar alterações"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: SIZES.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: SIZES.lg },
  label: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 18, marginBottom: 12 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusMd, padding: 14 },
  activeTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  activeHint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: COLORS.surface },
  typeCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeCardLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  typeCardLabelSelected: { color: COLORS.white },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrapper: { position: 'relative' },
  photoThumb: { width: 100, height: 100, borderRadius: SIZES.radius },
  removePhoto: { position: 'absolute', top: -6, right: -6 },
  coverBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  newBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  coverBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '600' },
  addPhotoBtn: { width: 100, height: 100, borderRadius: SIZES.radius, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addPhotoText: { fontSize: 12, color: COLORS.primary },
  photoCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  progressText: { fontSize: 13, color: COLORS.primary, textAlign: 'center', marginTop: 16, fontWeight: '500' },
  footer: { flexDirection: 'row', gap: 12, padding: SIZES.lg, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
});
