'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function TemplatesRedirect() {
  return (
    <RedirectComponent
      to="/editor"
      tab="templates"
      title="Workflow Templates"
      description="Start with pre-built workflows and customize them for your needs"
      reason="Templates are now integrated into the unified workflow editor for a better experience"
    />
  );
}