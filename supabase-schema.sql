-- Crear tabla vehicles
CREATE TABLE public.vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  marca text NOT NULL,
  modelo text NOT NULL,
  anio integer NOT NULL,
  precio numeric NOT NULL,
  kilometraje integer NOT NULL,
  combustible text NOT NULL,
  transmision text NOT NULL,
  tipo text NOT NULL, -- 'Auto', 'Camioneta', 'Moto'
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'disponible', -- 'disponible' o 'vendido'
  otros text,
  dueno text,
  fotos text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública: Todos pueden ver los vehículos disponibles
CREATE POLICY "Lectura pública de vehículos disponibles"
  ON public.vehicles
  FOR SELECT
  USING (estado = 'disponible');

-- Política de lectura para administradores: Pueden ver todos
CREATE POLICY "Admins pueden ver todos los vehículos"
  ON public.vehicles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política de modificación: Solo administradores autenticados
CREATE POLICY "Admins pueden insertar"
  ON public.vehicles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins pueden actualizar"
  ON public.vehicles
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins pueden eliminar"
  ON public.vehicles
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Configurar Storage Bucket para fotos
insert into storage.buckets (id, name, public) values ('autos-fotos', 'autos-fotos', true);

create policy "Lectura pública de fotos"
  on storage.objects for select
  using ( bucket_id = 'autos-fotos' );

create policy "Admins pueden subir fotos"
  on storage.objects for insert
  with check ( bucket_id = 'autos-fotos' AND auth.role() = 'authenticated' );

create policy "Admins pueden eliminar fotos"
  on storage.objects for delete
  using ( bucket_id = 'autos-fotos' AND auth.role() = 'authenticated' );

-- Site Settings Table
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  banner_images text[] DEFAULT '{"/banner_ultimo.jpg"}',
  banner_autoplay boolean DEFAULT true
);

-- Ensure there is only ever one row (id=1)
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_single_row CHECK (id = 1);

-- Default settings
INSERT INTO public.site_settings (id, banner_images, banner_autoplay) VALUES (1, '{"/banner_ultimo.jpg"}', true) ON CONFLICT DO NOTHING;

-- Configurar RLS para site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins pueden actualizar settings"
  ON public.site_settings FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admins pueden insertar settings"
  ON public.site_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
