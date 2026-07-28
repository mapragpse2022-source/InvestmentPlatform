# Digital Investment Platform - Deposit System

| Field | Value |
|--------|--------|
| Document ID | FIN-002 |
| Version | 1.0.0 |
| Status | Draft |
| Owner | Financial Architecture Team |
| Last Updated | July 2026 |

---

## Depends On

- FIN-000 Financial Model Documentation
- FIN-001 Investment Rules
- PRODUCT-001 Product Requirements
- PRODUCT-004 Business Rules

---

## Used By

- Blockchain Integration Service
- Backend Team
- Database Team
- Financial Operations Team
- Security Team
- QA Team
- AI Coding Agents

---

## Related Documents

- FIN-003 Profit Calculation
- FIN-004 Withdrawal Rules
- ARCH-003 Database Architecture
- ARCH-005 API Design
- SEC-005 API Security

---

# 1. Purpose

This document defines the deposit system of the Digital Investment Platform.

The deposit system manages receiving digital assets from users and converting confirmed blockchain transactions into platform financial records.

---

# 2. Deposit Philosophy

The deposit system must provide:

- Transparency
- Security
- Traceability
- Blockchain verification
- Duplicate prevention

Every deposit must have a complete lifecycle record.

---

# 3. Supported Asset

Initial supported asset:

USDT

---

# 4. Supported Network

Initial supported network:

BEP20

Blockchain:

BNB Smart Chain

---

# 5. Future Network Expansion

The architecture must support future networks:

Examples:

- ERC20
- TRC20
- Other supported blockchain networks

Network information must never be hardcoded.

---

# 6. Deposit Lifecycle

Deposit workflow:

```
User Request

↓

Deposit Address Assignment

↓

Blockchain Transaction

↓

Transaction Detection

↓

Blockchain Verification

↓

Confirmation Check

↓

Deposit Approval

↓

Balance Update

↓

Investment Eligibility
```

---

# 7. Deposit Address Management

The system must support:

- Wallet address assignment
- Network identification
- Address ownership tracking
- Deposit history

Each address must have:

- Blockchain network
- Address value
- Status
- Creation date

---

# 8. Deposit Transaction Model

Every blockchain transaction must create a transaction record.

Required information:

- Transaction hash
- Blockchain network
- Token address
- Sender address
- Receiver address
- Amount
- Timestamp
- Confirmation count
- Processing status

---

# 9. Transaction Status

Deposit transaction states:

## Detected

Blockchain transaction detected.

---

## Pending Verification

Transaction requires validation.

---

## Confirmed

Transaction successfully verified.

---

## Rejected

Transaction failed validation.

---

## Failed

Processing error occurred.

---

# 10. Blockchain Verification Rules

A deposit can only be approved when:

- Transaction exists on blockchain.
- Token contract is valid.
- Network matches expected network.
- Receiver address is correct.
- Amount is valid.
- Required confirmations are completed.

---

# 11. Duplicate Prevention

The system must prevent duplicate deposits.

Rules:

- Transaction hash must be unique.
- Same blockchain transaction cannot create multiple balances.
- Processing operations must be idempotent.

---

# 12. Balance Update Rules

User balance can only increase after:

- Successful blockchain verification.
- Deposit approval.
- Financial record creation.

---

# 13. Financial Record Requirements

Every deposit must create:

- Deposit record
- Transaction record
- Balance movement record
- Audit record

---

# 14. Security Requirements

The deposit system must protect against:

- Fake transactions
- Duplicate processing
- Invalid tokens
- Wrong networks
- Unauthorized balance changes

---

# 15. Administrative Operations

Authorized financial operators can:

- Review deposits
- View transaction details
- Investigate failed deposits
- Review blockchain information

Sensitive actions require audit logging.

---

# 16. Error Handling

The system must handle:

- Blockchain unavailable
- RPC failure
- Network delay
- Invalid transaction
- Verification timeout

Errors must not create incorrect financial records.

---

# 17. Reporting Requirements

The system should provide:

- Deposit history
- Pending deposits
- Failed deposits
- Blockchain transaction reports

---

# 18. Database Requirements

The system should maintain entities for:

- Deposit
- Blockchain Transaction
- Wallet Address
- Balance Movement
- Audit Record

---

# 19. AI Implementation Notes

AI coding assistants must:

- Never trust user-provided transaction screenshots.
- Always verify blockchain transactions.
- Preserve financial data integrity.
- Follow approved deposit workflows.

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
```
