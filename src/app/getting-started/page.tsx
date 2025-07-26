'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function GettingStartedRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="getting-started"
      title="Getting Started"
      description="Quick start guides and onboarding materials"
      reason="Getting started content is now part of the unified help center"
    />
  );
}