'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function SettingsRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="profile"
      title="Account Settings"
      description="Manage your account preferences and configurations"
      reason="Settings are now consolidated in the unified account center"
    />
  );
}