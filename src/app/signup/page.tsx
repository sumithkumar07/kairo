'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function SignupRedirect() {
  return (
    <RedirectComponent
      to="/auth"
      tab="signup"
      title="Create Account"
      description="Start your automation journey with a free trial"
      reason="Login and signup have been consolidated into a unified authentication experience"
    />
  );
}