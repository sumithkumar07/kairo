'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function CommunityRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="community"
      title="Community Forum"
      description="Connect with other users and get help from the community"
      reason="Community features are now integrated into the unified help center"
    />
  );
}