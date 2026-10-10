# PRD: VPC Service Controls Perimeter Design

| | |
|---|---|
| **Project ID** | 24CC3156-P052 |
| **Category** | Data Security |
| **Teams** | T052, T152, T252 (3 teams, 12 students) |
| **Status** | Draft |

## 1. Overview

Design, deploy and operate a Google Cloud **VPC Service Controls (VPC-SC)** perimeter that protects a sensitive project from data exfiltration, while keeping legitimate access working and making denied requests easy to diagnose.

VPC-SC adds a context-aware boundary around Google-managed services (e.g. Cloud Storage, BigQuery) on top of IAM. Even a caller with valid IAM permissions is blocked if the request crosses the perimeter without an allowed context.

## 2. Problem Statement

- Sensitive data in managed services can be exfiltrated by stolen credentials, misconfigured IAM, or insiders copying data to projects outside the organisation.
- Data-protection requirements (e.g. GDPR, HIPAA, PCI-DSS, internal policy) demand demonstrable controls beyond IAM.
- VPC-SC is powerful but easy to misconfigure: a wrong perimeter can break legitimate workloads, and the resulting denials are hard to troubleshoot.

## 3. Goals

| # | Goal | Maps to use case |
|---|------|------------------|
| G1 | Prevent data exfiltration from a sensitive project | Use case 1 |
| G2 | Produce evidence that satisfies a data-protection requirement | Use case 2 |
| G3 | Avoid broad breakage of legitimate access through a safe rollout (dry-run → enforce) | Bottleneck 1 |
| G4 | Make denied requests quickly diagnosable | Bottleneck 2 |

### Non-goals
- Replacing IAM, VPC firewall rules, or CMEK/DLP controls (VPC-SC is complementary).
- Protecting non-supported services or on-prem data stores.
- Building a custom UI beyond dashboards and runbooks.

## 4. Users & Personas

| Persona | Needs |
|---------|-------|
| **Security engineer** | Define/enforce perimeter; prove exfiltration is blocked |
| **Platform/Cloud engineer** | Manage access levels, ingress/egress rules via IaC |
| **Data engineer / analyst** | Keep pipelines and queries working inside the perimeter |
| **Compliance auditor** | Evidence of controls and audit logs |
| **SRE / support** | Fast triage of "request denied" tickets |

## 5. Use Cases

1. **Prevent data exfiltration from a sensitive project** – block copying of GCS/BigQuery data to external projects, public buckets, or unauthorised networks, even with valid IAM.
2. **Meet a data-protection requirement** – enforce and evidence a control boundary around regulated data, with audit trail.

## 6. Functional Requirements

### 6.1 Perimeter design
- **FR-1** Create an Access Context Manager (ACM) access policy at organisation level.
- **FR-2** Create a regular service perimeter containing the sensitive project(s).
- **FR-3** Restrict an explicit list of services (Cloud Storage, BigQuery, Pub/Sub, Secret Manager, KMS, Dataflow, etc.).
- **FR-4** Define **access levels**: corporate IP ranges, device/identity attributes, and named service accounts.
- **FR-5** Define **ingress rules** (e.g. CI/CD service account, analyst group from corporate network) and **egress rules** (e.g. approved external project, Google-managed APIs).
- **FR-6** Support **perimeter bridges** or ingress/egress rules for controlled cross-perimeter sharing.
- **FR-7** Configure restricted VIPs (`restricted.googleapis.com`) and private DNS so workloads reach APIs privately.

### 6.2 Safe rollout (mitigates bottleneck 1)
- **FR-8** Deploy first in **dry-run mode**; collect violations for a minimum soak period (e.g. 2 weeks).
- **FR-9** Provide a script/report that aggregates dry-run violations by identity, service, method and source, and proposes rules.
- **FR-10** Promote dry-run → enforced only after violations are triaged and approved.
- **FR-11** Support quick rollback (remove project from perimeter or revert config) documented in a runbook.
- **FR-12** Use a staged scope: non-prod project → pre-prod → prod.

