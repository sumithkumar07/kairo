'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function TutorialsRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="tutorials"
      title="Video Tutorials"
      description="Step-by-step video guides to master Kairo automation"
      reason="Tutorials are now part of the unified help center"
    />
  );
}