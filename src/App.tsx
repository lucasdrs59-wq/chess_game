import React from 'react';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import Import from './pages/Import';
import Settings from './pages/Settings';

export default function App(): JSX.Element {
  return (
    <AppLayout>
      <Home />
      <Import />
      <Settings />
    </AppLayout>
  );
}
