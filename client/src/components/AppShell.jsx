import { useState } from 'react';
import './AppShell.css';
import Navbar from './Navbar';
import Topbar from './Topbar';
import OfflineQueueBadge from './OfflineQueueBadge';

export default function AppShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <Topbar onToggleNav={() => setMobileNavOpen((v) => !v)} />
      <Navbar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <main className="app-shell-main">
        <div className="app-shell-content">{children}</div>
      </main>
      <OfflineQueueBadge />
    </div>
  );
}
