-- CareRelay launch hardening: canonical indexes, RLS coverage, and atomic SMS ingestion.

ALTER TABLE public.care_circles ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_appointments_appointment_at ON public.appointments(care_circle_id, appointment_at);
CREATE INDEX IF NOT EXISTS idx_inbound_messages_concern ON public.inbound_messages(care_circle_id, concern_flag);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON public.daily_summaries(care_circle_id, summary_date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_circle_status ON public.tasks(care_circle_id, status);
CREATE INDEX IF NOT EXISTS idx_supplies_circle_status ON public.supplies(care_circle_id, status);

ALTER TABLE public.care_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inbound messages viewable within circle" ON public.inbound_messages;
CREATE POLICY "Inbound messages viewable within circle"
  ON public.inbound_messages FOR SELECT
  USING (
    care_circle_id IN (
      SELECT id FROM public.care_circles WHERE owner_id = auth.uid()
      UNION
      SELECT care_circle_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Family members insertable by circle owner" ON public.family_members;
CREATE POLICY "Family members insertable by circle owner"
  ON public.family_members FOR INSERT
  WITH CHECK (care_circle_id IN (SELECT id FROM public.care_circles WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Family members updateable by circle owner" ON public.family_members;
CREATE POLICY "Family members updateable by circle owner"
  ON public.family_members FOR UPDATE
  USING (care_circle_id IN (SELECT id FROM public.care_circles WHERE owner_id = auth.uid()))
  WITH CHECK (care_circle_id IN (SELECT id FROM public.care_circles WHERE owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.create_inbound_message_with_linked_record(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inbound_id uuid;
  linked_id uuid;
  category text;
BEGIN
  category := COALESCE(payload->>'category', 'general_update');

  INSERT INTO public.inbound_messages (
    care_circle_id,
    family_member_id,
    sender_name,
    sender_phone,
    sender_phone_normalized,
    raw_body,
    cleaned_body,
    sms_keyword_used,
    category,
    confidence,
    concern_flag,
    matched_keywords,
    parsed_payload,
    source
  )
  VALUES (
    (payload->>'care_circle_id')::uuid,
    NULLIF(payload->>'family_member_id', '')::uuid,
    payload->>'sender_name',
    payload->>'sender_phone',
    payload->>'sender_phone_normalized',
    payload->>'raw_body',
    payload->>'cleaned_body',
    payload->>'sms_keyword_used',
    category,
    NULLIF(payload->>'confidence', '')::numeric,
    COALESCE((payload->>'concern_flag')::boolean, false),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(payload->'matched_keywords', '[]'::jsonb))),
    payload->'parsed_payload',
    COALESCE(payload->>'source', 'sms')
  )
  RETURNING id INTO inbound_id;

  IF category = 'medication' THEN
    INSERT INTO public.medication_logs (care_circle_id, inbound_message_id, confirmation_text, given_by)
    VALUES ((payload->>'care_circle_id')::uuid, inbound_id, COALESCE(payload->'parsed_payload'->>'confirmationText', payload->>'cleaned_body'), payload->>'family_member_id')
    RETURNING id INTO linked_id;
  ELSIF category = 'appointment' THEN
    INSERT INTO public.appointments (care_circle_id, inbound_message_id, title)
    VALUES ((payload->>'care_circle_id')::uuid, inbound_id, COALESCE(payload->'parsed_payload'->>'title', 'Appointment'))
    RETURNING id INTO linked_id;
  ELSIF category = 'task' THEN
    INSERT INTO public.tasks (care_circle_id, inbound_message_id, title, status)
    VALUES ((payload->>'care_circle_id')::uuid, inbound_id, COALESCE(payload->'parsed_payload'->>'title', 'Task'), 'open')
    RETURNING id INTO linked_id;
  ELSIF category = 'supply' THEN
    INSERT INTO public.supplies (care_circle_id, inbound_message_id, title, status)
    VALUES ((payload->>'care_circle_id')::uuid, inbound_id, COALESCE(payload->'parsed_payload'->>'item', 'Supply needed'), 'needed')
    RETURNING id INTO linked_id;
  ELSIF category = 'concern' THEN
    INSERT INTO public.concerns (care_circle_id, inbound_message_id, title, details, severity, status)
    VALUES ((payload->>'care_circle_id')::uuid, inbound_id, 'Concern Flagged', COALESCE(payload->'parsed_payload'->>'concernText', payload->>'cleaned_body'), 'family_review', 'open')
    RETURNING id INTO linked_id;
  END IF;

  RETURN jsonb_build_object('inboundMessageId', inbound_id, 'linkedRecordId', linked_id, 'category', category);
END;
$$;
