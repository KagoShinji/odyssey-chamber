-- Migration: Add invoice_number column to event_registrations table
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS invoice_number text DEFAULT null;
