'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function GodTierRedirect() {
  return (
    <RedirectComponent
      to="/dashboard"
      tab="ai"
      title="God-Tier Features"
      description="Advanced AI capabilities for enterprise automation"
      reason="God-tier features are now integrated into the AI intelligence center"
    />
  );
}