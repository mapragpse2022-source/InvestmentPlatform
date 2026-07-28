# Digital Investment Platform - Service Catalogue

| Field | Value |
|--------|--------|
| Document ID | OPS-008 |
| Version | 1.0.0 |
| Status | Draft |
| Owner | Operations Team |
| Last Updated | July 2026 |

---

## Depends On

- OPS-001 Operational Governance
- OPS-002 Service Monitoring
- OPS-006 Operational Runbooks
- OPS-007 SLA Management
- ARCH-004 Infrastructure Architecture

---

## Used By

- Operations Team
- Customer Support Team
- DevOps Team
- Infrastructure Team
- Executive Management
- AI Coding Agents

---

## Related Documents

- BUS-005 Customer Support
- OPS-007 SLA Management
- ARCH-004 Infrastructure Architecture

---

# 1. Purpose

This document defines the official Service Catalogue for the Digital Investment Platform.

The catalogue provides a centralized inventory of all production services, their ownership, operational characteristics and service expectations.

---

# 2. Objectives

The Service Catalogue aims to:

- Standardize service definitions
- Improve operational visibility
- Clarify service ownership
- Support SLA management
- Improve incident response
- Simplify operational governance

---

# 3. Scope

The catalogue applies to:

- Customer-facing services
- Administrative services
- Infrastructure services
- Internal platform services
- Shared services
- Security services

Every production service shall appear in this catalogue.

---

# 4. Service Ownership

Each service shall have clearly assigned ownership.

| Role | Responsibility |
|------|----------------|
| Business Owner | Business responsibility |
| Technical Owner | Technical responsibility |
| Operations Owner | Operational management |
| Support Owner | Customer support coordination |

Ownership shall remain current.

---

# 5. Service Classification

Services shall be classified according to business importance.

| Classification | Description |
|---------------|-------------|
| Critical | Core platform functionality |
| High | Important customer services |
| Medium | Supporting business services |
| Low | Internal supporting services |

Classification influences monitoring and SLA targets.

---

# 6. Standard Service Definition

Each service shall include:

- Service ID
- Service Name
- Description
- Business Owner
- Technical Owner
- Criticality
- Dependencies
- SLA
- Monitoring Dashboard
- Related Runbooks
- Related Documentation

---

# 7. Service Catalogue

| Service ID | Service Name | Criticality | Business Owner | Technical Owner |
|------------|--------------|-------------|----------------|-----------------|
| SRV-001 | Customer Portal | Critical | Product Team | DevOps |
| SRV-002 | Admin Portal | Critical | Operations | DevOps |
| SRV-003 | Authentication Service | Critical | Security | Infrastructure |
| SRV-004 | Payment Service | Critical | Finance | Backend Team |
| SRV-005 | Notification Service | High | Operations | Backend Team |
| SRV-006 | Reporting Service | High | Business Intelligence | Backend Team |
| SRV-007 | Monitoring Platform | High | Operations | Infrastructure |
| SRV-008 | Backup Service | Critical | Infrastructure | Infrastructure |

The catalogue shall expand as new production services are introduced.

---

# 8. Service Dependencies

Each service should document:

- Upstream dependencies
- Downstream dependencies
- External providers
- Database dependencies
- Queue dependencies
- Third-party integrations

Dependencies should remain documented and reviewed.

---

# 9. Availability & Support Hours

Each service shall define its expected availability and operational support coverage.

---

## Service Availability

Every production service should specify:

- Availability Target
- Planned Maintenance Windows
- Service Dependencies
- Disaster Recovery Coverage

Availability values should align with the applicable SLA.

---

## Support Coverage

| Support Level | Coverage |
|--------------|----------|
| Business Hours | Monday–Friday during business hours |
| Extended Hours | Business hours plus on-call support |
| 24×7 | Continuous operational support |

Critical production services should normally receive 24×7 operational coverage.

---

# 10. Service Lifecycle

Every service shall follow a controlled lifecycle.

The lifecycle consists of:

Planning

↓

Design

↓

Development

↓

Testing

↓

Production

↓

Operation

↓

Maintenance

↓

Retirement

Lifecycle transitions shall be documented.

---

## Service Retirement

Before retiring a service the following should be completed:

- Customer impact assessment
- Dependency analysis
- Data migration (if applicable)
- Documentation update
- Monitoring removal
- Runbook retirement
- Final approval

No production service should be retired without formal approval.

---

# 11. Catalogue Governance

The Service Catalogue shall remain under controlled governance.

Governance activities include:

- Service registration
- Ownership verification
- Documentation review
- SLA verification
- Monitoring verification
- Dependency validation

The catalogue shall represent the current production environment.

---

## Ownership Review

Ownership information should be reviewed:

- After organisational changes
- After major releases
- During annual governance reviews

Ownership records should always remain current.

---

# 12. Review Process

The Service Catalogue should be reviewed periodically.

Review activities include:

- Verify service inventory
- Validate ownership
- Confirm SLA references
- Verify monitoring links
- Review service classifications
- Update dependencies

Reviews should occur at least quarterly.

---

# 13. AI Implementation Notes

Artificial Intelligence may assist catalogue maintenance by analysing documentation consistency and identifying missing service metadata.

AI should never independently modify the official Service Catalogue.

---

## Approved AI Responsibilities

AI may assist with:

- Documentation consistency checks
- Service metadata suggestions
- Dependency analysis
- Catalogue reporting
- Ownership validation support
- Governance reporting

---

## Restricted AI Responsibilities

AI must not:

- Register production services.
- Remove production services.
- Change service ownership.
- Modify SLA assignments.
- Approve catalogue changes.

---

## Human Responsibility

Final responsibility for the Service Catalogue remains with the Operations Team, Architecture Team and Executive Management.

Catalogue modifications require approval from authorised personnel.

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.1.0 | July 2026 | Added availability & support hours, service lifecycle, catalogue governance, review process and AI implementation guidance. |

---

# Document Approval

| Role | Name | Status |
|------|------|--------|
| Project Manager | Pending | ⏳ |
| Operations Lead | Pending | ⏳ |
| Infrastructure Lead | Pending | ⏳ |
| DevOps Lead | Pending | ⏳ |
| Executive Sponsor | Pending | ⏳ |
