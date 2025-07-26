'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function TrinityRedirect() {
  return (
    <RedirectComponent
      to="/editor"
      tab="trinity"
      title="Trinity Advanced Features"
      description="Access enterprise-level automation capabilities"
      reason="Trinity features are now integrated into the unified workflow editor"
    />
  );
}