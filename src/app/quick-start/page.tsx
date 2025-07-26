'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function QuickStartRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="getting-started"
      title="Quick Start Guide"
      description="Get up and running with Kairo in minutes"
      reason="Quick start content is now part of the unified help center"
    />
  );
}