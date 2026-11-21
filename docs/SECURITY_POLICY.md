# SKYRA CREATIONS — Production Security Policy & RBAC Matrix

## 1. Security Principles

1. **Principle of Least Privilege**: Staff accounts only receive permissions necessary for their immediate operational function.
2. **Zero Plaintext Sensitive PII at Rest**: Contestant phone numbers, WhatsApp contacts, and dates of birth are encrypted with AES-256-GCM.
3. **No Direct Database Exposure**: Browsers never communicate directly with MongoDB or Supabase. All writes and reads are mediated by serverless functions.
4. **Defense in Depth**: Every endpoint validates input with Zod schemas, enforces IP-based rate limiting, and sanitizes output data.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Feature / Operation | OWNER | ADMINISTRATOR | PAYMENT_VERIFICATION_STAFF | VIEWER | PUBLIC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Public Registration Portal | Yes | Yes | Yes | Yes | Yes |
| Lookup Own Pass by Reg ID / Phone | Yes | Yes | Yes | Yes | Yes (Sanitized) |
| Submit New Registration & Payment | Yes | Yes | Yes | Yes | Yes |
| Submit Balance Installment | Yes | Yes | Yes | Yes | Yes |
| View Dashboard Financial Aggregates | Yes | Yes | Yes | Yes | No |
| View Participant List | Yes (Full PII) | Yes (Full PII) | Yes (Masked PII) | Yes (Masked PII) | No |
| Verify / Reject Submitted Payments | Yes | Yes | Yes | No | No |
| Export Data (CSV / JSON / ZIP) | Yes | Yes | No | No | No |
| Upload Dynamic UPI QR Codes | Yes | Yes | No | No | No |
| Manage Administrator Accounts | Yes | No | No | No | No |
| Initiate Event Deletion (MFA Guard) | Yes | No | No | No | No |

---

## 3. PII Masking Standards

For staff with `PAYMENT_VERIFICATION_STAFF` or `VIEWER` roles, fields are dynamically masked before JSON serialization:
- **Mobile / WhatsApp**: `+9198****3210`
- **Email**: `ca****@example.com`
- **Date of Birth**: `**-**-****`

---

## 4. Rate Limiting & Abuse Prevention

- **Admin Login**: 5 attempts per IP per 60 seconds.
- **Registration Submission**: 10 submissions per IP per 60 seconds.
- **Balance Payment**: 10 submissions per IP per 60 seconds.
- **Status / Pass Lookup**: 20 requests per IP per 60 seconds.

---

## 5. Secret Key Rotation

The following secrets should be rotated every 90 days in Vercel:
- `ADMIN_SECRET_KEY`
- `ENCRYPTION_MASTER_KEY`
- `BLIND_INDEX_KEY`
- `R2_SECRET_ACCESS_KEY`
