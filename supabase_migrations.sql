-- ============================================================
-- StudentNest — Migrations SQL completas para o Supabase
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ─── Extensões ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── TABELA: universities ────────────────────────────────────
CREATE TABLE IF NOT EXISTS universities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  city         TEXT NOT NULL,
  state        CHAR(2) NOT NULL,
  domain_email TEXT NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Dados de exemplo
INSERT INTO universities (name, city, state, domain_email) VALUES
  ('USP',       'São Paulo',         'SP', 'usp.br'),
  ('UFRGS',     'Porto Alegre',      'RS', 'ufrgs.br'),
  ('UNICAMP',   'Campinas',          'SP', 'unicamp.br'),
  ('UFSC',      'Florianópolis',     'SC', 'ufsc.br'),
  ('UFMG',      'Belo Horizonte',    'MG', 'ufmg.br'),
  ('UFRJ',      'Rio de Janeiro',    'RJ', 'ufrj.br'),
  ('UNB',       'Brasília',          'DF', 'unb.br'),
  ('UFPR',      'Curitiba',          'PR', 'ufpr.br'),
  ('UNESP',     'São Paulo',         'SP', 'unesp.br'),
  ('PUC-RS',    'Porto Alegre',      'RS', 'pucrs.br');

-- ─── TABELA: profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  avatar_url        TEXT,
  user_type         TEXT NOT NULL CHECK (user_type IN ('student', 'host')),
  university_email  TEXT,
  university_name   TEXT,
  is_verified       BOOLEAN DEFAULT FALSE,
  bio               TEXT,
  phone             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar perfil após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── TABELA: properties ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('room', 'studio', 'republic', 'apartment')),
  city              TEXT NOT NULL,
  state             CHAR(2) NOT NULL,
  neighborhood      TEXT NOT NULL DEFAULT '',
  lat               NUMERIC(9,6),
  lng               NUMERIC(9,6),
  price_per_month   NUMERIC(10,2) NOT NULL,
  min_stay_months   INT NOT NULL DEFAULT 1,
  max_guests        INT NOT NULL DEFAULT 1,
  is_active         BOOLEAN DEFAULT TRUE,
  rules             TEXT,
  avg_rating        NUMERIC(3,2),
  total_reviews     INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_city     ON properties(city);
CREATE INDEX idx_properties_host     ON properties(host_id);
CREATE INDEX idx_properties_type     ON properties(type);
CREATE INDEX idx_properties_active   ON properties(is_active);
CREATE INDEX idx_properties_price    ON properties(price_per_month);

-- ─── TABELA: property_photos ─────────────────────────────────
CREATE TABLE IF NOT EXISTS property_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  is_cover      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_property ON property_photos(property_id);

-- ─── TABELA: bookings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id    UUID NOT NULL REFERENCES properties(id),
  student_id     UUID NOT NULL REFERENCES profiles(id),
  host_id        UUID NOT NULL REFERENCES profiles(id),
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  check_in       DATE NOT NULL,
  check_out      DATE NOT NULL,
  total_price    NUMERIC(10,2) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_student    ON bookings(student_id);
CREATE INDEX idx_bookings_host       ON bookings(host_id);
CREATE INDEX idx_bookings_property   ON bookings(property_id);
CREATE INDEX idx_bookings_status     ON bookings(status);

-- Function para verificar conflito de datas
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_property_id UUID,
  p_check_in    DATE,
  p_check_out   DATE,
  p_booking_id  UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bookings
    WHERE property_id = p_property_id
      AND status IN ('pending', 'confirmed')
      AND (p_booking_id IS NULL OR id != p_booking_id)
      AND (check_in, check_out) OVERLAPS (p_check_in, p_check_out)
  );
END;
$$ LANGUAGE plpgsql;

-- ─── TABELA: reviews ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES bookings(id),
  reviewer_id   UUID NOT NULL REFERENCES profiles(id),
  property_id   UUID NOT NULL REFERENCES properties(id),
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id)
);

CREATE INDEX idx_reviews_property ON reviews(property_id);

-- Trigger: atualiza avg_rating e total_reviews após nova avaliação
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties
  SET
    avg_rating    = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE property_id = NEW.property_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE property_id = NEW.property_id)
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_property_rating();

-- ─── TABELA: favorites ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, property_id)
);

CREATE INDEX idx_favorites_student ON favorites(student_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities     ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Perfis visíveis para todos autenticados"
  ON profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuário edita apenas o próprio perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- universities (leitura pública)
CREATE POLICY "Universidades visíveis para todos"
  ON universities FOR SELECT USING (true);

-- properties
CREATE POLICY "Propriedades ativas visíveis para todos"
  ON properties FOR SELECT USING (is_active = true OR host_id = auth.uid());

CREATE POLICY "Anfitrião cria propriedades"
  ON properties FOR INSERT
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Anfitrião edita suas propriedades"
  ON properties FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Anfitrião exclui suas propriedades"
  ON properties FOR DELETE USING (host_id = auth.uid());

-- property_photos
CREATE POLICY "Fotos visíveis para todos"
  ON property_photos FOR SELECT USING (true);

CREATE POLICY "Anfitrião gerencia fotos de suas propriedades"
  ON property_photos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND host_id = auth.uid())
  );

-- bookings
CREATE POLICY "Estudante vê suas reservas"
  ON bookings FOR SELECT USING (student_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "Estudante cria reserva"
  ON bookings FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Host atualiza status da reserva"
  ON bookings FOR UPDATE USING (host_id = auth.uid() OR student_id = auth.uid());

-- reviews
CREATE POLICY "Avaliações visíveis para todos"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Apenas quem participou pode avaliar"
  ON reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

-- favorites
CREATE POLICY "Estudante gerencia seus favoritos"
  ON favorites FOR ALL USING (student_id = auth.uid());

-- ─── STORAGE BUCKETS ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Qualquer um pode ver property-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

CREATE POLICY "Anfitrião faz upload em property-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Qualquer um pode ver avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuário faz upload de avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ─── DADOS DE EXEMPLO ────────────────────────────────────────
-- (Inserir após ter usuários cadastrados via Supabase Auth)
-- Exemplo de propriedades seed está no arquivo seed.sql separado
