CREATE OR REPLACE FUNCTION register_candidate(
  p_name text,
  p_email text,
  p_phone text,
  p_city text,
  p_state text,
  p_sex text,
  p_birth_date date,
  p_cargo_principal text,
  p_cargos_extras jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_candidate_id uuid;
BEGIN
  -- Check if candidate exists by email
  SELECT id INTO v_candidate_id
  FROM candidates
  WHERE email = p_email;

  IF v_candidate_id IS NOT NULL THEN
    -- Update existing candidate
    UPDATE candidates
    SET
      name = p_name,
      phone = p_phone,
      city = p_city,
      state = p_state,
      sex = p_sex,
      birth_date = p_birth_date,
      cargo_principal = p_cargo_principal,
      cargos_extras = p_cargos_extras,
      updated_at = now()
    WHERE id = v_candidate_id;
  ELSE
    -- Insert new candidate
    INSERT INTO candidates (
      name,
      email,
      phone,
      city,
      state,
      sex,
      birth_date,
      cargo_principal,
      cargos_extras
    ) VALUES (
      p_name,
      p_email,
      p_phone,
      p_city,
      p_state,
      p_sex,
      p_birth_date,
      p_cargo_principal,
      p_cargos_extras
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  RETURN v_candidate_id;
END;
$$;
