-- ================================================================
-- STUDENTNEST — MIGRATION COMPLETA PARA O SUPABASE
-- Execute no Supabase SQL Editor (Dashboard > SQL Editor)
-- ================================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- busca de texto

-- ----------------------------------------------------------------
-- TABELA: universities
-- ----------------------------------------------------------------
CREATE TABLE universities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  domain_email text NOT NULL UNIQUE
);

-- Universidades brasileiras de exemplo
INSERT INTO universities (name, city, state, domain_email) VALUES
  ('Universidade de São Paulo', 'São Paulo', 'SP', 'usp.br'),
  ('UNICAMP', 'Campinas', 'SP', 'unicamp.br'),
  ('UNIFESP', 'São Paulo', 'SP', 'unifesp.br'),
  ('UFMG', 'Belo Horizonte', 'MG', 'ufmg.br'),
  ('UFPR', 'Curitiba', 'PR', 'ufpr.br'),
  ('UFRJ', 'Rio de Janeiro', 'RJ', 'ufrj.br'),
  ('UFRGS', 'Porto Alegre', 'RS', 'ufrgs.br'),
  ('UFSC', 'Florianópolis', 'SC', 'ufsc.br');

-- ----------------------------------------------------------------
-- TABELA: profiles (extende auth.users do Supabase)
-- ----------------------------------------------------------------
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  user_type text NOT NULL CHECK (user_type IN ('student', 'host')),
  university_email text,
  is_verified boolean NOT NULL DEFAULT false,
  bio text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cria profile automaticamente após novo cadastro no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, university_email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'student'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- TABELA: properties
-- ----------------------------------------------------------------
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('room', 'studio', 'republic', 'apartment')),
  city text NOT NULL,
  state text NOT NULL,
  neighborhood text NOT NULL,
  address_full text, -- visível só após reserva confirmada
  price_per_month numeric NOT NULL CHECK (price_per_month > 0),
  min_stay_months int NOT NULL DEFAULT 6 CHECK (min_stay_months >= 1),
  max_guests int NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  rules text,
  average_rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- TABELA: property_photos
-- ----------------------------------------------------------------
CREATE TABLE property_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties ON DELETE CASCADE,
  url text NOT NULL,
  is_cover boolean NOT NULL DEFAULT false,
  order_index int NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------
-- TABELA: amenities (comodidades predefinidas)
-- ----------------------------------------------------------------
CREATE TABLE amenities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon_name text NOT NULL
);

INSERT INTO amenities (name, icon_name) VALUES
  ('Wi-Fi', 'wifi-outline'),
  ('Água inclusa', 'water-outline'),
  ('Mobiliado', 'bed-outline'),
  ('Ar-condicionado', 'snow-outline'),
  ('Estacionamento', 'car-outline'),
  ('Lavanderia', 'shirt-outline'),
  ('Cozinha equipada', 'restaurant-outline'),
  ('Academia', 'fitness-outline');

CREATE TABLE property_amenities (
  property_id uuid REFERENCES properties ON DELETE CASCADE,
  amenity_id uuid REFERENCES amenities ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

-- ----------------------------------------------------------------
-- TABELA: bookings
-- ----------------------------------------------------------------
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties ON DELETE RESTRICT,
  student_id uuid NOT NULL REFERENCES profiles ON DELETE RESTRICT,
  host_id uuid NOT NULL REFERENCES profiles ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  check_in date NOT NULL,
  check_out date NOT NULL,
  months int NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- ----------------------------------------------------------------
-- TABELA: reviews
-- ----------------------------------------------------------------
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid NOT NULL REFERENCES bookings ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, reviewer_id)
);

-- Trigger: atualizar rating médio da propriedade após nova review
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE properties
  SET
    average_rating = (SELECT AVG(rating) FROM reviews WHERE property_id = NEW.property_id),
    review_count   = (SELECT COUNT(*) FROM reviews WHERE property_id = NEW.property_id)
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_property_rating();

