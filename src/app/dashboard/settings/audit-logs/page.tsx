export const dynamic = "force-dynamic";
import { getAuditLogs } from "@/actions/audit";

import { AuditLogsClient } from "./audit-logs-client";

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return <AuditLogsClient logs={logs} />;
}
