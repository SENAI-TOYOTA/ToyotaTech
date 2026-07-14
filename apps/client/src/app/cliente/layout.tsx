import React from 'react';
import { PortalHeader } from '@/src/components/layout/PortalHeader';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <PortalHeader />
      <main className="max-w-[1180px] mx-auto px-4 md:px-7 py-8">
        {children}
      </main>
      {/* Footer simplificado ou o mesmo da landing */}
    </div>
  );
}