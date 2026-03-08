
-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Trigger: notify faculty when a student sends a guide request
CREATE OR REPLACE FUNCTION public.notify_faculty_on_request()
RETURNS TRIGGER AS $$
DECLARE
  student_name TEXT;
  project_title TEXT;
BEGIN
  SELECT name INTO student_name FROM public.users WHERE id = NEW.student_id;
  SELECT title INTO project_title FROM public.projects WHERE id = NEW.project_id;

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.faculty_id,
    'New Guide Request',
    'Student ' || COALESCE(student_name, 'Unknown') || ' has requested your guidance for project "' || COALESCE(project_title, 'Untitled') || '".',
    'request_sent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_guide_request_sent
AFTER INSERT ON public.guide_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_faculty_on_request();
