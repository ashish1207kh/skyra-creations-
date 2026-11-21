# SKYRA CREATIONS — Production Database Schema Specification

## 1. Overview

This document specifies the database collections, schemas, validation rules, indexes, and encryption requirements for the MongoDB Atlas database (`skyra_production`).

---

## 2. Collection: `registrations`

Stores contestant registrations with field-level encryption for sensitive PII.

```json
{
  "_id": { "$type": "objectId" },
  "reg_id": { "$type": "string", "description": "Human-readable ID e.g. SC-2026-1001" },
  "event_id": { "$type": "string", "description": "Bound event ID e.g. EVT-CHX-2026" },
  "full_name": { "$type": "string" },
  "email": { "$type": "string" },
  "email_blind_index": { "$type": "string", "description": "HMAC-SHA256 for exact query search" },
  "dob_encrypted": { "$type": "string", "description": "AES-256-GCM encrypted date of birth" },
  "gender": { "enum": ["Female", "Male", "Non-binary", "Other"] },
  "mobile_encrypted": { "$type": "string", "description": "AES-256-GCM encrypted mobile number" },
  "phone_blind_index": { "$type": "string", "description": "HMAC-SHA256 for exact search" },
  "whatsapp_encrypted": { "$type": "string", "description": "AES-256-GCM encrypted WhatsApp" },
  "whatsapp_blind_index": { "$type": "string", "description": "HMAC-SHA256 for exact search" },
  "city": { "$type": "string" },
  "category": { "$type": "string" },
  "height": { "$type": ["string", "null"] },
  "instagram": { "$type": ["string", "null"] },
  "experience": { "$type": ["string", "null"] },
  "total_fee": { "$type": "number", "minimum": 0 },
  "amount_paid": { "$type": "number", "minimum": 0 },
  "balance_due": { "$type": "number", "minimum": 0 },
  "status": { "enum": ["PENDING_VERIFICATION", "PARTIALLY_PAID", "FULLY_PAID", "REJECTED"] },
  "pass_token": { "$type": ["string", "null"] },
  "created_at": { "$type": "string" },
  "updated_at": { "$type": "string" }
}
```

### Required Indexes:
- `{ reg_id: 1 }` (Unique)
- `{ phone_blind_index: 1 }`
- `{ email_blind_index: 1 }`
- `{ status: 1 }`
- `{ event_id: 1 }`
- `{ created_at: -1 }`

---

## 3. Collection: `payments`

Stores initial registration advances and balance installment payments.

```json
{
  "_id": { "$type": "objectId" },
  "payment_id": { "$type": "string", "description": "Unique UUID e.g. pay_9f8a..." },
  "reg_id": { "$type": "string" },
  "event_id": { "$type": "string" },
  "payment_type": { "enum": ["INITIAL_REGISTRATION", "BALANCE_PAYMENT"] },
  "amount": { "$type": "number", "minimum": 1 },
  "transaction_id": { "$type": "string", "description": "UPI UTR or bank reference" },
  "r2_object_key": { "$type": "string", "description": "Private Cloudflare R2 screenshot path" },
  "status": { "enum": ["PENDING", "VERIFIED", "REJECTED"] },
  "rejection_reason": { "$type": ["string", "null"] },
  "verified_by": { "$type": ["string", "null"] },
  "verified_at": { "$type": ["string", "null"] },
  "created_at": { "$type": "string" }
}
```

### Required Indexes:
- `{ payment_id: 1 }` (Unique)
- `{ reg_id: 1 }`
- `{ transaction_id: 1 }` (Sparse unique per event)
- `{ status: 1 }`

---

## 4. Collection: `events`

Stores multi-event tenancy specifications.

```json
{
  "_id": { "$type": "objectId" },
  "event_id": { "$type": "string", "description": "e.g. EVT-CHX-2026" },
  "title": { "$type": "string" },
  "status": { "enum": ["DRAFT", "ACTIVE", "REGISTRATION_CLOSED", "COMPLETED", "ARCHIVED", "TRASHED", "DELETION_PENDING"] },
  "location": { "$type": "string" },
  "event_date": { "$type": "string" },
  "registration_deadline": { "$type": "string" },
  "created_at": { "$type": "string" },
  "updated_at": { "$type": "string" }
}
```

---

## 5. Collection: `audit_logs`

Append-only immutable record of all administrative, financial, and deletion actions.

```json
{
  "_id": { "$type": "objectId" },
  "action": { "$type": "string" },
  "performed_by": { "$type": "string" },
  "details": { "$type": "object" },
  "ip_address": { "$type": "string" },
  "timestamp": { "$type": "string" }
}
```
