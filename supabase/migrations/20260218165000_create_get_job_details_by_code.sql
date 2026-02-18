CREATE OR REPLACE FUNCTION get_job_details_by_code(search_code text)
RETURNS TABLE (
  id uuid,
  code text,
  title text,
  description text,
  requirements text,
  benefits text,
  activities text,
  salary_range text,
  type text,
  city text,
  is_featured boolean,
  created_at timestamptz,
  user_id uuid,
  status text,
  company_name text,
  company_profile_header_color text,
  company_whatsapp text,
  company_id uuid
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.code,
    j.title,
    j.description,
    j.requirements,
    j.benefits,
    j.activities,
    j.salary, -- Note: Column name in jobs table is 'salary', mapped to salary_range in output
    j.employment_type::text, -- Cast to text to match return type
    j.city,
    j.is_featured,
    j.created_at,
    j.user_id,
    j.status,
    c.name as company_name,
    c.profile_header_color as company_profile_header_color,
    c.whatsapp as company_whatsapp,
    c.id as company_id
  FROM jobs j
  LEFT JOIN companies c ON j.user_id = c.owner_id
  WHERE 
    j.code ILIKE search_code 
    OR j.id::text ILIKE search_code || '%';
END;
$$;
