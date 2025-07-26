'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function AgentHubRedirect() {
  return (
    <RedirectComponent
      to="/editor"
      tab="ai"
      title="AI Agent Hub"
      description="Discover and configure AI agents for your workflows"
      reason="AI agents are now integrated into the unified workflow editor"
    />
  );
}