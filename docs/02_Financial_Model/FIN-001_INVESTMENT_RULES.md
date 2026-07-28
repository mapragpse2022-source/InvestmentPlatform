# Digital Investment Platform - Investment Rules

| Field | Value |
|--------|--------|
| Document ID | FIN-001 |
| Version | 1.0.0 |
| Status | Draft |
| Owner | Financial Architecture Team |
| Last Updated | July 2026 |

---

## Depends On

- PRODUCT-001 Product Requirements
- PRODUCT-004 Business Rules
- FIN-000 Financial Model Documentation

---

## Used By

- Financial Engine
- Backend Team
- Database Team
- Product Team
- QA Team
- AI Coding Agents

---

## Related Documents

- FIN-002 Deposit System
- FIN-003 Profit Calculation
- FIN-004 Withdrawal Rules
- FIN-005 Risk Disclosure

---

# 1. Purpose

This document defines the investment rules of the Digital Investment Platform.

It describes how user investments are created, managed and tracked throughout their lifecycle.

---

# 2. Investment Philosophy

The platform separates:

- User Deposits
- Investment Positions
- Financial Performance Records
- Withdrawal Operations

Each financial object must have its own independent record.

---

# 3. Investment Model

The platform uses an Investment Position model.

An Investment Position represents a user's participation in an approved investment program.

Each position contains:

- Investor
- Investment amount
- Creation date
- Investment plan
- Status
- Performance records

---

# 4. Investment Plan

Investment plans define available investment options.

Each plan may include:

- Plan name
- Minimum investment amount
- Maximum investment amount
- Duration
- Performance calculation rules
- Withdrawal conditions
- Risk information

---

# 5. Initial Investment Product

Initial platform investment product:

Name:

USDT Investment Plan

Asset:

USDT

Initial Network:

BEP20

---

# 6. Investment Creation Rules

An investment can only be created when:

- User account is active.
- Deposit is successfully confirmed.
- Required validations are completed.

---

# 7. Investment Lifecycle

Investment states:

## Pending

Investment request created but not activated.

---

## Active

Investment is currently running.

---

## Completed

Investment period has finished.

---

## Cancelled

Investment has been terminated according to platform rules.

---

# 8. Investment Amount Rules

The system must validate:

- Minimum allowed amount.
- Maximum allowed amount.
- User available balance.
- Investment eligibility.

---

# 9. Investment Performance

The platform must display:

- Initial investment amount.
- Current status.
- Recorded performance.
- Historical records.

Performance information must be transparent and traceable.

---

# 10. Profit Representation

The platform separates:

## Expected Performance

Estimated future performance according to the selected investment rules.

---

## Recorded Performance

Performance values that have already been calculated and recorded.

---

## Paid Performance

Amounts that have been processed according to withdrawal or payout rules.

---

# 11. Investment Security Rules

Investment records must:

- Be auditable.
- Maintain historical changes.
- Prevent unauthorized modification.

---

# 12. User Visibility Rules

Investors can view:

- Their own investments.
- Their own performance records.
- Their own transactions.

Investors cannot access other users' financial information.

---

# 13. Administrative Rules

Authorized administrators may:

- View investments.
- Manage investment plans.
- Review investment activity.

All sensitive actions require audit logging.

---

# 14. Future Expansion

The architecture should support:

- Multiple assets.
- Multiple blockchain networks.
- Different investment products.
- Institutional investment accounts.

---

# 15. AI Implementation Notes

AI coding assistants must:

- Never create financial logic outside approved rules.
- Preserve financial record integrity.
- Request documentation updates when rules change.

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0.0 | July 2026 | Initial version |

---

# Document Approval

| Role | Name | Status |
|------|------|--------|
| Project Manager | Pending | ⏳ |
| System Architect | Pending | ⏳ |
| Financial Owner | Pending | ⏳ |
