import { useEffect, useState } from 'react';
import { useStore } from './store';
import type { PageId } from './data/types';
import { BrandMark } from './components/ui';
import DemoPanel from './components/DemoPanel';
import Home from './pages/Home';
import Performance from './pages/Performance';
import Content from './pages/Content';
import Requests from './pages/Requests';
import Reports from './pages/Reports';
import Brand from './pages/Brand';
import Account from './pages/Account';
import Admin from './pages/Admin';

const NAV: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'performance', label: 'Performance Dashboard' },
  { id: 'content', label: 'Content Shoot & Library' },
  { id: 'requests', label: 'Communication & Requests' },
  { id: 'reports', label: 'Reports & Insights' },
  { id: 'brand', label: 'Brand Snapshot' },
  { id: 'account', label: 'Account & Settings' },
];
const PAGE_IDS: PageId[] = [...NAV.map((n) => n.id), 'admin'];

export default function App() {
  const { state, go, update, client } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // Deep link with a bare #page token.
  useEffect(() => {
    const h = location.hash.replace('#', '') as PageId;
    if (PAGE_IDS.includes(h) && h !== state.page) update((s) => { s.page = h; if (h === 'admin') s.role = 'admin'; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const page = state.role === 'admin' ? 'admin' : state.page === 'admin' ? 'home' : state.page;
  const navTo = (id: PageId) => {
    setDrawer(false);
    update((s) => {
      // Re-selecting a page resets its sub-view to the top level.
      if (id === 'requests') s.tabs['requests:view'] = 'main';
      if (id === 'account') s.tabs['account:screen'] = 'overview';
    });
    go(id);
  };

  const navList = (
    <nav aria-label="Portal pages" className="stack-sm" style={{ gap: 4 }}>
      {state.role === 'client' ? NAV.map((n, i) => (
        <button key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} aria-current={page === n.id ? 'page' : undefined} onClick={() => navTo(n.id)}>
          <span className="nav-num">{i + 1}</span>{n.label}
        </button>
      )) : (
        <button className="nav-item active"><span className="nav-num">A</span>RMG Admin</button>
      )}
    </nav>
  );
  const foot = (
    <div className="sidebar-foot stack-sm">
      <div>{state.role === 'client' ? <>Signed in as <strong style={{ color: '#fff' }}>{client.name}</strong></> : 'RMG staff (internal demo)'}</div>
      <div>Demo build · sample data only</div>
    </div>
  );

  return (
    <div className="app">
      <aside className="sidebar"><div className="brand"><BrandMark /></div>{navList}{foot}</aside>
      <div className="main">
        <div className="mobilebar">
          <button className="xbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>☰</button>
          <BrandMark />
          <span style={{ width: 32 }} />
        </div>
        {drawer && (
          <>
            <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
            <div className="drawer" role="dialog" aria-label="Menu">
              <div className="row between" style={{ marginBottom: 16 }}><BrandMark /><button className="xbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} aria-label="Close menu" onClick={() => setDrawer(false)}>×</button></div>
              {navList}{foot}
            </div>
          </>
        )}
        <main className="content" id="main">
          {page === 'home' && <Home />}
          {page === 'performance' && <Performance />}
          {page === 'content' && <Content />}
          {page === 'requests' && <Requests />}
          {page === 'reports' && <Reports />}
          {page === 'brand' && <Brand />}
          {page === 'account' && <Account />}
          {page === 'admin' && <Admin />}
        </main>
      </div>
      <button className="demo-fab" onClick={() => setDemoOpen(true)} aria-label="Open demo controls"><span className="sq" />Demo Controls</button>
      {demoOpen && <DemoPanel onClose={() => setDemoOpen(false)} />}
    </div>
  );
}
