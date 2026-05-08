-- 1. Create Core Tables

CREATE TABLE IF NOT EXISTS public.care_circles (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Care Circle',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.members (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references public.care_circles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  role text default 'family',
  permission_level text default 'member',
  invite_status text default 'not_invited',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references public.care_circles(id) on delete cascade not null,
  sender text,
  from_phone text,
  to_phone text,
  body text not null,
  category text default 'general',
  confidence numeric,
  concern_flag boolean default false,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references public.care_circles(id) on delete cascade not null,
  title text not null,
  status text default 'open',
  assigned_to uuid references public.members(id) on delete set null,
  completed_by text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references public.care_circles(id) on delete cascade not null,
  title text not null,
  at timestamptz,
  transportation_confirmed boolean default false,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.supplies (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references public.care_circles(id) on delete cascade not null,
  item text not null,
  status text default 'needed',
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.concerns (
  id uuid primary key default gen_random_uuid(),
  care_circle_id uuid references public.care_circles(id) on delete cascade not null,
  notes text,
  status text default 'open',
  created_at timestamptz default now()
);

-- 2. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS members_care_circle_id_idx ON public.members(care_circle_id);
CREATE INDEX IF NOT EXISTS messages_care_circle_id_idx ON public.messages(care_circle_id);
CREATE INDEX IF NOT EXISTS tasks_care_circle_id_idx ON public.tasks(care_circle_id);
CREATE INDEX IF NOT EXISTS appointments_care_circle_id_idx ON public.appointments(care_circle_id);
CREATE INDEX IF NOT EXISTS supplies_care_circle_id_idx ON public.supplies(care_circle_id);
CREATE INDEX IF NOT EXISTS concerns_care_circle_id_idx ON public.concerns(care_circle_id);
CREATE INDEX IF NOT EXISTS members_user_id_idx ON public.members(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.care_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;

-- 4. Create Basic Access Policies
-- (This assumes users can only see records linked to care circles they are members of)

CREATE POLICY "Users can view their own care circles" 
ON public.care_circles FOR SELECT 
USING (id IN (SELECT care_circle_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view members of their care circles" 
ON public.members FOR SELECT 
USING (care_circle_id IN (SELECT care_circle_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view messages in their care circles" 
ON public.messages FOR SELECT 
USING (care_circle_id IN (SELECT care_circle_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view tasks in their care circles" 
ON public.tasks FOR ALL 
USING (care_circle_id IN (SELECT care_circle_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view appointments in their care circles" 
ON public.appointments FOR ALL 
USING (care_circle_id IN (SELECT care_circle_id FROM public.members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view supplies in their care circles" 
ON public.supplies FOR ALL 
USING (care_circle_id IN (SELECT care_circle_id FROM public.members WHERE user_id = auth.uid()));