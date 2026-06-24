-- Migration: Add non-member price column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS non_member_price numeric default 0 not null check (non_member_price >= 0);
