'use client';

import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { EnterpriseFeatures } from '@/components/enterprise-features';

function EnterprisePage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <EnterpriseFeatures />
      </div>
    </AppLayout>
  );
}

export default withAuth(EnterprisePage);