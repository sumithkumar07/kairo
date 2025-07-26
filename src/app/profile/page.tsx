'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function ProfileRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="profile"
      title="User Profile"
      description="Manage your personal information and preferences"
      reason="Profile management is now part of the unified account center"
    />
  );
}