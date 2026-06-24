-- Migration: Add invoice_number column to membership_applications table
ALTER TABLE public.membership_applications ADD COLUMN IF NOT EXISTS invoice_number text DEFAULT null;
