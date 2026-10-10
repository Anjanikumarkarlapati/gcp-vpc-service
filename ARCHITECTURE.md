# Architecture: VPC Service Controls Perimeter Design

Project 24CC3156-P052 · see [PRD.md](PRD.md) for requirements.

## 1. Architecture Summary

A VPC-SC **service perimeter** wraps a sensitive project holding regulated data. Requests to restricted Google APIs are allowed only when the caller and resource are inside the perimeter, or when the request matches an explicit **access level**, **ingress rule** or **egress rule**. Violations are logged to a central sink for diagnosis. Rollout uses **dry-run** before enforcement.

## 2. High-Level Diagram

```
                          ┌───────────────────────────── GCP Organization ─────────────────────────────┐
                          │                                                                            │
                          │   Access Context Manager (Access Policy)                                   │
                          │   ├─ Access Levels: corp-network, trusted-sa, managed-device               │
                          │   └─ Service Perimeter  "sensitive-perimeter"  (dry-run → enforced)        │
                          │                                                                            │
 ┌──────────────┐         │   ┌───────────────── Perimeter ─────────────────┐                          │
 │ Analyst      │─corp IP─┼──▶│  Sensitive Project                          │                          │
 │ (corp VPN)   │ ingress │   │   ┌──────────┐ ┌──────────┐ ┌────────────┐  │                          │
 └──────────────┘         │   │   │ GCS      │ │ BigQuery │ │ KMS/Secrets│  │                          │
 ┌──────────────┐         │   │   └──────────┘ └──────────┘ └────────────┘  │   ┌──────────────────┐   │
 │ CI/CD SA     │─ingress─┼──▶│   VPC + Private DNS → restricted.googleapis │──▶│ Approved partner │   │
 └──────────────┘         │   │   (199.36.153.4/30)                         │egr│ project (egress  │   │
 ┌──────────────┐         │   └─────────────────────────────────────────────┘   │ rule, allow-list)│   │
 │ Attacker /   │──DENIED─┼─────────X                                           └──────────────────┘   │
 │ external proj│         │                                                                            │
 └──────────────┘         │   Cloud Audit Logs ──▶ Log Sink ──▶ BigQuery ──▶ Dashboards / Alerts       │
                          └────────────────────────────────────────────────────────────────────────────┘
```

## 3. Components

| Component | Purpose | Notes |
|-----------|---------|-------|
| **Access Policy** (ACM) | Org-scoped container for access levels and perimeters | One per org (or scoped policy per folder/project) |
| **Access Levels** | Conditions for ingress: IP CIDRs, device policy, identities | `corp-network`, `trusted-cicd`, `break-glass` |
| **Service Perimeter** | Boundary around project(s); lists restricted services | Regular perimeter; dry-run (`spec`) vs enforced (`status`) |
| **Ingress rules** | Allow external identities/sources into perimeter for named services/methods | Narrow identities, methods, resources |
| **Egress rules** | Allow perimeter identities to reach specific external projects/services | Explicit destination project allow-list |
| **Perimeter bridge** (optional) | Share between two perimeters | Prefer ingress/egress rules for finer control |
| **Restricted VIP + Private DNS** | Route Google API traffic via `restricted.googleapis.com` | Private Google Access enabled on subnets |
| **Cloud Audit Logs** | Admin, Data Access, and VPC-SC policy-denied logs | Enable Data Access logs for restricted services |
| **Log Sink → BigQuery** | Central violation store | Partitioned, ≥ 1y retention |
| **Dashboards/Alerts** | Violation trends, new denied principals | Cloud Monitoring log-based metrics |
| **Terraform** | Infrastructure as code | Remote state, PR-reviewed |
| **Test harness** | Prove allow/deny behaviour | Scripts using `gcloud`/`bq`/`gsutil` from in/out of perimeter |

## 4. Request Evaluation Flow

```
Client request to googleapis.com
        │
        ▼
 IAM check ──deny──▶ 403 (IAM)
        │allow
        ▼
 Is target resource in a perimeter and service restricted?
        │ no ──────────────────────────▶ allowed
        │ yes
        ▼
 Caller inside same perimeter (project/VPC network)?
        │ yes ─────────────────────────▶ allowed
        │ no
        ▼
 Matches access level / ingress rule?  (for inbound)
 Matches egress rule?                  (for outbound / cross-perimeter)
        │ yes ─────────────────────────▶ allowed
        │ no
        ▼
 DENIED → 403 "Request is prohibited by organization's policy"
        + audit log with vpcServiceControlsUniqueId
```

## 5. Rollout Strategy (Mitigating Misconfiguration)

1. **Inventory** – list services used, identities, source networks, cross-project data flows (Cloud Asset Inventory, audit logs).
2. **Dry-run perimeter** – config in `spec` only; violations are logged but not blocked.
3. **Analyse** – BigQuery queries group violations by identity/service/method/source; create or reject rules.
4. **Iterate** – repeat until violations are only the expected/attack-simulated ones (≥ 2 weeks).
5. **Enforce** – promote `spec` → `status` for non-prod, then pre-prod, then prod, in a change window.
6. **Rollback** – remove project from perimeter or set `use_explicit_dry_run_spec` back; rehearsed drill.

