-- Create doctor-assets bucket for image uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'doctor-assets',
  'doctor-assets',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read (public bucket)
CREATE POLICY "Public read doctor-assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctor-assets');

-- Allow authenticated users to upload
CREATE POLICY "Auth upload doctor-assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'doctor-assets');

-- Allow authenticated users to update/delete their own
CREATE POLICY "Auth update doctor-assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'doctor-assets');

CREATE POLICY "Auth delete doctor-assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'doctor-assets');
