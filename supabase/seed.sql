-- Sample seed contestants for testing & immediate verification
INSERT INTO public.participants (reg_id, full_name, email, dob, gender, mobile, whatsapp, city, category, height, instagram, experience, total_fee, amount_paid, balance_due, status)
VALUES
    ('SC-2026-1001', 'Ananya Sharma', 'ananya.sharma@example.com', '14-07-2002', 'Female', '+919840123456', '+919840123456', 'Chennai', 'Runway Model', '5ft 9in', '@ananya_runway', 'Walked in Chennai Fashion Week 2025', 5000.00, 5000.00, 0.00, 'FULLY_PAID'),
    ('SC-2026-1002', 'Rohan Verma', 'rohan.v@example.com', '22-11-2001', 'Male', '+919712345678', '+919712345678', 'Bengaluru', 'Runway Model', '6ft 1in', '@rohan_v_style', 'College pageant winner', 5000.00, 2000.00, 3000.00, 'PARTIALLY_PAID'),
    ('SC-2026-1003', 'Meera Krishnan', 'meera.krish@example.com', '05-03-2003', 'Female', '+919445123987', '+919445123987', 'Coimbatore', 'Teen / Fresher Runway', '5ft 7in', '@meera.k_fashion', 'Fresher looking for first runway launch', 5000.00, 0.00, 5000.00, 'PENDING_VERIFICATION')
ON CONFLICT (reg_id) DO NOTHING;

-- Seed payments for contestants
INSERT INTO public.payments (payment_id, participant_id, reg_id, payment_type, amount, transaction_id, r2_object_key, file_mime, file_size, status, verified_by, verified_at)
SELECT 
    'PAY-REG-1001A', id, 'SC-2026-1001', 'INITIAL_REGISTRATION', 2500.00, 'UPI/428901823901', 'proofs/seed_sample_1.png', 'image/png', 84304, 'VERIFIED', 'Admin', NOW()
FROM public.participants WHERE reg_id = 'SC-2026-1001'
ON CONFLICT (payment_id) DO NOTHING;

INSERT INTO public.payments (payment_id, participant_id, reg_id, payment_type, amount, transaction_id, r2_object_key, file_mime, file_size, status, verified_by, verified_at)
SELECT 
    'PAY-BAL-1001B', id, 'SC-2026-1001', 'BALANCE_PAYMENT', 2500.00, 'UPI/428999482103', 'proofs/seed_sample_2.png', 'image/png', 84304, 'VERIFIED', 'Admin', NOW()
FROM public.participants WHERE reg_id = 'SC-2026-1001'
ON CONFLICT (payment_id) DO NOTHING;

INSERT INTO public.payments (payment_id, participant_id, reg_id, payment_type, amount, transaction_id, r2_object_key, file_mime, file_size, status, verified_by, verified_at)
SELECT 
    'PAY-REG-1002A', id, 'SC-2026-1002', 'INITIAL_REGISTRATION', 2000.00, 'UPI/429103948572', 'proofs/seed_sample_3.png', 'image/png', 84304, 'VERIFIED', 'Admin', NOW()
FROM public.participants WHERE reg_id = 'SC-2026-1002'
ON CONFLICT (payment_id) DO NOTHING;

INSERT INTO public.payments (payment_id, participant_id, reg_id, payment_type, amount, transaction_id, r2_object_key, file_mime, file_size, status)
SELECT 
    'PAY-REG-1003A', id, 'SC-2026-1003', 'INITIAL_REGISTRATION', 1500.00, 'UPI/430019283741', 'proofs/seed_sample_4.png', 'image/png', 84304, 'PENDING'
FROM public.participants WHERE reg_id = 'SC-2026-1003'
ON CONFLICT (payment_id) DO NOTHING;
