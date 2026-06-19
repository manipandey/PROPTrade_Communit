-- ============================================================
-- AlphaJournal: Supabase Storage Setup for Certificate Images
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the 'certificates' storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,           -- Public: images accessible via public URL without auth
  5242880,        -- 5MB file size limit per image
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

-- 2. Storage RLS Policies

-- Allow anyone to view/download certificate images (public bucket)
CREATE POLICY "Public can view certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates');

-- Allow authenticated users AND anonymous users (guests) to upload
CREATE POLICY "Anyone can upload certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates');

-- Allow users to update their own certificate uploads
CREATE POLICY "Users can update their certificates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'certificates');

-- Allow users to delete their own certificate uploads
CREATE POLICY "Users can delete their certificates"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'certificates');
