-- Migration: Add image_path to items and create storage bucket for item-images

-- 1. Add image_path to items table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'items' 
                   AND column_name = 'image_path') THEN
        ALTER TABLE public.items ADD COLUMN image_path text;
    END IF;
END $$;

-- 2. Create the "item-images" storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage RLS policies for the "item-images" bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;



-- Multi-tenant Security: users can only modify and read files in their own business folder
-- Paths are formatted as: business_{businessId}/...
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can read their own business folder'
    ) THEN
        CREATE POLICY "Users can read their own business folder" 
        ON storage.objects FOR SELECT 
        USING (
            bucket_id = 'item-images' 
            AND auth.jwt() IS NOT NULL 
            AND split_part(name, '/', 1) IN (
                SELECT 'business_' || business_id::text 
                FROM public.users 
                WHERE id = auth.jwt() ->> 'sub'
            )
        );
    END IF;
END $$;
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload to their business folder'
    ) THEN
        CREATE POLICY "Users can upload to their business folder" 
        ON storage.objects FOR INSERT 
        WITH CHECK (
            bucket_id = 'item-images' 
            AND auth.jwt() IS NOT NULL 
            AND split_part(name, '/', 1) IN (
                SELECT 'business_' || business_id::text 
                FROM public.users 
                WHERE id = auth.jwt() ->> 'sub'
            )
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update their business folder'
    ) THEN
        CREATE POLICY "Users can update their business folder" 
        ON storage.objects FOR UPDATE 
        USING (
            bucket_id = 'item-images' 
            AND auth.jwt() IS NOT NULL 
            AND split_part(name, '/', 1) IN (
                SELECT 'business_' || business_id::text 
                FROM public.users 
                WHERE id = auth.jwt() ->> 'sub'
            )
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete from their business folder'
    ) THEN
        CREATE POLICY "Users can delete from their business folder" 
        ON storage.objects FOR DELETE 
        USING (
            bucket_id = 'item-images' 
            AND auth.jwt() IS NOT NULL 
            AND split_part(name, '/', 1) IN (
                SELECT 'business_' || business_id::text 
                FROM public.users 
                WHERE id = public.firebase_uid()
            )
        );
    END IF;
END $$;
