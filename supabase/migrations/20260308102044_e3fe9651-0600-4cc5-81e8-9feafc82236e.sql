
-- Allow newly registered users to insert their own profile
CREATE POLICY "Users can insert own profile on signup"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = auth_id AND role = 'student');
