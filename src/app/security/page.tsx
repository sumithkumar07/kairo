'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function SecurityRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="security"
      title="Security & Privacy"
      description="Manage your account security and privacy settings"
      reason="Security settings are now part of the unified account center"
    />
  );
}