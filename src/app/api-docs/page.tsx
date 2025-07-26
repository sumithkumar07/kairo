'use client';

import { RedirectComponent } from '@/components/redirect-component';

export default function ApiDocsRedirect() {
  return (
    <RedirectComponent
      to="/help"
      tab="api"
      title="API Documentation"
      description="Complete API reference with examples and code samples"
      reason="API documentation is now part of the unified help center"
    />
  );
}