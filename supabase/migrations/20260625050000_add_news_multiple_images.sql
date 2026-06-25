-- Migration: Add multiple images support to news articles
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

-- Backfill: populate images text array with existing image_url if present
UPDATE public.news 
SET images = ARRAY[image_url] 
WHERE (images IS NULL OR images = '{}'::text[]) AND image_url IS NOT NULL AND image_url <> '';
