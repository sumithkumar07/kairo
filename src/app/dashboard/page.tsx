'use client';

import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { EnhancedDashboardV3 } from '@/components/enhanced-dashboard-v3';

function DashboardPage() {
  return (
    <EnhancedAppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <EnhancedDashboardV3 />
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(DashboardPage);