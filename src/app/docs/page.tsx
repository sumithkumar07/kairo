'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function DocsRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="docs"
      title="Documentation"
      description="Complete guides and references for the Kairo platform"
      reason="Documentation is now part of the unified help center"
    />
  );
}