-- Migration: Secure profiles policies, admin_delete_user RPC, and storage bucket access controls
-- Date: 2026-06-25

-- 1. Restrict public.profiles select policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner or admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- 2. Restrict storage bucket permissions for chamber-assets to prevent arbitrary delete/update by any authenticated user
-- Update policy
DROP POLICY IF EXISTS "Authenticated Update Access on Chamber Assets" ON storage.objects;

CREATE POLICY "Authenticated Update Access on Chamber Assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  WITH CHECK (bucket_id = 'chamber-assets' AND (auth.uid() = owner OR public.is_admin()));

-- Delete policy
DROP POLICY IF EXISTS "Authenticated Delete Access on Chamber Assets" ON storage.objects;

CREATE POLICY "Authenticated Delete Access on Chamber Assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'chamber-assets' AND (auth.uid() = owner OR public.is_admin()));

-- 3. Patch admin_delete_user RPC function with proper public.is_admin() check
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow execution by admins
  IF NOT public.is_admin() THEN
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
