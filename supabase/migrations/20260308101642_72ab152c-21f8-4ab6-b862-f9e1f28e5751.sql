
-- Create enums
CREATE TYPE public.app_role AS ENUM ('student', 'faculty', 'coordinator', 'admin');
CREATE TYPE public.project_status AS ENUM ('draft', 'request_sent', 'assigned', 'completed');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Create users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  department TEXT,
  section TEXT,
  registration_number TEXT,
  faculty_id TEXT,
  expertise TEXT[],
  max_students INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  technologies TEXT[],
  status project_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guide_requests table
CREATE TABLE public.guide_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status request_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coordinator_sections table
CREATE TABLE public.coordinator_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coordinator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_projects_student_id ON public.projects(student_id);
CREATE INDEX idx_guide_requests_student_id ON public.guide_requests(student_id);
CREATE INDEX idx_guide_requests_faculty_id ON public.guide_requests(faculty_id);
CREATE INDEX idx_guide_requests_project_id ON public.guide_requests(project_id);
CREATE INDEX idx_assignments_student_id ON public.assignments(student_id);
CREATE INDEX idx_assignments_faculty_id ON public.assignments(faculty_id);
CREATE INDEX idx_assignments_project_id ON public.assignments(project_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_coordinator_sections_coordinator_id ON public.coordinator_sections(coordinator_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_sections ENABLE ROW LEVEL SECURITY;

-- Create role-checking security definer function
CREATE OR REPLACE FUNCTION public.get_user_role(_auth_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE auth_id = _auth_id LIMIT 1;
$$;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Coordinators can view users" ON public.users FOR SELECT USING (public.get_user_role(auth.uid()) = 'coordinator');
CREATE POLICY "Faculty can view students" ON public.users FOR SELECT USING (public.get_user_role(auth.uid()) = 'faculty');
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Projects policies
CREATE POLICY "Students can view own projects" ON public.projects FOR SELECT USING (student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Faculty can view assigned projects" ON public.projects FOR SELECT USING (
  id IN (SELECT project_id FROM public.guide_requests WHERE faculty_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);
CREATE POLICY "Coordinators can view all projects" ON public.projects FOR SELECT USING (public.get_user_role(auth.uid()) IN ('coordinator', 'admin'));
CREATE POLICY "Students can create projects" ON public.projects FOR INSERT WITH CHECK (student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Students can update own projects" ON public.projects FOR UPDATE USING (student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Guide requests policies
CREATE POLICY "Students can view own requests" ON public.guide_requests FOR SELECT USING (student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Faculty can view their requests" ON public.guide_requests FOR SELECT USING (faculty_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Coordinators can view all requests" ON public.guide_requests FOR SELECT USING (public.get_user_role(auth.uid()) IN ('coordinator', 'admin'));
CREATE POLICY "Students can create requests" ON public.guide_requests FOR INSERT WITH CHECK (student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Faculty can update request status" ON public.guide_requests FOR UPDATE USING (faculty_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Assignments policies
CREATE POLICY "Users can view own assignments" ON public.assignments FOR SELECT USING (
  student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR
  faculty_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY "Coordinators can view all assignments" ON public.assignments FOR SELECT USING (public.get_user_role(auth.uid()) IN ('coordinator', 'admin'));
CREATE POLICY "Authorized users can create assignments" ON public.assignments FOR INSERT WITH CHECK (
  public.get_user_role(auth.uid()) IN ('coordinator', 'admin', 'faculty')
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'coordinator', 'faculty'));

-- Coordinator sections policies
CREATE POLICY "Coordinators can view own sections" ON public.coordinator_sections FOR SELECT USING (coordinator_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "Admins can manage coordinator sections" ON public.coordinator_sections FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guide_requests_updated_at BEFORE UPDATE ON public.guide_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
