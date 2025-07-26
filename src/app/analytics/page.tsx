'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function AnalyticsRedirect() {
  return (
    <RedirectComponent
      to="/dashboard"
      tab="analytics"
      title="Analytics Dashboard"
      description="Detailed insights into your automation performance"
      reason="Analytics are now integrated into the unified dashboard"
    />
  );
}