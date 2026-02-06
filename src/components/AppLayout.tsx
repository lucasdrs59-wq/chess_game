import React from 'react';
import FairPlayBanner from './FairPlayBanner';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      <FairPlayBanner />
      {children}
    </main>
  );
}
