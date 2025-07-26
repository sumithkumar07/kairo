'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function MarketplaceRedirect() {
  return (
    <RedirectComponent
      to="/integrations"
      tab="marketplace"
      title="Integration Marketplace"
      description="Discover and connect with your favorite tools and services"
      reason="The marketplace is now part of the consolidated integrations hub"
    />
  );
}