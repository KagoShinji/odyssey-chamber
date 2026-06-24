-- Migration: Add pending_changes and approval_status columns to business_directory table
ALTER TABLE public.business_directory ADD COLUMN IF NOT EXISTS pending_changes jsonb default null;
ALTER TABLE public.business_directory ADD COLUMN IF NOT EXISTS approval_status text default 'approved' check (approval_status in ('approved', 'pending_approval'));
