'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function LoginRedirect() {
  return (
    <RedirectComponent
      to="/auth"
      tab="signin"
      title="Sign In"
      description="Access your account and manage your automations"
      reason="Login and signup have been consolidated into a unified authentication experience"
    />
  );
}