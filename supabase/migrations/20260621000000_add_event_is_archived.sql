-- Migration: Add is_archived column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_archived boolean default false not null;
