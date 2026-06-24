-- Migration: Add logo_url, facebook_url, instagram_url to business_directory
-- Date: 2026-06-24

ALTER TABLE public.business_directory
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT;
