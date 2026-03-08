
CREATE OR REPLACE FUNCTION public.auto_cancel_other_requests()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cancelled_faculty_id UUID;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Notify other faculty whose pending requests will be cancelled
    FOR cancelled_faculty_id IN
      SELECT faculty_id FROM public.guide_requests
      WHERE project_id = NEW.project_id
        AND id != NEW.id
        AND status = 'pending'
    LOOP
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (
        cancelled_faculty_id,
        'Project Request Cancelled',
        'This project has already been assigned to another faculty.',
        'request_cancelled'
      );
    END LOOP;

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
$function$;
