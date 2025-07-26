'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function WorkflowRedirect() {
  return (
    <RedirectComponent
      to="/editor"
      tab="canvas"
      title="Workflow Editor"
      description="Build powerful automations with our visual editor and AI assistance"
      reason="The workflow builder has been enhanced with new features and moved to the unified editor"
    />
  );
}