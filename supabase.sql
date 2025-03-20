-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  user_type text CHECK (user_type IN ('hirer', 'virtual-assistant')),
  time_zone text,
  hourly_rate numeric,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone
);

-- Create jobs table
CREATE TABLE jobs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  assistant_type text NOT NULL,
  hourly_rate numeric NOT NULL,
  time_zone text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for jobs
CREATE POLICY "Hirers can insert their own jobs" 
  ON jobs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hirers can update their own jobs" 
  ON jobs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view jobs" 
  ON jobs FOR SELECT 
  USING (true);

-- Create a trigger to handle profile creation on user signup
CREATE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_type');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
