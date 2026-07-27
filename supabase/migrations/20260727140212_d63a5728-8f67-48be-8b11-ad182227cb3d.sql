-- The previous version passed four values into three columns, so the trigger
-- raised "INSERT has more expressions than target columns" on every auth.users
-- insert. GoTrue surfaced that as an opaque 500, breaking all sign-ups and the
-- member account claim flow. Same name derivation, correct arity.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  full_name text := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    ''
  );
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'first_name', ''),
      NULLIF(split_part(full_name, ' ', 1), ''),
      ''
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'last_name', ''),
      NULLIF(substr(full_name, NULLIF(strpos(full_name, ' '), 0) + 1), ''),
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;