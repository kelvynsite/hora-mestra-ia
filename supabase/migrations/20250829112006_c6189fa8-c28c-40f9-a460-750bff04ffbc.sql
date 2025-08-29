-- Fix critical security issue: Implement proper RLS policies for school schedule system
-- Currently all tables are publicly accessible with USING (true) - this is a major security risk

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow full access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow full access to classes" ON public.classes;
DROP POLICY IF EXISTS "Allow full access to schedules" ON public.schedules;
DROP POLICY IF EXISTS "Allow full access to schedule_entries" ON public.schedule_entries;
DROP POLICY IF EXISTS "Allow full access to schedule_configs" ON public.schedule_configs;

-- TEACHERS TABLE: Only authenticated users can manage teachers
-- Read access: Authenticated users can view all teachers (needed for schedule generation)
CREATE POLICY "Authenticated users can view teachers" 
ON public.teachers 
FOR SELECT 
TO authenticated 
USING (true);

-- Write access: Only authenticated users can manage teachers (school admin functionality)
CREATE POLICY "Authenticated users can insert teachers" 
ON public.teachers 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update teachers" 
ON public.teachers 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete teachers" 
ON public.teachers 
FOR DELETE 
TO authenticated 
USING (true);

-- CLASSES TABLE: Only authenticated users can manage classes
CREATE POLICY "Authenticated users can view classes" 
ON public.classes 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert classes" 
ON public.classes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update classes" 
ON public.classes 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete classes" 
ON public.classes 
FOR DELETE 
TO authenticated 
USING (true);

-- SCHEDULES TABLE: Only authenticated users can manage schedules
-- Public read access for viewing published schedules (common requirement for schools)
CREATE POLICY "Anyone can view published schedules" 
ON public.schedules 
FOR SELECT 
USING (status = 'active');

-- Only authenticated users can manage schedules
CREATE POLICY "Authenticated users can insert schedules" 
ON public.schedules 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update schedules" 
ON public.schedules 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete schedules" 
ON public.schedules 
FOR DELETE 
TO authenticated 
USING (true);

-- SCHEDULE_ENTRIES TABLE: Public read for active schedules, authenticated write
CREATE POLICY "Anyone can view schedule entries for active schedules" 
ON public.schedule_entries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.schedules 
    WHERE schedules.id = schedule_entries.schedule_id 
    AND schedules.status = 'active'
  )
);

CREATE POLICY "Authenticated users can insert schedule entries" 
ON public.schedule_entries 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update schedule entries" 
ON public.schedule_entries 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete schedule entries" 
ON public.schedule_entries 
FOR DELETE 
TO authenticated 
USING (true);

-- SCHEDULE_CONFIGS TABLE: Only authenticated users can manage configurations
CREATE POLICY "Authenticated users can view schedule configs" 
ON public.schedule_configs 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert schedule configs" 
ON public.schedule_configs 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update schedule configs" 
ON public.schedule_configs 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete schedule configs" 
ON public.schedule_configs 
FOR DELETE 
TO authenticated 
USING (true);