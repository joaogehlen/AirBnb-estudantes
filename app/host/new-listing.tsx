import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { createProperty, uploadAndInsertPhoto } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../lib/toast';
import { COLORS, SIZES, PROPERTY_TYPES } from '../../constants';
import { PropertyType } from '../../types';

const STEPS = ['Tipo', 'Localização', 'Fotos', 'Detalhes', 'Revisão'];

const AMENITIES_OPTIONS = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi-outline' },
  { id: 'water', label: 'Água inclusa', icon: 'water-outline' },
  { id: 'furnished', label: 'Mobiliado', icon: 'bed-outline' },
  { id: 'ac', label: 'Ar-condicionado', icon: 'snow-outline' },
  { id: 'parking', label: 'Estacionamento', icon: 'car-outline' },
  { id: 'laundry', label: 'Lavanderia', icon: 'shirt-outline' },
  { id: 'kitchen', label: 'Cozinha', icon: 'restaurant-outline' },
  { id: 'gym', label: 'Academia', icon: 'fitness-outline' },
];

export default function NewListingScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const [type, setType] = useState<PropertyType>('room');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [minStay, setMinStay] = useState('6');
  const [rules, setRules] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());

  const canGoNext = () => {
    if (step === 0) return true;
    if (step === 1) return city.trim().length > 0 && neighborhood.trim().length > 0;
    if (step === 2) return photos.length >= 1;
    if (step === 3) return title.trim().length > 0 && price.trim().length > 0 && description.trim().length > 0;
    return true;
  };

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error('Permissão necessária', 'Autorize o acesso às fotos para anunciar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 10));
    }
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!price || Number(price) <= 0) {
      toast.error('Preço inválido', 'Informe um preço maior que zero.');
      return;
    }
    setLoading(true);
    try {
      setUploadProgress('Salvando imóvel...');
      const property = await createProperty({
        host_id: user.id,
        title: title.trim(),
        description: description.trim(),
        type,
        city: city.trim(),
        state: state.trim() || city.trim(),
        neighborhood: neighborhood.trim(),
        price_per_month: Number(price),
        min_stay_months: Number(minStay) || 6,
        rules: rules.trim() || undefined,
      });

      // Upload fotos
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          setUploadProgress(`Enviando foto ${i + 1} de ${photos.length}...`);
          await uploadAndInsertPhoto(photos[i], property.id, i);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['hostProperties', user.id] });

      setUploadProgress('');
      setLoading(false);
      toast.success('Imóvel publicado! 🎉', 'Seu anúncio já está visível para estudantes.');
      setTimeout(() => router.replace('/host/dashboard'), 700);
    } catch (err: any) {
      setUploadProgress('');
      setLoading(false);
      toast.error('Erro ao publicar', err?.message ?? 'Tente novamente.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <Text style={styles.stepTitle}>Que tipo de imóvel é?</Text>
            <Text style={styles.stepSubtitle}>Escolha a opção que melhor descreve o espaço</Text>
            <View style={styles.typeGrid}>
              {PROPERTY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeCard, type === t.value && styles.typeCardSelected]}
                  onPress={() => setType(t.value as PropertyType)}
                  accessibilityLabel={`Tipo ${t.label}`}
                >
                  <Ionicons name={t.icon as any} size={30} color={type === t.value ? COLORS.white : COLORS.primary} />
                  <Text style={[styles.typeCardLabel, type === t.value && styles.typeCardLabelSelected]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Onde fica o imóvel?</Text>
            <Text style={styles.stepSubtitle}>Apenas o bairro é exibido publicamente até a reserva ser confirmada</Text>
            <Input label="Cidade *" placeholder="Ex: São Paulo" value={city} onChangeText={setCity} accessibilityLabel="Campo cidade" />
            <Input label="Estado" placeholder="Ex: SP" value={state} onChangeText={setState} accessibilityLabel="Campo estado" />
            <Input label="Bairro *" placeholder="Ex: Butantã" value={neighborhood} onChangeText={setNeighborhood} accessibilityLabel="Campo bairro" />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Fotos do imóvel</Text>
            <Text style={styles.stepSubtitle}>Adicione pelo menos 1 foto. Imóveis com mais fotos recebem mais visitas.</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoWrapper}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    accessibilityLabel={`Remover foto ${i + 1}`}
                  >
                    <Ionicons name="close-circle" size={22} color={COLORS.error} />
                  </TouchableOpacity>
                  {i === 0 && (
                    <View style={styles.coverBadge}><Text style={styles.coverBadgeText}>Capa</Text></View>
                  )}
                </View>
              ))}
              {photos.length < 10 && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages} accessibilityLabel="Adicionar fotos">
                  <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
                  <Text style={styles.addPhotoText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.photoCount}>{photos.length}/10 fotos</Text>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Detalhes e preço</Text>
            <Input label="Título do anúncio *" placeholder="Ex: Quarto aconchegante próximo à USP" value={title} onChangeText={setTitle} accessibilityLabel="Campo título" />
            <Input label="Descrição *" placeholder="Descreva o imóvel, a vizinhança, o que está incluso..." value={description} onChangeText={setDescription} multiline numberOfLines={4} accessibilityLabel="Campo descrição" />
            <Input label="Preço por mês (R$) *" placeholder="Ex: 950" value={price} onChangeText={setPrice} keyboardType="numeric" accessibilityLabel="Campo preço" />
            <Input label="Estadia mínima (meses)" placeholder="Ex: 6" value={minStay} onChangeText={setMinStay} keyboardType="numeric" accessibilityLabel="Campo estadia mínima" />
            <Input label="Regras da casa" placeholder="Sem pets, sem festas..." value={rules} onChangeText={setRules} multiline numberOfLines={3} accessibilityLabel="Campo regras" />

            <Text style={styles.amenitiesTitle}>Comodidades disponíveis</Text>
            <View style={styles.amenitiesGrid}>
              {AMENITIES_OPTIONS.map((a) => {
                const selected = selectedAmenities.has(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.amenityOption, selected && styles.amenitySelected]}
                    onPress={() => toggleAmenity(a.id)}
                    accessibilityLabel={`Comodidade ${a.label}`}
                  >
                    <Ionicons name={a.icon as any} size={20} color={selected ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.amenityLabel, selected && styles.amenityLabelSelected]}>{a.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Revise seu anúncio</Text>
            <View style={styles.reviewCard}>
              {photos[0] && <Image source={{ uri: photos[0] }} style={styles.reviewPhoto} resizeMode="cover" />}
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewTitle}>{title || '(sem título)'}</Text>
                <Text style={styles.reviewLocation}>{neighborhood}, {city}</Text>
                <Text style={styles.reviewPrice}>{price ? `R$ ${price}/mês` : '(sem preço)'}</Text>
                <Text style={styles.reviewType}>{PROPERTY_TYPES.find(t => t.value === type)?.label}</Text>
              </View>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Descrição</Text>
              <Text style={styles.reviewValue}>{description || '-'}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Comodidades ({selectedAmenities.size})</Text>
              <Text style={styles.reviewValue}>
                {selectedAmenities.size > 0
                  ? AMENITIES_OPTIONS.filter(a => selectedAmenities.has(a.id)).map(a => a.label).join(', ')
                  : 'Nenhuma selecionada'}
              </Text>
            </View>
            {rules ? (
              <View style={styles.reviewSection}>
                <Text style={styles.reviewLabel}>Regras</Text>
                <Text style={styles.reviewValue}>{rules}</Text>
              </View>
            ) : null}
            {uploadProgress ? (
              <Text style={styles.progressText}>{uploadProgress}</Text>
            ) : null}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anunciar imóvel</Text>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Fechar">
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>Etapa {step + 1} de {STEPS.length}: {STEPS[step]}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {renderStep()}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <Button label="Anterior" onPress={() => setStep(s => s - 1)} variant="outline" style={{ flex: 1 }} disabled={loading} accessibilityLabel="Etapa anterior" />
        )}
        {step < STEPS.length - 1 ? (
          <Button
            label="Próximo"
            onPress={() => {
              if (!canGoNext()) {
                toast.error('Campos obrigatórios', 'Preencha os campos marcados com * para continuar.');
                return;
              }
              setStep(s => s + 1);
            }}
            style={{ flex: 1 }}
            accessibilityLabel="Próxima etapa"
          />
        ) : (
          <Button
            label={loading ? uploadProgress || 'Publicando...' : 'Publicar imóvel'}
            onPress={handlePublish}
            loading={loading}
            style={{ flex: 1 }}
            accessibilityLabel="Publicar imóvel"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  progressWrapper: { backgroundColor: COLORS.surface, paddingHorizontal: SIZES.lg, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 8, marginTop: 10 },
  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  progressLabel: { fontSize: 12, color: COLORS.textSecondary },
  content: { padding: SIZES.lg },
  stepTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  stepSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 20 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: { width: '47%', alignItems: 'center', gap: 10, padding: 20, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface },
  typeCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeCardLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  typeCardLabelSelected: { color: COLORS.white },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrapper: { position: 'relative' },
  photoThumb: { width: 100, height: 100, borderRadius: SIZES.radius },
  removePhoto: { position: 'absolute', top: -6, right: -6 },
  coverBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  coverBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '600' },
  addPhotoBtn: { width: 100, height: 100, borderRadius: SIZES.radius, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addPhotoText: { fontSize: 12, color: COLORS.primary },
  photoCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
  amenitiesTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 8, marginBottom: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: SIZES.radius, backgroundColor: COLORS.surface },
  amenitySelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  amenityLabel: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  amenityLabelSelected: { color: COLORS.white },
  reviewCard: { borderRadius: SIZES.radiusMd, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  reviewPhoto: { width: '100%', height: 160 },
  reviewInfo: { padding: 12 },
  reviewTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  reviewLocation: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  reviewPrice: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  reviewType: { fontSize: 12, color: COLORS.primaryLight, fontWeight: '500' },
  reviewSection: { marginBottom: 14 },
  reviewLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  reviewValue: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  progressText: { fontSize: 13, color: COLORS.primary, textAlign: 'center', marginTop: 12, fontWeight: '500' },
  footer: { flexDirection: 'row', gap: 12, padding: SIZES.lg, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
});
