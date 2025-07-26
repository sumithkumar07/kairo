'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function PermissionsRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="security"
      title="Permissions & Access"
      description="Manage user permissions and access controls"
      reason="Permission management is now part of the unified account security center"
    />
  );
}