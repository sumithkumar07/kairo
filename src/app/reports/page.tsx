'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function ReportsRedirect() {
  return (
    <RedirectComponent
      to="/dashboard"
      tab="analytics"
      title="Reports"
      description="Comprehensive reporting and data analysis"
      reason="Reports are now part of the unified analytics dashboard"
    />
  );
}