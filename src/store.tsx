import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { seedState } from './data/seed';
import type { AppState, AuditEntry, ClientRecord, PageId, RequestRecord, RequestStatus } from './data/types';
import { nowStamp } from './lib/time';

const KEY = 'rmgos-portal-demo';

function load(): AppState {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === seed.version) return parsed;
    }
  } catch { /* storage unavailable: run on seed data */ }
  return seed;
}

interface Ctx {
  state: AppState;
  client: ClientRecord;
  update: (fn: (s: AppState) => void) => void;
  go: (page: PageId, tab?: string) => void;
  setTab: (page: PageId, tab: string) => void;
  tab: (page: PageId, fallback: string) => string;
  nextId: (prefix: string) => string;
  addRequest: (r: Omit<RequestRecord, 'id' | 'mondayId' | 'history' | 'status' | 'submittedAt' | 'lastSynced' | 'clientId'> & { status?: RequestStatus }) => RequestRecord;
  setRequestStatus: (id: string, status: RequestStatus, by: string, note?: string) => void;
  audit: (action: string, actor?: string, clientId?: string) => void;
  reset: () => void;
  // UI
  toast: (msg: string) => void;
  openModal: (node: ReactNode) => void;
  closeModal: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modals, setModals] = useState<ReactNode[]>([]);
  const toastTimer = useRef<number | undefined>(undefined);
  const seqRef = useRef(state.seq);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const update = useCallback((fn: (s: AppState) => void) => {
    setState((prev) => { const next = structuredClone(prev); fn(next); return next; });
  }, []);

  const nextId = useCallback((prefix: string) => { seqRef.current += 1; const n = seqRef.current; update((s) => { s.seq = Math.max(s.seq, n); }); return `${prefix}-${n}`; }, [update]);

  const go = useCallback((page: PageId, tab?: string) => {
    update((s) => { s.page = page; if (tab) s.tabs[page] = tab; });
    setModals([]);
    try { history.replaceState(null, '', `#${page}`); } catch { /* ignore */ }
    window.scrollTo({ top: 0 });
  }, [update]);

  const setTab = useCallback((page: PageId, tab: string) => update((s) => { s.tabs[page] = tab; }), [update]);
  const tab = useCallback((page: PageId, fallback: string) => state.tabs[page] ?? fallback, [state.tabs]);

  const audit = useCallback((action: string, actor = 'RMG Staff', clientId?: string) => {
    const entry: AuditEntry = { id: `au-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: nowStamp(), actor, clientId, action };
    update((s) => { s.audit.unshift(entry); });
  }, [update]);

  const addRequest: Ctx['addRequest'] = useCallback((r) => {
    seqRef.current += 1;
    const n = seqRef.current;
    const at = nowStamp();
    const rec: RequestRecord = {
      ...r,
      id: `RMG-${n}`,
      mondayId: `MON-${n}${Math.floor(Math.random() * 9)}`,
      clientId: '',
      status: r.status ?? 'Submitted',
      submittedAt: at,
      lastSynced: at,
      history: [{ status: r.status ?? 'Submitted', at, by: 'Client' }],
    };
    update((s) => { rec.clientId = s.clientId; s.requests.unshift({ ...rec, clientId: s.clientId }); s.seq = Math.max(s.seq, n); });
    return rec;
  }, [update]);

  const setRequestStatus = useCallback((id: string, status: RequestStatus, by: string, note?: string) => {
    update((s) => {
      const r = s.requests.find((x) => x.id === id);
      if (!r || r.status === status) return;
      r.status = status; r.lastSynced = nowStamp();
      r.history.push({ status, at: nowStamp(), by, note });
      if (note && (status === 'Completed' || status === 'Cancelled')) r.completionNote = note;
    });
  }, [update]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const openModal = useCallback((node: ReactNode) => setModals((m) => [...m, node]), []);
  const closeModal = useCallback(() => setModals((m) => m.slice(0, -1)), []);
  const reset = useCallback(() => { const s = seedState(); seqRef.current = s.seq; setState(s); setModals([]); }, []);

  const client = state.clients[state.clientId];

  const value = useMemo<Ctx>(() => ({ state, client, update, go, setTab, tab, nextId, addRequest, setRequestStatus, audit, reset, toast, openModal, closeModal }),
    [state, client, update, go, setTab, tab, nextId, addRequest, setRequestStatus, audit, reset, toast, openModal, closeModal]);

  return (
    <StoreCtx.Provider value={value}>
      {children}
      {modals.map((m, i) => <div key={i}>{m}</div>)}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('StoreProvider missing');
  return c;
}
