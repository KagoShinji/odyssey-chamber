-- Migration: Add admin_delete_user RPC function
-- Date: 2026-06-24
-- This creates a security-definer function that allows the admin to delete
-- a user from auth.users (which cascades to profiles, applications, registrations).

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow execution by users who have 'admin' role in profiles
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Access denied: Only admins can delete users.';
  END IF;

  -- Prevent admin from deleting themselves
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own account.';
  END IF;

  -- Delete from auth.users — cascades to profiles, membership_applications, event_registrations
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Grant execute to authenticated users (the function itself enforces admin-only)
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
