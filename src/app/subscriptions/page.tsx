'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function SubscriptionsRedirect() {
  return (
    <RedirectComponent
      to="/account"
      tab="billing"
      title="Subscriptions"
      description="Manage your subscription plans and billing"
      reason="Subscription management is now part of the unified account center"
    />
  );
}