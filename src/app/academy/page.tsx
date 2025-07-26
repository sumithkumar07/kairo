'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AcademyRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new consolidated learning center with courses tab
    router.replace('/learn?tab=courses');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Learning Center...</h1>
        <p className="text-muted-foreground">Academy has been consolidated into the Learning & Knowledge Center.</p>
      </div>
    </div>
  );
}