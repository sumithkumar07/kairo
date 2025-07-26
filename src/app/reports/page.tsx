'use client';

import React from 'react';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { EnhancedAnalyticsDashboard } from '@/components/enhanced-analytics-dashboard';

function ReportsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <EnhancedAnalyticsDashboard />
      </div>
    </AppLayout>
  );
}

export default withAuth(ReportsPage);