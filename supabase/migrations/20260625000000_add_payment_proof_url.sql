-- Migration: Add payment_proof_url column to membership_applications and event_registrations
-- Date: 2026-06-25

ALTER TABLE public.membership_applications ADD COLUMN IF NOT EXISTS payment_proof_url text DEFAULT null;
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS payment_proof_url text DEFAULT null;
