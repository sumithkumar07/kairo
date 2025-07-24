'use client';

import React from 'react';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';

function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
        <p>Coming soon...</p>
      </div>
    </AppLayout>
  );
}

export default withAuth(AnalyticsPage);