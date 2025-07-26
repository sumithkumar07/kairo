'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function OrganizationRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="team"
      title="Organization Management"
      description="Manage your organization settings and team members"
      reason="Organization management is now part of the unified account center"
    />
  );
}