### 6.3 Observability & troubleshooting (mitigates bottleneck 2)
- **FR-13** Enable Cloud Audit Logs (including VPC-SC violation logs) and export to a central sink (BigQuery/Log Analytics).
- **FR-14** Provide saved queries to decode violations by **unique ID** (`vpcServiceControlsUniqueId`), including violation type (`NO_MATCHING_ACCESS_LEVEL`, `RESOURCES_NOT_IN_SAME_SERVICE_PERIMETER`, `SERVICE_NOT_ALLOWED_FROM_VPC`, etc.).
- **FR-15** Provide a **troubleshooting runbook / decision tree** mapping violation type → likely cause → fix.
- **FR-16** Dashboards and alerts for violation spikes and new denied identities.
- **FR-17** Provide a self-service "why was I denied?" lookup (script or log query) taking a violation ID.

### 6.4 Governance & compliance
- **FR-18** All perimeter/access-level config managed as code (Terraform) with PR review.
- **FR-19** Change process for adding ingress/egress rules (request template, approver, expiry).
- **FR-20** Compliance mapping document linking controls to the data-protection requirement.

### 6.5 Validation
- **FR-21** Automated test suite proving: (a) in-perimeter access allowed, (b) cross-perimeter copy denied, (c) outside-perimeter read with valid IAM denied, (d) allowed ingress/egress works.

## 7. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Security | Least privilege; no `*` identities in rules; break-glass access is audited |
| Reliability | Perimeter change must not cause unplanned outage; rollback < 15 min |
| Operability | Median time to diagnose a denial < 15 min |
| Auditability | All config changes and violations retained ≥ 1 year (or per policy) |
| Maintainability | 100% IaC; documented modules |

## 8. Risks & Mitigations (Bottlenecks)

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Perimeter misconfiguration blocks legitimate access broadly** | Outages in pipelines, consoles, CI/CD | Dry-run first; staged rollout; inventory of dependent services/identities; rollback runbook; change freeze windows; automated tests |
| **Troubleshooting denied requests is difficult** | Long MTTR, user frustration | Violation log sink + decoded queries; unique-ID lookup tool; decision tree; training for support |
| Overly permissive rules defeat purpose | Residual exfiltration paths | Rule review, expiry, no wildcard identities |
| Unsupported services inside perimeter | Hidden breakage | Check VPC-SC supported products list before adding |
| Org-level permissions required by students | Blocked delivery | Use sandbox org/folder or request Access Context Manager Admin early |

## 9. Success Metrics

- 0 successful exfiltration attempts in the test suite.
- 100% of dry-run violations triaged before enforcement.
- < 1% legitimate-request denial rate after 2 weeks of enforcement.
- Median denial-diagnosis time < 15 min.
- Compliance evidence pack accepted by reviewer.

## 10. Deliverables

1. Terraform modules (access policy, access levels, perimeter, ingress/egress, DNS/VIP).
2. Dry-run analysis tooling and log sink queries.
3. Troubleshooting runbook and decision tree.
4. Test suite and exfiltration demo.
5. Compliance mapping and architecture documentation (`ARCHITECTURE.md`).
6. Final presentation/demo.

## 11. Timeline (suggested)

| Phase | Weeks | Output |
|-------|-------|--------|
| 1. Discovery & inventory | 1–2 | Services, identities, data flows |
| 2. Design | 3 | Perimeter, access levels, rules |
| 3. Build (IaC) + logging | 4–5 | Terraform, sinks, dashboards |
| 4. Dry-run & tuning | 6–8 | Violation analysis, rule fixes |
| 5. Enforce & validate | 9 | Tests, rollback drill |
| 6. Docs & demo | 10 | Runbooks, compliance pack |

## 12. Team Structure

Three teams (T052, T152, T252), 12 students. Suggested split:
- **T052** – Perimeter & access-level design, IaC
- **T152** – Logging, dry-run analysis, troubleshooting tooling
- **T252** – Testing/exfiltration scenarios, compliance documentation

## 13. Assumptions & Open Questions

- Access to a GCP organisation with ACM and a billing-enabled sandbox is available.
- Which services and regulatory requirement are in scope (GDPR/HIPAA/PCI)?
- Is a corporate network/VPN IP range available for access levels?
- Will multiple projects share data (bridges vs. ingress/egress rules)?