-- ----------------------------------------------------------------
-- TABELA: favorites
-- ----------------------------------------------------------------
CREATE TABLE favorites (
  student_id uuid REFERENCES profiles ON DELETE CASCADE,
  property_id uuid REFERENCES properties ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, property_id)
);

-- ----------------------------------------------------------------
-- TABELA: conversations
-- ----------------------------------------------------------------
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  UNIQUE (student_id, host_id, property_id)
);

-- ----------------------------------------------------------------
-- TABELA: messages
-- ----------------------------------------------------------------
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- INDEXES para performance
-- ----------------------------------------------------------------
CREATE INDEX idx_properties_city ON properties (city);
CREATE INDEX idx_properties_type ON properties (type);
CREATE INDEX idx_properties_host_id ON properties (host_id);
CREATE INDEX idx_properties_is_active ON properties (is_active);
CREATE INDEX idx_bookings_student_id ON bookings (student_id);
CREATE INDEX idx_bookings_host_id ON bookings (host_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_reviews_property ON reviews (property_id);

-- Índice de busca full-text em título e descrição de propriedades
CREATE INDEX idx_properties_fts ON properties
  USING gin (to_tsvector('portuguese', title || ' ' || description || ' ' || city));

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- profiles: usuário vê/edita apenas seu próprio perfil, mas todos leem perfis básicos
CREATE POLICY "Perfis públicos são leitura livre" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuário edita apenas seu perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- properties: todos leem imóveis ativos; host edita/cria apenas os seus
CREATE POLICY "Imóveis ativos são públicos" ON properties FOR SELECT USING (is_active = true);
CREATE POLICY "Host cria seus imóveis" ON properties FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host edita seus imóveis" ON properties FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Host exclui seus imóveis" ON properties FOR DELETE USING (auth.uid() = host_id);

-- property_photos: leitura pública; host gerencia as suas
CREATE POLICY "Fotos públicas" ON property_photos FOR SELECT USING (true);
CREATE POLICY "Host gerencia fotos" ON property_photos FOR ALL
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid()));

-- bookings: estudante vê as suas; host vê as de suas propriedades
CREATE POLICY "Estudante vê suas reservas" ON bookings FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = host_id);
CREATE POLICY "Estudante cria reserva" ON bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Host confirma/cancela reserva" ON bookings FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = student_id);

-- reviews: leitura pública; autor pode criar
CREATE POLICY "Reviews são públicas" ON reviews FOR SELECT USING (true);
CREATE POLICY "Usuário autenticado cria review" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- favorites: estudante gerencia os seus
CREATE POLICY "Favoritos privados" ON favorites FOR ALL USING (auth.uid() = student_id);

-- conversations: apenas os participantes acessam
CREATE POLICY "Participantes da conversa" ON conversations FOR ALL
  USING (auth.uid() = student_id OR auth.uid() = host_id);

-- messages: apenas os participantes da conversa
CREATE POLICY "Mensagens da conversa" ON messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id AND (c.student_id = auth.uid() OR c.host_id = auth.uid())
  ));

-- ----------------------------------------------------------------
-- FUNCTION: busca de imóveis por texto (full-text search)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_properties(search_term text, p_city text DEFAULT NULL)
RETURNS SETOF properties AS $$
BEGIN
  RETURN QUERY
    SELECT * FROM properties
    WHERE is_active = true
      AND (p_city IS NULL OR city ILIKE '%' || p_city || '%')
      AND (
        search_term IS NULL OR search_term = '' OR
        to_tsvector('portuguese', title || ' ' || description || ' ' || city)
        @@ plainto_tsquery('portuguese', search_term)
      )
    ORDER BY average_rating DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- FUNCTION: verificar conflito de datas em bookings
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bookings
    WHERE property_id = p_property_id
      AND status IN ('pending', 'confirmed')
      AND daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
  );
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- STORAGE BUCKETS
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('property-photos', 'property-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Política: usuário autenticado faz upload na pasta do seu id
CREATE POLICY "Upload de fotos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Fotos públicas" ON storage.objects FOR SELECT USING (bucket_id = 'property-photos');

CREATE POLICY "Upload de avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Avatares públicos" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
