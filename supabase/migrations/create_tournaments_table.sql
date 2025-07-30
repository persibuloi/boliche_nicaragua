-- Create tournaments table
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  winner VARCHAR(255) NOT NULL,
  runner_up VARCHAR(255) NOT NULL,
  participants INTEGER NOT NULL CHECK (participants > 0),
  prize VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('profesional', 'amateur', 'juvenil', 'veteranos')),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for tournament images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tournament-images', 'tournament-images', true);

-- Create policy for tournament images bucket
CREATE POLICY "Tournament images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'tournament-images');

CREATE POLICY "Authenticated users can upload tournament images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tournament-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update tournament images" ON storage.objects
FOR UPDATE USING (bucket_id = 'tournament-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete tournament images" ON storage.objects
FOR DELETE USING (bucket_id = 'tournament-images' AND auth.role() = 'authenticated');

-- Create RLS policies for tournaments table
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active tournaments
CREATE POLICY "Anyone can view active tournaments" ON tournaments
FOR SELECT USING (is_active = true);

-- Allow authenticated users to view all tournaments
CREATE POLICY "Authenticated users can view all tournaments" ON tournaments
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert tournaments
CREATE POLICY "Authenticated users can insert tournaments" ON tournaments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update tournaments
CREATE POLICY "Authenticated users can update tournaments" ON tournaments
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete tournaments
CREATE POLICY "Authenticated users can delete tournaments" ON tournaments
FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO tournaments (title, date, location, description, winner, runner_up, participants, prize, category, images) VALUES
(
  'Torneo Nacional de Boliche 2024',
  '2024-03-15',
  'Centro de Boliche Managua',
  'El torneo más importante del año con participantes de todo el país. Una competencia que reunió a los mejores jugadores profesionales de Nicaragua.',
  'Carlos Mendoza',
  'Ana García',
  48,
  'C$ 50,000',
  'profesional',
  ARRAY[
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&sat=-50',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop'
  ]
),
(
  'Copa Juvenil 2024',
  '2024-02-20',
  'Boliche León',
  'Competencia dedicada a promover el talento joven en el boliche nicaragüense. Una oportunidad para que los nuevos talentos brillen.',
  'Miguel Rodríguez',
  'Sofia Martínez',
  32,
  'C$ 25,000',
  'juvenil',
  ARRAY[
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&hue=60'
  ]
),
(
  'Torneo de Veteranos',
  '2024-01-10',
  'Club Deportivo Granada',
  'Una celebración de la experiencia y maestría de los jugadores veteranos. Deporte, camaradería y tradición en una sola competencia.',
  'Roberto Flores',
  'María Elena Vásquez',
  24,
  'C$ 15,000',
  'veteranos',
  ARRAY[
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&hue=120',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&sat=-30'
  ]
);
