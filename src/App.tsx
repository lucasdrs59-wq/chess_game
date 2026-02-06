import React from 'react';
import FairPlayBanner from './components/FairPlayBanner';
import Settings from './pages/Settings';
import Import from './pages/Import';

export function App() {
  return (
    <main>
      <FairPlayBanner />
      <Settings />
      <Import />
    </main>
  );
}

export default App;
