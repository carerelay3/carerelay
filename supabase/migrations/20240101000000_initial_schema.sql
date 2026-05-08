-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLE DEFINITIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  phone_normalized TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sms_keyword TEXT,
  shared_phone_number TEXT,
  demo_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS care_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  relationship TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  phone_normalized TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invite_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(care_circle_id, phone_normalized)
);

CREATE TABLE IF NOT EXISTS inbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_phone TEXT,
  sender_phone_normalized TEXT,
  raw_body TEXT NOT NULL,
  cleaned_body TEXT,
  sms_keyword_used TEXT,
  category TEXT,
  confidence NUMERIC,
  concern_flag BOOLEAN DEFAULT false,
  matched_keywords TEXT[],
  parsed_payload JSONB,
  source TEXT DEFAULT 'sms',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  inbound_message_id UUID REFERENCES inbound_messages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES family_members(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  inbound_message_id UUID REFERENCES inbound_messages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  details TEXT,
  appointment_at TIMESTAMPTZ,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  inbound_message_id UUID REFERENCES inbound_messages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'needed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  inbound_message_id UUID REFERENCES inbound_messages(id) ON DELETE SET NULL,
  medication_name TEXT,
  confirmation_text TEXT NOT NULL,
  given_by TEXT,
  logged_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  inbound_message_id UUID REFERENCES inbound_messages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  details TEXT,
  severity TEXT DEFAULT 'family_review',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  summary_text TEXT NOT NULL,
  source TEXT DEFAULT 'deterministic',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(care_circle_id, summary_date)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  type TEXT,
  title TEXT,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 2. INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_phone_normalized ON profiles(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_care_circles_owner ON care_circles(owner_id);
CREATE INDEX IF NOT EXISTS idx_care_circles_sms_keyword ON care_circles(sms_keyword);
CREATE INDEX IF NOT EXISTS idx_family_members_circle ON family_members(care_circle_id);
CREATE INDEX IF NOT EXISTS idx_family_members_phone_norm ON family_members(phone_normalized);
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_inbound_messages_circle ON inbound_messages(care_circle_id);
CREATE INDEX IF NOT EXISTS idx_inbound_messages_created ON inbound_messages(created_at);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by self" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles updateable by self" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "View care circles" ON care_circles FOR SELECT USING (owner_id = auth.uid() OR id IN (SELECT care_circle_id FROM family_members WHERE user_id = auth.uid()));
CREATE POLICY "Insert care circles" ON care_circles FOR INSERT WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);
CREATE POLICY "Update own care circles" ON care_circles FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Family members viewable within circle" ON family_members FOR SELECT USING (care_circle_id IN (SELECT id FROM care_circles WHERE owner_id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Messages viewable within circle" ON inbound_messages FOR SELECT USING (care_circle_id IN (SELECT id FROM care_circles WHERE owner_id = auth.uid() OR id IN (SELECT care_circle_id FROM family_members WHERE user_id = auth.uid())));