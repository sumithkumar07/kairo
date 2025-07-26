'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function AcademyRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="tutorials"
      title="Kairo Academy"
      description="Structured learning paths and certifications"
      reason="Academy content is now integrated into the unified help center"
    />
  );
}