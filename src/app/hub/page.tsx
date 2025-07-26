'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function HubRedirect() {
  return (
    <RedirectComponent
      to="/integrations"
      tab="my-integrations"
      title="Integration Hub"
      description="Manage your connected services and configurations"
      reason="Integration management is now consolidated in the integrations hub"
    />
  );
}