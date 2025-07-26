'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function MonitoringRedirect() {
  return (
    <RedirectComponent
      to="/dashboard"
      tab="monitoring"
      title="System Monitoring"
      description="Real-time monitoring of workflows and system health"
      reason="Monitoring is now integrated into the unified dashboard"
    />
  );
}