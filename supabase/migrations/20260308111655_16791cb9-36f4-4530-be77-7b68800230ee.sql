CREATE POLICY "Coordinators can create projects for students"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (get_user_role(auth.uid()) = 'coordinator'::app_role);