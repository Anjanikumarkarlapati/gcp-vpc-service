// Sample data mirroring PRD.md and ARCHITECTURE.md. Replace with the log-sink API later.
export const perimeter = {
  name: "sensitive-perimeter",
  mode: "dry-run",
  soakDays: 9,
  soakTarget: 14,
  projects: ["sensitive-data-dev"],
  services: ["storage.googleapis.com", "bigquery.googleapis.com", "pubsub.googleapis.com",
    "secretmanager.googleapis.com", "cloudkms.googleapis.com", "dataflow.googleapis.com"],
  vip: "restricted.googleapis.com (199.36.153.4/30)",
};

export const accessLevels = [
  { name: "corp-network", kind: "IP ranges", detail: "Corporate VPN CIDRs" },
  { name: "trusted-cicd", kind: "Service account", detail: "ci-deployer@…iam.gserviceaccount.com" },
  { name: "break-glass", kind: "Identity group", detail: "Audited, alert on use" },
];

export const rules = [
  { id: "IN-1", type: "Ingress", who: "CI/CD service account", what: "deploy via storage, bigquery", expires: "2027-01-31" },
  { id: "IN-2", type: "Ingress", who: "Analyst group (corp network)", what: "bigquery queries", expires: "2027-03-31" },
  { id: "EG-1", type: "Egress", who: "Perimeter identities", what: "approved partner project (allow-list)", expires: "2027-02-28" },
];

export const violations = [
  { id: "vpcsc-7f3a91", time: "2026-10-10 08:14", principal: "analyst@example.com", service: "bigquery.googleapis.com", method: "jobservice.query", reason: "NO_MATCHING_ACCESS_LEVEL", ip: "203.0.113.24", dry: true },
  { id: "vpcsc-2b8c40", time: "2026-10-10 07:52", principal: "etl-sa@proj.iam.gserviceaccount.com", service: "storage.googleapis.com", method: "storage.objects.copy", reason: "RESOURCES_NOT_IN_SAME_SERVICE_PERIMETER", ip: "10.0.4.8", dry: true },
  { id: "vpcsc-91de05", time: "2026-10-09 22:31", principal: "unknown@gmail.com", service: "storage.googleapis.com", method: "storage.objects.get", reason: "NO_MATCHING_ACCESS_LEVEL", ip: "198.51.100.7", dry: false },
  { id: "vpcsc-c04417", time: "2026-10-09 15:03", principal: "dev-vm-sa@proj.iam.gserviceaccount.com", service: "pubsub.googleapis.com", method: "Publish", reason: "SERVICE_NOT_ALLOWED_FROM_VPC", ip: "10.0.4.19", dry: true },
  { id: "vpcsc-5a62e8", time: "2026-10-08 11:47", principal: "bq-export@proj.iam.gserviceaccount.com", service: "bigquery.googleapis.com", method: "jobservice.insert", reason: "RESOURCES_NOT_IN_ORGANIZATION", ip: "10.0.4.8", dry: false },
];

export const decisionTree = [
  { reason: "NO_MATCHING_ACCESS_LEVEL", cause: "Caller IP/device not in an access level", fix: "Add to access level or use ingress rule" },
  { reason: "RESOURCES_NOT_IN_SAME_SERVICE_PERIMETER", cause: "Cross-perimeter or perimeter→outside copy", fix: "Add egress/ingress rule or move project" },
  { reason: "SERVICE_NOT_ALLOWED_FROM_VPC", cause: "VPC accessible-services restriction", fix: "Allow service in VPC accessible services" },
  { reason: "NETWORK_NOT_IN_SAME_SERVICE_PERIMETER", cause: "VPC network from other project", fix: "Add network's project to perimeter" },
  { reason: "RESOURCES_NOT_IN_ORGANIZATION", cause: "Target outside org", fix: "Egress rule with explicit allow-list" },
];

export const rollout = [
  "Inventory services, identities, networks and data flows",
  "Dry-run perimeter: config in spec only, violations logged not blocked",
  "Analyse violations by identity / service / method / source",
  "Iterate until only expected or attack-simulated violations remain (≥ 2 weeks)",
  "Enforce spec → status: non-prod, then pre-prod, then prod",
  "Rollback: remove project from perimeter or revert explicit dry-run spec (< 15 min)",
];

export const tests = [
  { id: "T1", name: "Read GCS object from inside perimeter VM", expect: "Allow", result: "pass" },
  { id: "T2", name: "Read object from laptop outside corp network, valid IAM", expect: "Deny (NO_MATCHING_ACCESS_LEVEL)", result: "pass" },
  { id: "T3", name: "Copy bucket to project outside perimeter", expect: "Deny (egress)", result: "pass" },
  { id: "T4", name: "bq extract to external bucket", expect: "Deny", result: "pass" },
  { id: "T5", name: "CI/CD SA deploys via ingress rule", expect: "Allow", result: "pass" },
  { id: "T6", name: "Analyst on corp VPN queries BigQuery", expect: "Allow", result: "pass" },
  { id: "T7", name: "Dry-run violation appears in sink with unique ID", expect: "Logged, not blocked", result: "pending" },
  { id: "T8", name: "Rollback drill restores access < 15 min", expect: "Pass", result: "pending" },
];
