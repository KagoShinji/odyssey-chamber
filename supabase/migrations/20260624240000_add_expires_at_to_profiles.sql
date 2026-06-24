-- Migration: Add expires_at column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone default null;
