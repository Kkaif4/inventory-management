export const dynamic = "force-dynamic";
import { getAuditLogs } from "@/actions/audit";

import { AuditLogsClient } from "./audit-logs-client";

export default async function AuditLogsPage() {
  const res = await getAuditLogs();
  if (!res.success) {
    throw new Error(res.error?.message || "Failed to load audit logs");
  }
  const logs = res.data!;

  return <AuditLogsClient logs={logs} />;
}
