# SKYRA CREATIONS — Incident Response Plan & Runbook

## 1. Incident Severity Levels

| Level | Definition | Response Time | Action |
| :--- | :--- | :--- | :--- |
| **P1 — Critical** | Website completely down, registrations blocked, payments failing | $< 15$ mins | Immediate executive escalation, rollback deployment or trigger failover |
| **P2 — Major** | Admin verification portal inaccessible, payment proof uploads failing | $< 1$ hour | Rotate credentials, switch storage drivers |
| **P3 — Minor** | Transient rate limiting, individual image display glitch | $< 4$ hours | Inspect logs, tune rate limiting thresholds |

---

## 2. Emergency Contacts & Communication

- **Brand / Executive**: B. Sriram (Founder & CEO, SKYRA CREATIONS)
- **DevOps / Security**: Senior Deployment & Site Reliability Team
- **Official Instagram**: `@skyra_creations_`

---

## 3. Incident Execution Steps

1. **Triage**: Check `https://www.skyracreations.site/api/health` to confirm serverless and database status.
2. **Containment**: If an active attack or abnormal load is detected, enable Vercel Attack Challenge Mode (Under Attack Mode).
3. **Remediation**: Apply fix to local git repository, run `npm test` and `npm run build`, and push to GitHub `main`.
4. **Post-Mortem**: Document root cause, timeline, and permanent architectural remediation.
