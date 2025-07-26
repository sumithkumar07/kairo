'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function TeamRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="team"
      title="Team Management"
      description="Manage team members, roles, and permissions"
      reason="Team management is now part of the unified account center"
    />
  );
}