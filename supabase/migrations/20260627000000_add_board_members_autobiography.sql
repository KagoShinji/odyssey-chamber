-- Migration: Add autobiography column to board_members table
ALTER TABLE public.board_members ADD COLUMN IF NOT EXISTS autobiography text;