## 6. Troubleshooting Design (Mitigating Hard-to-Debug Denials)

**Log fields used**

- `protoPayload.metadata.violationReason`
- `protoPayload.metadata.vpcServiceControlsUniqueId`
- `protoPayload.authenticationInfo.principalEmail`
- `protoPayload.serviceName`, `protoPayload.methodName`
- `protoPayload.metadata.ingressViolations` / `egressViolations`
- `protoPayload.requestMetadata.callerIp`, `.resource.labels.project_id`

**Sample sink query**

```sql
SELECT timestamp,
       protopayload_auditlog.authenticationInfo.principalEmail AS principal,
       protopayload_auditlog.serviceName AS service,
       protopayload_auditlog.methodName AS method,
       JSON_VALUE(protopayload_auditlog.metadataJson, '$.violationReason') AS reason,
       JSON_VALUE(protopayload_auditlog.metadataJson, '$.vpcServiceControlsUniqueId') AS uid
FROM `logs_dataset.cloudaudit_googleapis_com_policy`
WHERE JSON_VALUE(protopayload_auditlog.metadataJson, '$.@type') LIKE '%VpcServiceControlAuditMetadata'
ORDER BY timestamp DESC;
```

**Decision tree**

| Violation reason | Likely cause | Fix |
|------------------|--------------|-----|
| `NO_MATCHING_ACCESS_LEVEL` | Caller IP/device not in an access level | Add to access level or use ingress rule |
| `RESOURCES_NOT_IN_SAME_SERVICE_PERIMETER` | Cross-perimeter or perimeter→outside copy | Add egress/ingress rule or move project |
| `SERVICE_NOT_ALLOWED_FROM_VPC` | VPC accessible-services restriction | Allow service in VPC accessible services |
| `NETWORK_NOT_IN_SAME_SERVICE_PERIMETER` | VPC network from other project | Add network's project to perimeter |
| `RESOURCES_NOT_IN_ORGANIZATION` | Target outside org | Egress rule with explicit allow-list |

**Tooling**: `scripts/lookup_violation.sh <unique_id>` returns the decoded event, matched rule candidates and suggested fix; alert on spikes and on new principals.

## 7. Proposed Repository Layout

```
.
├── PRD.md
├── ARCHITECTURE.md
├── terraform/
│   ├── modules/
│   │   ├── access-policy/
│   │   ├── access-levels/
│   │   ├── service-perimeter/      # spec (dry-run) + status (enforced)
│   │   ├── restricted-dns/         # restricted.googleapis.com zone + routes
│   │   └── logging-sink/
│   └── envs/{dev,preprod,prod}/
├── queries/                        # BigQuery violation analysis
├── scripts/                        # lookup_violation, dry-run report, tests
├── tests/                          # exfiltration allow/deny scenarios
├── runbooks/                       # troubleshooting, rollback, rule-change
└── docs/compliance-mapping.md
```

## 8. Security Controls & Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dry-run before enforce | Prevents broad outage (bottleneck 1) |
| Ingress/egress rules over bridges | Method- and identity-level granularity |
| Identity-based rules, no `*` | Least privilege |
| Restricted VIP only | Blocks access to non-VPC-SC-compatible APIs |
| Terraform + PR review | Auditable, repeatable, reviewable change |
| Central violation sink | Fast diagnosis (bottleneck 2), compliance evidence |
| Separate break-glass access level with alerting | Emergency access without disabling perimeter |
| Pair with IAM, CMEK, DLP | Defense in depth; VPC-SC is not a substitute |

## 9. Test Plan

| # | Scenario | Expected |
|---|----------|----------|
| T1 | Read GCS object from inside perimeter VM | Allow |
| T2 | Read same object from laptop outside corp network with valid IAM | Deny (`NO_MATCHING_ACCESS_LEVEL`) |
| T3 | Copy bucket to project outside perimeter | Deny (egress) |
| T4 | `bq extract` to external bucket | Deny |
| T5 | CI/CD SA deploys via ingress rule | Allow |
| T6 | Analyst on corp VPN queries BigQuery | Allow |
| T7 | Dry-run violation appears in sink with unique ID | Logged, not blocked |
| T8 | Rollback drill restores access < 15 min | Pass |

## 10. Limitations & Considerations

- Not all services/methods are supported; verify the VPC-SC supported products list.
- Rule and perimeter size quotas apply; propagation can take several minutes.
- Console access requires access levels covering human users' networks/devices.
- VPC-SC does not protect against exfiltration via authorised users' endpoints (use DLP, device controls).
- Org-level IAM (`Access Context Manager Admin`, `Organization Admin`) is needed to create policy.
