
-- Allow students to update their own guide requests (for cancellation)
CREATE POLICY "Students can update own requests"
ON public.guide_requests
FOR UPDATE
USING (student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
WITH CHECK (student_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Trigger: when a guide_request is accepted, auto-cancel all other pending requests for same project
CREATE OR REPLACE FUNCTION public.auto_cancel_other_requests()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Cancel all other pending requests for this project
    UPDATE public.guide_requests
    SET status = 'cancelled', updated_at = now()
    WHERE project_id = NEW.project_id
      AND id != NEW.id
      AND status = 'pending';

    -- Update project status to assigned
    UPDATE public.projects
    SET status = 'assigned', updated_at = now()
    WHERE id = NEW.project_id;

    -- Create assignment record
    INSERT INTO public.assignments (project_id, student_id, faculty_id, assigned_by)
    VALUES (NEW.project_id, NEW.student_id, NEW.faculty_id, NEW.faculty_id);

    -- Notify the student
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Request Accepted',
      'Your guide request has been accepted by a faculty member.',
      'request_accepted'
    );
  END IF;

  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Request Rejected',
      'A faculty member has declined your guide request.',
      'request_rejected'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_guide_request_status_change
AFTER UPDATE OF status ON public.guide_requests
FOR EACH ROW
EXECUTE FUNCTION public.auto_cancel_other_requests();

-- Update project status when a request is sent
CREATE OR REPLACE FUNCTION public.update_project_on_request()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET status = 'request_sent', updated_at = now()
  WHERE id = NEW.project_id AND status = 'draft';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_guide_request_created
AFTER INSERT ON public.guide_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_project_on_request();
