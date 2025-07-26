'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function AiStudioRedirect() {
  return (
    <RedirectComponent
      to="/dashboard"
      tab="ai"
      title="AI Studio"
      description="AI-powered insights and advanced automation features"
      reason="AI features are now integrated into the unified dashboard"
    />
  );
}