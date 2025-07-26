'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function BillingRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="billing"
      title="Billing & Subscription"
      description="Manage your subscription, billing, and usage"
      reason="Billing management is now part of the unified account center"
    />
  );
}