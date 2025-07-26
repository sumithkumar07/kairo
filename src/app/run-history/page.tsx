'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function RunHistoryRedirect() {
  return (
    <RedirectComponent
      to="/dashboard"
      tab="analytics"
      title="Run History"
      description="View detailed execution history and performance metrics"
      reason="Run history is now part of the unified analytics dashboard"
    />
  );
}