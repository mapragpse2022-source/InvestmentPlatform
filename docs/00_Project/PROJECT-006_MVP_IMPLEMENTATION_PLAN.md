# Digital Investment Platform - MVP Implementation Plan

| Field | Value |
|--------|-------|
| Document ID | PROJECT-006 |
| Version | 1.0.0 |
| Status | Draft |
| Owner | Project Management and Engineering Teams |
| Last Updated | July 2026 |

---

## Depends On

- PROJECT-001 Project Overview
- PROJECT-004 Project Roadmap
- PRODUCT-001 Product Requirements
- ARCH-001 System Architecture
- ARCH-002 Backend Architecture
- ARCH-003 Database Architecture
- ARCH-005 API Design
- SEC-002 Authentication and Authorization

## Used By

- Product Owner
- Engineering Team
- QA Team
- DevOps Team
- Security Team

## Purpose

This document turns the Phase 1 roadmap into a small, testable MVP delivery sequence. It defines the initial scope, proposed technical baseline, acceptance criteria, and approval gates before implementation begins.

This plan does not approve the product, architecture, or financial model. It records the proposed implementation path so the required owners can review it before code is introduced.

---

# 1. Phase 1 MVP Scope

The first implementation milestone includes only the platform foundation:

- Versioned REST API foundation and health endpoint.
- User registration, login, logout, password hashing, and session or token management.
- Role-based access control for `user` and `admin` roles.
- User profile read and update flows.
- A user dashboard shell with non-financial placeholder summaries.
- An admin dashboard shell protected by the `admin` role.
- Audit events for authentication, authorization failures, and administrative actions.
- Local development environment with repeatable database and application startup.

The MVP must be safe to run without accepting or moving real funds.

---

# 2. Explicitly Out of Scope

The following remain Phase 2 or later work and must not be implemented in the first milestone:

- USDT or BEP20 wallet integration.
- Blockchain monitoring or deposit confirmation.
- Financial ledger entries or balance mutations.
- Withdrawal requests or payout processing.
- Profit calculation and investment-plan execution.
- Any production credential, private key, or real-money workflow.

---

# 3. Proposed Technical Baseline

| Area | Proposed choice | Rationale |
|------|-----------------|-----------|
| Backend | TypeScript with NestJS | Modular, API-first structure that fits the documented domain boundaries. |
| Frontend | TypeScript with Next.js | Supports an authenticated user interface and admin interface in one maintainable web application. |
| Database | PostgreSQL 16 with Prisma ORM | Relational integrity and explicit migrations suit future financial records. |
| API contract | REST with OpenAPI | Matches the API-first architecture and enables client and test generation later. |
| Local environment | Docker Compose | Makes application and database startup repeatable for every contributor. |
| Tests | Jest for unit and integration tests; Playwright later for end-to-end tests | Supports the testing strategy without introducing financial workflows prematurely. |
| Automation | GitHub Actions | Runs formatting, linting, tests, and migration validation on future changes. |

These are proposed choices, not approved architecture changes. Any approved alternative must update this document before implementation.

---

# 4. Delivery Sequence

## Step 1 - Technical Baseline

- Approve this MVP scope and proposed stack.
- Confirm the product, architecture, security, and financial documentation approval owners.
- Create the implementation backlog from the acceptance criteria below.

## Step 2 - Repository Bootstrap

- Create the frontend and backend applications.
- Add Docker Compose, environment templates, formatting, linting, and test commands.
- Add CI checks that run without secrets.

## Step 3 - Identity and User Foundation

- Implement the user, role, authentication, and audit data models.
- Implement registration, login, logout, and profile endpoints.
- Add authorization tests and audit-event tests.

## Step 4 - Dashboard Foundation

- Implement protected user and admin routes.
- Show profile data and explicitly non-financial dashboard placeholders.
- Add end-to-end tests for authentication and role separation.

## Step 5 - Release Readiness

- Review security controls, observability, backups, and operational runbooks.
- Confirm that no financial or blockchain capability is exposed.
- Obtain release approval for the non-financial MVP.

---

# 5. MVP Acceptance Criteria

The Phase 1 MVP is ready for review when:

- A new contributor can start the application and database from documented commands.
- The API exposes a versioned health endpoint and OpenAPI documentation.
- Users can register, authenticate, terminate a session, and manage their own profile.
- An unauthenticated user cannot access protected resources.
- A standard user cannot access admin resources.
- Authentication and administrative events create auditable records.
- Automated formatting, linting, and tests run in CI.
- No route can create a deposit, credit a balance, confirm a blockchain transaction, calculate profit, or request a withdrawal.

---

# 6. Approval Gate

Implementation may begin only after the following roles approve the relevant documents and this plan:

| Role | Required decision | Status |
|------|-------------------|--------|
| Product Owner | Confirm Phase 1 MVP scope | Pending |
| System Architect | Confirm technical baseline | Pending |
| Security Owner | Confirm authentication and audit constraints | Pending |
| Project Manager | Authorize Phase 1 start | Pending |

---

# AI Implementation Notes

AI coding assistants must follow this delivery sequence, keep financial workflows out of the Phase 1 codebase, and add or update tests and documentation with each implementation step.

---

# Revision History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | July 2026 | Initial MVP implementation plan. |
