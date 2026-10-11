import { useStore } from '../store';
import { shootStatus } from '../lib/derive';
import { addDaysIso, officeStatus, todayIso } from '../lib/time';
import type { AdState, DeliveryState, ShootStatus } from '../data/types';

/** Quick state switches for testing every approved conditional state without the admin view. */
export default function DemoPanel({ onClose }: { onClose: () => void }) {
  const { state, client, update, audit, reset, toast } = useStore();
  const ss = shootStatus(client, state);
  const office = officeStatus(new Date(), 'auto');

  const setShoot = (st: ShootStatus) => {
    update((s) => {
      const sh = s.clients[s.clientId].shoot;
      sh.noShoot = st === 'none';
      if (st === 'scheduled') { sh.confirmed = true; sh.date = sh.date ?? '2026-10-22'; sh.time = sh.time ?? '2:00 PM'; sh.planShared = true; sh.cutoffOverride = undefined; }
      if (st === 'pending') { sh.confirmed = false; sh.planShared = false; sh.cutoffOverride = addDaysIso(todayIso(), 7); }
      if (st === 'overdue') { sh.confirmed = false; sh.planShared = false; sh.cutoffOverride = addDaysIso(todayIso(), -2); }
    });
    audit(`Manual shoot-state override → ${st} (demo control)`, 'Demo Controls', client.id);
  };
  const setDelivery = (photos: DeliveryState, videos: DeliveryState) => update((s) => { s.clients[s.clientId].delivery.photos = photos; s.clients[s.clientId].delivery.videos = videos; });
  const setAds = (v: AdState) => update((s) => { s.clients[s.clientId].ads.meta = v; s.clients[s.clientId].ads.google = v === 'payment_issue' ? 'live' : v; });
  const d = client.delivery;
  const dKey = d.photos === 'Delivered' && d.videos === 'Delivered' ? 'both' : d.photos === 'Delivered' ? 'photos' : 'none';

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Demo controls">
        <div className="modal-head"><div><h3>Demo Controls</h3><p className="card-sub">Switch states to test the approved behaviors. Not part of the client UI.</p></div><button className="xbtn" onClick={onClose} aria-label="Close">×</button></div>
        <div className="modal-body">
          <Group label="View As">
            <Seg value={state.role} options={[['client', 'Client'], ['admin', 'RMG Admin (internal)']]} onChange={(v) => update((s) => { s.role = v as 'client' | 'admin'; if (v === 'client' && s.page === 'admin') s.page = 'home'; })} />
          </Group>
          <Group label="Client Account">
            <Seg value={state.clientId} options={Object.values(state.clients).map((c) => [c.id, c.name])} onChange={(v) => update((s) => { s.clientId = v; })} />
            <p className="hint">Each client's data is separate. Columbia Inn shows the approved Brand Snapshot and several disconnected-integration states.</p>
          </Group>
          <Group label={`RMG Office Status (actual now: ${office.open ? 'Open' : 'Closed'}, ET)`}>
            <Seg value={state.officeOverride} options={[['auto', 'Live Clock'], ['open', 'Force Open'], ['closed', 'Force Closed']]} onChange={(v) => update((s) => { s.officeOverride = v as typeof s.officeOverride; })} />
          </Group>
          <Group label="Content Shoot State">
            <Seg value={ss} options={[['scheduled', 'Scheduled'], ['pending', 'Pending'], ['overdue', 'Overdue'], ['none', 'None']]} onChange={(v) => setShoot(v as ShootStatus)} />
          </Group>
          <Group label="Content Delivery">
            <Seg value={dKey} options={[['none', 'Both Pending'], ['photos', 'Photos Done, Videos Editing'], ['both', 'Both Delivered (section hides)']]} onChange={(v) => {
              if (v === 'none') setDelivery('Processing', 'Editing'); else if (v === 'photos') setDelivery('Delivered', 'Editing'); else setDelivery('Delivered', 'Delivered');
            }} />
          </Group>
          <Group label="Ad Status">
            <Seg value={client.ads.meta} options={[['live', 'Live'], ['paused', 'Paused'], ['payment_issue', 'Meta Payment Issue'], ['unavailable', 'Unavailable']]} onChange={(v) => setAds(v as AdState)} />
          </Group>
          <Group label="Meetings">
            <Seg value={client.meetings.length ? 'booked' : 'none'} options={[['none', 'None Booked'], ['booked', 'Meeting Booked']]} onChange={(v) => update((s) => { s.clients[s.clientId].meetings = v === 'booked' ? [{ id: 'mt-demo', title: 'Monthly Strategy Check-In', date: '2026-10-16', time: '10:30 AM', with: 'Account Manager' }] : []; })} />
          </Group>
          <Group label="Action Needed">
            <Seg value={client.actionItems.length ? 'pending' : 'clear'} options={[['pending', 'Holiday Form Pending'], ['clear', 'All Clear']]} onChange={(v) => update((s) => {
              const c = s.clients[s.clientId];
              const h = s.holidays.find((x) => x.clientId === s.clientId && x.holiday === 'Thanksgiving');
              if (v === 'clear') c.actionItems = [];
              else if (!c.actionItems.length) { c.actionItems = [{ id: 'ai-thx', title: 'Thanksgiving Holiday Planning', desc: 'Confirm holiday hours, specials, menus and promotions.', due: '2026-10-20', holidayId: h?.id ?? 'hol' }]; if (h) h.status = 'Requested'; }
            })} />
          </Group>
          <div className="grid2">
            <button className="btn" onClick={() => { reset(); toast('Demo data reset.'); onClose(); }}>Reset Demo Data</button>
            <button className="btn primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="stack-sm"><strong style={{ fontSize: 12.5 }}>{label}</strong>{children}</div>;
}

function Seg({ value, options, onChange }: { value: string; options: (readonly [string, string])[] | string[][]; onChange: (v: string) => void }) {
  return <div className="seg">{options.map(([k, l]) => <button key={k} className={value === k ? 'on' : ''} aria-pressed={value === k} onClick={() => onChange(k)}>{l}</button>)}</div>;
}
