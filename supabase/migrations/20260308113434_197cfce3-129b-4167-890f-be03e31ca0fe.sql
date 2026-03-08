CREATE POLICY "Students can view faculty"
ON public.users
FOR SELECT
TO authenticated
USING (
  role = 'faculty' AND get_user_role(auth.uid()) = 'student'::app_role
);