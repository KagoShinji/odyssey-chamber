-- Migration: Rename membership plans display names in membership_pricing table
UPDATE public.membership_pricing SET name = 'Small', benefits = array['Networking access', 'Event invitations', 'Member directory listing'] WHERE type = 'individual';
UPDATE public.membership_pricing SET name = 'Medium', benefits = array['All Small benefits', 'Business promotion', 'Training & seminars access', 'Priority support'] WHERE type = 'sme';
UPDATE public.membership_pricing SET name = 'Large', benefits = array['All Medium benefits', 'Board meeting access', 'Co-branding rights', 'VIP event seating'] WHERE type = 'corporate';
