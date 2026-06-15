-- ================================================================
-- STUDENTNEST — DADOS DE EXEMPLO (SEED)
-- ================================================================
-- COMO USAR:
-- 1. Rode antes o supabase_migration.sql (cria as tabelas).
-- 2. No app, crie UMA conta de ANFITRIÃO (tipo "host").
-- 3. Cole e execute este arquivo no Supabase SQL Editor.
--    Ele anexa os imóveis de exemplo ao host mais recente.
-- ================================================================

DO $$
DECLARE
  v_host uuid;
  v_prop uuid;
  v_wifi uuid;
  v_mobiliado uuid;
  v_ar uuid;
  v_cozinha uuid;
BEGIN
  -- Pega o anfitrião mais recente
  SELECT id INTO v_host FROM profiles WHERE user_type = 'host' ORDER BY created_at DESC LIMIT 1;

  IF v_host IS NULL THEN
    RAISE EXCEPTION 'Nenhum anfitrião encontrado. Crie uma conta tipo "host" no app primeiro.';
  END IF;

  -- IDs de algumas comodidades (criadas na migration)
  SELECT id INTO v_wifi       FROM amenities WHERE name = 'Wi-Fi' LIMIT 1;
  SELECT id INTO v_mobiliado  FROM amenities WHERE name = 'Mobiliado' LIMIT 1;
  SELECT id INTO v_ar         FROM amenities WHERE name = 'Ar-condicionado' LIMIT 1;
  SELECT id INTO v_cozinha    FROM amenities WHERE name = 'Cozinha equipada' LIMIT 1;

  -- ---- Imóvel 1 ----
  INSERT INTO properties (host_id, title, description, type, city, state, neighborhood, price_per_month, min_stay_months, max_guests, rules, average_rating, review_count)
  VALUES (v_host, 'Quarto aconchegante perto da Univates', 'Quarto individual mobiliado a 10 min do campus. Ambiente tranquilo, ideal para focar nos estudos. Internet rápida inclusa.', 'room', 'Lajeado', 'RS', 'Universitário', 850, 6, 1, 'Não é permitido fumar. Silêncio após 22h.', 4.8, 12)
  RETURNING id INTO v_prop;
  INSERT INTO property_photos (property_id, url, is_cover, order_index) VALUES
    (v_prop, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', true, 0),
    (v_prop, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', false, 1);
  INSERT INTO property_amenities (property_id, amenity_id) VALUES (v_prop, v_wifi), (v_prop, v_mobiliado);

  -- ---- Imóvel 2 ----
  INSERT INTO properties (host_id, title, description, type, city, state, neighborhood, price_per_month, min_stay_months, max_guests, rules, average_rating, review_count)
  VALUES (v_host, 'Kitnet completa no Centro', 'Kitnet mobiliada com cozinha equipada e banheiro privativo. Próxima a mercados, farmácia e ponto de ônibus.', 'studio', 'Lajeado', 'RS', 'Centro', 1200, 6, 1, 'Aceita-se 1 pessoa. Animais sob consulta.', 4.6, 8)
  RETURNING id INTO v_prop;
  INSERT INTO property_photos (property_id, url, is_cover, order_index) VALUES
    (v_prop, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80', true, 0),
    (v_prop, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', false, 1);
  INSERT INTO property_amenities (property_id, amenity_id) VALUES (v_prop, v_wifi), (v_prop, v_mobiliado), (v_prop, v_cozinha);

  -- ---- Imóvel 3 ----
  INSERT INTO properties (host_id, title, description, type, city, state, neighborhood, price_per_month, min_stay_months, max_guests, rules, average_rating, review_count)
  VALUES (v_host, 'República universitária descolada', 'Vaga em república com 4 estudantes. Espaço compartilhado com sala de estudos, churrasqueira e Wi-Fi. Ambiente colaborativo.', 'republic', 'Lajeado', 'RS', 'Florestal', 650, 3, 4, 'Limpeza compartilhada por escala. Visitas até 23h.', 4.9, 21)
  RETURNING id INTO v_prop;
  INSERT INTO property_photos (property_id, url, is_cover, order_index) VALUES
    (v_prop, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80', true, 0),
    (v_prop, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80', false, 1);
  INSERT INTO property_amenities (property_id, amenity_id) VALUES (v_prop, v_wifi), (v_prop, v_cozinha);

  -- ---- Imóvel 4 ----
  INSERT INTO properties (host_id, title, description, type, city, state, neighborhood, price_per_month, min_stay_months, max_guests, rules, average_rating, review_count)
  VALUES (v_host, 'Apartamento 2 quartos para dividir', 'Apartamento amplo e iluminado, perfeito para dividir entre estudantes. Mobiliado, com ar-condicionado e garagem.', 'apartment', 'Porto Alegre', 'RS', 'Cidade Baixa', 1800, 12, 2, 'Contrato mínimo de 12 meses.', 4.7, 15)
  RETURNING id INTO v_prop;
  INSERT INTO property_photos (property_id, url, is_cover, order_index) VALUES
    (v_prop, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', true, 0),
    (v_prop, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80', false, 1);
  INSERT INTO property_amenities (property_id, amenity_id) VALUES (v_prop, v_wifi), (v_prop, v_mobiliado), (v_prop, v_ar);

  -- ---- Imóvel 5 ----
  INSERT INTO properties (host_id, title, description, type, city, state, neighborhood, price_per_month, min_stay_months, max_guests, rules, average_rating, review_count)
  VALUES (v_host, 'Studio moderno mobiliado', 'Studio novo, totalmente mobiliado, com cama box, escrivaninha e cozinha compacta. Pronto para morar.', 'studio', 'Lajeado', 'RS', 'Hidráulica', 1100, 6, 1, 'Sem festas. Conta de luz por conta do inquilino.', 4.5, 6)
  RETURNING id INTO v_prop;
  INSERT INTO property_photos (property_id, url, is_cover, order_index) VALUES
    (v_prop, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80', true, 0),
    (v_prop, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80', false, 1);
  INSERT INTO property_amenities (property_id, amenity_id) VALUES (v_prop, v_wifi), (v_prop, v_mobiliado);

  -- ---- Imóvel 6 ----
  INSERT INTO properties (host_id, title, description, type, city, state, neighborhood, price_per_month, min_stay_months, max_guests, rules, average_rating, review_count)
  VALUES (v_host, 'Quarto com banheiro privativo', 'Quarto suíte em casa de família, com entrada independente. Café da manhã incluso. Bairro seguro e arborizado.', 'room', 'Lajeado', 'RS', 'Moinhos', 950, 6, 1, 'Ambiente familiar. Não fumantes.', 4.9, 18)
  RETURNING id INTO v_prop;
  INSERT INTO property_photos (property_id, url, is_cover, order_index) VALUES
    (v_prop, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', true, 0),
    (v_prop, 'https://images.unsplash.com/photo-1560185009-dddeb820c7b7?w=800&q=80', false, 1);
  INSERT INTO property_amenities (property_id, amenity_id) VALUES (v_prop, v_wifi), (v_prop, v_mobiliado), (v_prop, v_ar);

  RAISE NOTICE 'Seed concluído: 6 imóveis criados para o host %', v_host;
END $$;
