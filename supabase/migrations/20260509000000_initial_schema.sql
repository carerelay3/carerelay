-- Create care_circles table
CREATE TABLE IF NOT EXISTS care_circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    twilio_phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(care_circle_id, user_id)
);

-- Safety fallback: Add the user_id column if the table already existed without it
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create inbound_messages table
CREATE TABLE IF NOT EXISTS inbound_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    sender_phone TEXT,
    body TEXT NOT NULL,
    category TEXT,
    concern_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safety fallback: Add concern_flag if the table already existed without it
ALTER TABLE inbound_messages ADD COLUMN IF NOT EXISTS concern_flag BOOLEAN DEFAULT false;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    assignee TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    appointment_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create supplies table
CREATE TABLE IF NOT EXISTS supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'needed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    confirmation_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create daily_summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_circle_id UUID NOT NULL REFERENCES care_circles(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subscriptions table (for Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    plan TEXT NOT NULL DEFAULT 'starter',
    status TEXT NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inbound_messages_care_circle_id ON inbound_messages(care_circle_id);
CREATE INDEX IF NOT EXISTS idx_inbound_messages_created_at ON inbound_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbound_messages_concern_flag ON inbound_messages(care_circle_id) WHERE concern_flag = true;
CREATE INDEX IF NOT EXISTS idx_tasks_care_circle_id ON tasks(care_circle_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);