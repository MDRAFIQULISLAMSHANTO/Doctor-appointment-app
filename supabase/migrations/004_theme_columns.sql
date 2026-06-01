-- White-label theme columns for doctors
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#14967F';
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS stats jsonb;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS services text[];
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS hours jsonb;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}';
