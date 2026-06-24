-- Migration: Add user_id and status columns to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved' CHECK (status in ('pending', 'approved', 'rejected'));

-- Update RLS Policies for news table
DROP POLICY IF EXISTS "News is viewable by everyone" ON public.news;
DROP POLICY IF EXISTS "News is manageable by admins only" ON public.news;

-- 1. Select: Everyone sees approved posts. Owners and admins can see pending/rejected ones.
CREATE POLICY "Viewable approved news by everyone, pending/rejected by owner or admin"
  ON public.news FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR is_admin());

-- 2. Insert: Authenticated members can insert their own pending posts. Admins can insert any.
CREATE POLICY "Members can submit pending news, admins can insert any"
  ON public.news FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id AND status = 'pending') OR is_admin());

-- 3. Update: Owners can update their pending posts. Admins can update any.
CREATE POLICY "Members can update their pending news, admins can update any"
  ON public.news FOR UPDATE
  TO authenticated
  USING ((auth.uid() = user_id AND status = 'pending') OR is_admin())
  WITH CHECK ((auth.uid() = user_id AND status = 'pending') OR is_admin());

-- 4. Delete: Owners can delete their pending posts. Admins can delete any.
CREATE POLICY "Members can delete their pending news, admins can delete any"
  ON public.news FOR DELETE
  TO authenticated
  USING ((auth.uid() = user_id AND status = 'pending') OR is_admin());
