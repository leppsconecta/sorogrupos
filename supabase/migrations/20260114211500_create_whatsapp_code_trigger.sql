-- Function to handle new profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile_whatsapp_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.whatsapp_login_codes (user_id, phone, code)
  VALUES (
    NEW.id,
    COALESCE(NEW.whatsapp, ''), -- Use phone from profile if available, else empty
    'WAITING'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET phone = EXCLUDED.phone; -- Update phone if it already exists (redundancy check)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire after insert on profiles
DROP TRIGGER IF EXISTS on_profile_created_create_code ON public.profiles;
CREATE TRIGGER on_profile_created_create_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_whatsapp_code();

-- Backfill: Ensure existing users also have a code record
INSERT INTO public.whatsapp_login_codes (user_id, phone, code)
SELECT id, COALESCE(whatsapp, ''), 'WAITING'
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
