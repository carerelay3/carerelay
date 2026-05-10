-- CareRelay MVP hardening: shared-number routing, linked records, indexes, and RLS.

ALTER TABLE public.care_circles ADD COLUMN IF NOT EXISTS sms_keyword text;
ALTER TABLE public.care_circles ADD COLUMN IF NOT EXISTS shared_phone_number text;
ALTER TABLE public.care_circles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS phone_normalized text;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS invite_status text DEFAULT 'pending';
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS permission_level text DEFAULT 'contributor';
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS sender_name text;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS sender_phone_normalized text;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS raw_body text;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS cleaned_body text;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS sms_keyword_used text;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS confidence numeric;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS matched_keywords text[];
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS parsed_payload jsonb;
ALTER TABLE public.inbound_messages ADD COLUMN IF NOT EXISTS source text DEFAULT 'sms';

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS inbound_message_id uuid REFERENCES public.inbound_messages(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES public.family_members(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS inbound_message_id uuid REFERENCES public.inbound_messages(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS appointment_at timestamptz;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status text DEFAULT 'upcoming';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.supplies ADD COLUMN IF NOT EXISTS inbound_message_id uuid REFERENCES public.inbound_messages(id) ON DELETE SET NULL;
ALTER TABLE public.supplies ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.supplies ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.supplies ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.medication_logs ADD COLUMN IF NOT EXISTS inbound_message_id uuid REFERENCES public.inbound_messages(id) ON DELETE SET NULL;
ALTER TABLE public.medication_logs ADD COLUMN IF NOT EXISTS given_by text;
ALTER TABLE public.medication_logs ADD COLUMN IF NOT EXISTS logged_at timestamptz DEFAULT now();
ALTER TABLE public.medication_logs ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.concerns ADD COLUMN IF NOT EXISTS inbound_message_id uuid REFERENCES public.inbound_messages(id) ON DELETE SET NULL;
ALTER TABLE public.concerns ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.concerns ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE public.concerns ADD COLUMN IF NOT EXISTS severity text DEFAULT 'family_review';
ALTER TABLE public.concerns ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE public.concerns ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.care_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id uuid REFERENCES public.care_circles(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  relationship text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_circle_id uuid REFERENCES public.care_circles(id) ON DELETE CASCADE NOT NULL,
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  type text,
  title text,
  body text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_care_circles_sms_keyword ON public.care_circles(sms_keyword);
CREATE INDEX IF NOT EXISTS idx_family_members_phone_normalized ON public.family_members(phone_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS idx_family_members_circle_phone_unique
  ON public.family_members(care_circle_id, phone_normalized)
  WHERE phone_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inbound_messages_status_concern ON public.inbound_messages(care_circle_id, concern_flag);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(care_circle_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_at ON public.appointments(care_circle_id, appointment_at);
CREATE INDEX IF NOT EXISTS idx_supplies_status ON public.supplies(care_circle_id, status);
CREATE INDEX IF NOT EXISTS idx_medication_logs_circle_created ON public.medication_logs(care_circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_concerns_status ON public.concerns(care_circle_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_circle_date ON public.daily_summaries(care_circle_id, summary_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_circle_created ON public.notifications(care_circle_id, created_at DESC);

ALTER TABLE public.care_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Care recipients viewable within circle" ON public.care_recipients;
CREATE POLICY "Care recipients viewable within circle"
  ON public.care_recipients FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Tasks viewable within circle" ON public.tasks;
CREATE POLICY "Tasks viewable within circle"
  ON public.tasks FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Appointments viewable within circle" ON public.appointments;
CREATE POLICY "Appointments viewable within circle"
  ON public.appointments FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Supplies viewable within circle" ON public.supplies;
CREATE POLICY "Supplies viewable within circle"
  ON public.supplies FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Medication logs viewable within circle" ON public.medication_logs;
CREATE POLICY "Medication logs viewable within circle"
  ON public.medication_logs FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Concerns viewable within circle" ON public.concerns;
CREATE POLICY "Concerns viewable within circle"
  ON public.concerns FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Daily summaries viewable within circle" ON public.daily_summaries;
CREATE POLICY "Daily summaries viewable within circle"
  ON public.daily_summaries FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Notifications viewable within circle" ON public.notifications;
CREATE POLICY "Notifications viewable within circle"
  ON public.notifications FOR SELECT
  USING (care_circle_id IN (SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()));
