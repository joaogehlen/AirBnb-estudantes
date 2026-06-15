import { supabase } from './supabase';
import { Profile, Property, Booking, Review, Conversation, Message } from '../types';

// ---- Properties ----

export async function fetchProperties(opts?: {
  query?: string;
  type?: string;
  maxPrice?: number;
}) {
  let q = supabase
    .from('properties')
    .select(`
      *,
      host:profiles!host_id(id, full_name, avatar_url, is_verified),
      photos:property_photos(id, url, is_cover, order_index)
    `)
    .eq('is_active', true);

  if (opts?.type) q = q.eq('type', opts.type);
  if (opts?.maxPrice) q = q.lte('price_per_month', opts.maxPrice);
  if (opts?.query) {
    const t = opts.query;
    q = q.or(`title.ilike.%${t}%,city.ilike.%${t}%,neighborhood.ilike.%${t}%`);
  }

  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Property[];
}

export async function fetchProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      host:profiles!host_id(id, full_name, avatar_url, is_verified, bio, phone),
      photos:property_photos(id, url, is_cover, order_index)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Property;
}

export async function fetchPropertyReviews(propertyId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, reviewer:profiles!reviewer_id(id, full_name, avatar_url)`)
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as Review[];
}

// ---- Favorites ----

export async function fetchFavoriteIds(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('student_id', userId);
  if (error) throw error;
  return (data ?? []).map((f: any) => f.property_id as string);
}

export async function fetchFavoriteProperties(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      property:properties(
        *,
        host:profiles!host_id(id, full_name, avatar_url, is_verified),
        photos:property_photos(id, url, is_cover, order_index)
      )
    `)
    .eq('student_id', userId);
  if (error) throw error;
  return (data ?? []).map((f: any) => f.property).filter(Boolean) as Property[];
}

export async function addFavorite(userId: string, propertyId: string) {
  const { error } = await supabase
    .from('favorites')
    .insert({ student_id: userId, property_id: propertyId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, propertyId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('student_id', userId)
    .eq('property_id', propertyId);
  if (error) throw error;
}

// ---- Bookings ----

export async function createBooking(payload: {
  property_id: string;
  student_id: string;
  host_id: string;
  check_in: string;
  check_out: string;
  months: number;
  total_price: number;
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...payload, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function fetchStudentBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(
        id, title, city, neighborhood,
        photos:property_photos(url, is_cover)
      ),
      host:profiles!host_id(id, full_name, avatar_url)
    `)
    .eq('student_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function fetchHostBookings(hostId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(id, title, city, neighborhood),
      student:profiles!student_id(id, full_name, avatar_url)
    `)
    .eq('host_id', hostId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'cancelled'
) {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
  if (error) throw error;
}

// ---- Host Properties ----

export async function fetchHostProperties(hostId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`*, photos:property_photos(id, url, is_cover, order_index)`)
    .eq('host_id', hostId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Property[];
}

export async function createProperty(payload: {
  host_id: string;
  title: string;
  description: string;
  type: string;
  city: string;
  state: string;
  neighborhood: string;
  price_per_month: number;
  min_stay_months: number;
  rules?: string;
}) {
  const { data, error } = await supabase
    .from('properties')
    .insert({ ...payload, is_active: true, max_guests: 1 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProperty(
  id: string,
  payload: Partial<{
    title: string;
    description: string;
    type: string;
    city: string;
    state: string;
    neighborhood: string;
    price_per_month: number;
    min_stay_months: number;
    rules: string | null;
    is_active: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Property;
}

export async function deletePropertyPhoto(photoId: string) {
  const { error } = await supabase
    .from('property_photos')
    .delete()
    .eq('id', photoId);
  if (error) throw error;
}

// Decodifica base64 -> bytes reais. No React Native, `fetch(uri).blob()`
// gera um Blob de 0 byte ao subir pro Storage, então as fotos ficavam quebradas.
function base64ToUint8Array(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

  const len = base64.length;
  let bufferLength = (len * 3) / 4;
  if (base64[len - 1] === '=') {
    bufferLength--;
    if (base64[len - 2] === '=') bufferLength--;
  }
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e1 = lookup[base64.charCodeAt(i)];
    const e2 = lookup[base64.charCodeAt(i + 1)];
    const e3 = lookup[base64.charCodeAt(i + 2)];
    const e4 = lookup[base64.charCodeAt(i + 3)];
    if (p < bufferLength) bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (p < bufferLength) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (p < bufferLength) bytes[p++] = ((e3 & 3) << 6) | (e4 & 63);
  }
  return bytes;
}

export async function uploadAndInsertPhoto(
  base64: string,
  propertyId: string,
  index: number,
  contentType: string = 'image/jpeg'
) {
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const filename = `${propertyId}/${Date.now()}_${index}.${ext}`;
  const bytes = base64ToUint8Array(base64);

  const { data: uploaded, error: uploadError } = await supabase.storage
    .from('property-photos')
    .upload(filename, bytes.buffer as ArrayBuffer, { contentType, upsert: false });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('property-photos')
    .getPublicUrl(uploaded.path);

  const { error: dbError } = await supabase.from('property_photos').insert({
    property_id: propertyId,
    url: publicUrl,
    is_cover: index === 0,
    order_index: index,
  });
  if (dbError) throw dbError;

  return publicUrl;
}

// ---- Conversations & Messages ----

export async function fetchConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      student:profiles!student_id(id, full_name, avatar_url),
      host:profiles!host_id(id, full_name, avatar_url),
      property:properties(id, title)
    `)
    .or(`student_id.eq.${userId},host_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Conversation[];
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, sender:profiles!sender_id(id, full_name, avatar_url)`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as (Message & { sender?: Profile })[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      is_read: false,
    })
    .select(`*, sender:profiles!sender_id(id, full_name, avatar_url)`)
    .single();
  if (error) throw error;

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data as Message & { sender?: Profile };
}

export async function getOrCreateConversation(
  studentId: string,
  hostId: string,
  propertyId: string
) {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('student_id', studentId)
    .eq('host_id', hostId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (existing) return existing as { id: string };

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      student_id: studentId,
      host_id: hostId,
      property_id: propertyId,
      last_message_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) throw error;
  return data as { id: string };
}

// ---- Profile ----

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
}
