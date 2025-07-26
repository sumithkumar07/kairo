'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function LearnRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="getting-started"
      title="Learning Resources"
      description="Comprehensive learning materials and guides"
      reason="Learning resources are now consolidated in the unified help center"
    />
  );
}