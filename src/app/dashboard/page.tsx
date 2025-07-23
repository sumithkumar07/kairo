'use client';

import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { EnhancedDashboard } from '@/components/enhanced-dashboard';

function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <EnhancedDashboard />
      </div>
    </AppLayout>
  );
}

export default withAuth(DashboardPage);