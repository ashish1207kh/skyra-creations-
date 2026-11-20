-- ==============================================================================
-- SKYRA CREATIONS — RUNWAY SHOW & BALANCE PLATFORM
-- Supabase PostgreSQL Schema with Row Level Security (RLS) & Audit Logging
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    dob VARCHAR(20) NOT NULL,
    gender VARCHAR(30) NOT NULL,
    mobile VARCHAR(25) NOT NULL,
    whatsapp VARCHAR(25) NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT 'Runway Model',
    height VARCHAR(30),
    instagram VARCHAR(150),
    experience TEXT,
    total_fee NUMERIC(10, 2) DEFAULT 5000.00,
    amount_paid NUMERIC(10, 2) DEFAULT 0.00,
    balance_due NUMERIC(10, 2) DEFAULT 5000.00,
    status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'PARTIALLY_PAID', 'FULLY_PAID', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_participants_reg_id ON public.participants (reg_id);
CREATE INDEX IF NOT EXISTS idx_participants_mobile ON public.participants (mobile);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants (email);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants (status);

-- 2. PAYMENTS TABLE (Linked to Cloudflare R2 Private Object Keys)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id VARCHAR(60) UNIQUE NOT NULL,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    reg_id VARCHAR(50) NOT NULL,
    payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('INITIAL_REGISTRATION', 'BALANCE_PAYMENT')),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    transaction_id VARCHAR(100) NOT NULL,
    r2_object_key VARCHAR(255) NOT NULL, -- Private Cloudflare R2 object key (random UUID)
    file_mime VARCHAR(50),
    file_size BIGINT,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    rejection_reason TEXT,
    verified_by VARCHAR(100),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_reg_id ON public.payments (reg_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_txn ON public.payments (transaction_id);

-- 3. AUDIT LOGS TABLE (For administrative tracking & payment verifications)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- 4. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('event_name', 'SKYRA CREATIONS - RUNWAY SHOW', 'Official Runway Show Event Title'),
    ('total_fee', '5000.00', 'Standard registration fee in INR'),
    ('upi_id', 'mr.death4646@oksbi', 'Google Pay / UPI VPA for payments'),
    ('upi_name', 'Sanjay Mass', 'Official account holder name on UPI'),
    ('whatsapp_support', '+919876543210', 'WhatsApp contact number for contestants')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_participants_updated_at ON public.participants;
CREATE TRIGGER trigger_participants_updated_at
    BEFORE UPDATE ON public.participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to recalculate participant finances when payments change
CREATE OR REPLACE FUNCTION recalculate_participant_balance(target_participant_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_fee NUMERIC(10, 2);
    v_verified_sum NUMERIC(10, 2);
    v_balance NUMERIC(10, 2);
    v_has_pending BOOLEAN;
    v_all_rejected BOOLEAN;
    v_new_status VARCHAR(50);
BEGIN
    SELECT total_fee INTO v_total_fee FROM public.participants WHERE id = target_participant_id;
    IF v_total_fee IS NULL THEN
        v_total_fee := 5000.00;
    END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_verified_sum 
    FROM public.payments 
    WHERE participant_id = target_participant_id AND status = 'VERIFIED';

    v_balance := GREATEST(0.00, v_total_fee - v_verified_sum);

    SELECT EXISTS(SELECT 1 FROM public.payments WHERE participant_id = target_participant_id AND status = 'PENDING') INTO v_has_pending;
    
    SELECT (COUNT(*) > 0 AND COUNT(*) = COUNT(*) FILTER (WHERE status = 'REJECTED')) INTO v_all_rejected
    FROM public.payments
    WHERE participant_id = target_participant_id;

    IF v_verified_sum >= v_total_fee THEN
        v_new_status := 'FULLY_PAID';
    ELSIF v_verified_sum > 0 THEN
        v_new_status := 'PARTIALLY_PAID';
    ELSIF v_all_rejected THEN
        v_new_status := 'REJECTED';
    ELSE
        v_new_status := 'PENDING_VERIFICATION';
    END IF;

    UPDATE public.participants
    SET 
        amount_paid = v_verified_sum,
        balance_due = v_balance,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = target_participant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 1. Participants RLS Policies
-- Allow public self-service lookup by reg_id, mobile, or email
CREATE POLICY "Public participant lookup" ON public.participants
    FOR SELECT
    USING (true);

-- Allow public registration submission
CREATE POLICY "Public participant insert" ON public.participants
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated admins full access
CREATE POLICY "Admin full access on participants" ON public.participants
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Payments RLS Policies
-- Allow public payment submissions
CREATE POLICY "Public payment insert" ON public.payments
    FOR INSERT
    WITH CHECK (true);

-- Allow public lookup of payments associated with their registration
CREATE POLICY "Public payment select for lookup" ON public.payments
    FOR SELECT
    USING (true);

-- Allow authenticated admins to view and verify payments
CREATE POLICY "Admin full access on payments" ON public.payments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Audit Logs RLS Policies
-- Only authenticated admins can read audit logs
CREATE POLICY "Admin select audit logs" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Service role / admins can insert audit logs
CREATE POLICY "Admin insert audit logs" ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. System Settings RLS Policies
-- Public can read event details
CREATE POLICY "Public read settings" ON public.system_settings
    FOR SELECT
    USING (true);

-- Only authenticated admins can modify event settings
CREATE POLICY "Admin update settings" ON public.system_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
