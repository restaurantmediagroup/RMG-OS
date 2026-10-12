import { useState } from 'react';
import { useStore } from '../store';
import { ADAPTERS } from '../integrations/adapters';
import { AD_STATE, SHOOT_BADGE, cutoffFor, shootStatus } from '../lib/derive';
import { fmtFull, fmtStamp } from '../lib/time';
import { OPEN_STATUSES, type AdState, type DeliveryState, type HolidayRecord, type RequestStatus } from '../data/types';
import { Badge, PageFoot, PageHeader, SimTag, Tabs } from '../components/ui';
import { STATUS_TONE, useRequestDetail } from './Requests';

const TABS = ['Requests', 'Holidays', 'Shoots & Delivery', 'Integrations', 'Surveys', 'Onboarding'] as const;
type TabT = typeof TABS[number];
const ALL_STATUSES: RequestStatus[] = ['Submitted', 'Awaiting Review', 'In Progress', 'Waiting on Client', 'Completed', 'Cancelled'];

export default function Admin() {
  const { tab, setTab, state } = useStore();
  const current = tab('admin', 'Requests') as TabT;
  return (
    <>
      <PageHeader title="RMG Admin" sub="Internal demonstration of the staff workflows behind the client portal. Clients never see this view." />
      <div className="demo-banner"><span>Internal RMG view (demo). Changes here update the client portal immediately so you can test each state.</span><SimTag>Demo Only</SimTag></div>
      <div style={{ overflowX: 'auto' }}><Tabs label="Admin sections" items={[...TABS]} value={current} onChange={(t) => setTab('admin', t)} /></div>
      {current === 'Requests' && <RequestsAdmin />}
      {current === 'Holidays' && <HolidaysAdmin />}
      {current === 'Shoots & Delivery' && <ShootsAdmin />}
      {current === 'Integrations' && <IntegrationsAdmin />}
      {current === 'Surveys' && <SurveysAdmin />}
      {current === 'Onboarding' && <OnboardingAdmin />}
      <section className="card">
        <h2 className="card-title">Audit Trail</h2>
        <div className="stack-sm" style={{ marginTop: 10, maxHeight: 220, overflowY: 'auto' }}>
          {state.audit.slice(0, 30).map((a) => <div key={a.id} style={{ fontSize: 12 }}><span className="note">{fmtStamp(a.at)} · {a.actor}{a.clientId ? ` · ${state.clients[a.clientId]?.name ?? a.clientId}` : ''}</span><div>{a.action}</div></div>)}
        </div>
      </section>
      <PageFoot left="RMG OS | Internal admin demonstration" />
    </>
  );
}

function RequestsAdmin() {
  const { state, setRequestStatus, audit } = useStore();
  const openDetail = useRequestDetail();
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const list = state.requests.filter((r) => filter === 'all' || OPEN_STATUSES.includes(r.status));
  return (
    <section className="card stack">
      <div className="row between wrap"><div><h2 className="card-title">Account-Wide Request Inbox</h2><p className="card-sub">Every client request with its linked Monday.com task. Setting Completed or Cancelled moves it to the client's history.</p></div>
        <div className="seg"><button className={filter === 'open' ? 'on' : ''} onClick={() => setFilter('open')}>Open</button><button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button></div></div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Request</th><th>Client</th><th>Scope</th><th>Monday</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td><button className="linkbtn" style={{ color: 'var(--ink)' }} onClick={() => openDetail(r.id)}>{r.title}</button><div className="note">{r.id} · {fmtStamp(r.submittedAt)}</div></td>
                <td>{state.clients[r.clientId]?.name}</td>
                <td>{r.scope ?? '—'}</td>
                <td className="note">{r.mondayId}</td>
                <td>
                  <select className="select sm" aria-label={`Status for ${r.title}`} value={r.status} onChange={(e) => {
                    const st = e.target.value as RequestStatus;
                    const note = st === 'Completed' ? 'Completed by RMG.' : st === 'Waiting on Client' ? 'Please provide the missing details.' : undefined;
                    setRequestStatus(r.id, st, 'Account Manager', note);
                    audit(`${r.id} status → ${st}`, 'Account Manager', r.clientId);
                  }}>{ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                  <div style={{ marginTop: 4 }}><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const HOL_STATUSES: HolidayRecord['status'][] = ['Not Requested', 'Requested', 'Incomplete', 'Submitted', 'Needs Clarification', 'Approved', 'Fulfilled'];

function HolidaysAdmin() {
  const { state, update, audit, toast } = useStore();
  const name = (id: string) => state.clients[id]?.name ?? state.onboarding.find((o) => o.id === id)?.name ?? id;
  return (
    <section className="card stack">
      <div><h2 className="card-title">Holiday Tracker: Thanksgiving</h2><p className="card-sub">Agency-wide submissions by client. Sending a reminder is suppressed once a client has submitted.</p></div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Client</th><th>Due</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
          <tbody>
            {state.holidays.map((h) => {
              const submitted = ['Submitted', 'Approved', 'Fulfilled'].includes(h.status);
              return (
                <tr key={h.id}>
                  <td><strong>{name(h.clientId)}</strong>{h.hours && <div className="note">{h.hours}</div>}</td>
                  <td>{h.due ? fmtFull(h.due) : '—'}</td>
                  <td><select className="select sm" value={h.status} aria-label="Holiday status" onChange={(e) => { const st = e.target.value as HolidayRecord['status']; update((s) => { s.holidays.find((x) => x.id === h.id)!.status = st; }); audit(`Thanksgiving submission → ${st}`, 'RMG Admin', h.clientId); }}>{HOL_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                  <td className="note">{h.submittedAt ? fmtStamp(h.submittedAt) : '—'}</td>
                  <td><button className="btn sm" disabled={submitted} onClick={() => {
                    update((s) => {
                      const x = s.holidays.find((y) => y.id === h.id)!; if (x.status === 'Not Requested') x.status = 'Requested';
                      const c = s.clients[h.clientId];
                      if (c && !c.actionItems.some((a) => a.holidayId === h.id)) c.actionItems.push({ id: `ai-${h.id}`, title: 'Thanksgiving Holiday Planning', desc: 'Confirm holiday hours, specials, menus and promotions.', due: h.due || '2026-10-20', holidayId: h.id });
                    });
                    audit('Prefilled Thanksgiving form link sent (email/SMS per preferences)', 'RMG Admin', h.clientId);
                    toast(`Reminder sent to ${name(h.clientId)} (simulated).`);
                  }}>{submitted ? 'Reminder Suppressed' : 'Send Reminder'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ShootsAdmin() {
  const { state, update, audit, toast } = useStore();
  return (
    <>
      <section className="card stack-sm">
        <h2 className="card-title">Scheduling Cutoff</h2>
        <p className="card-sub">Global default day of month after which an unconfirmed shoot turns Overdue. Each account can override it below.</p>
        <div className="row wrap" style={{ gap: 10 }}>
          <label htmlFor="cutoff-day" style={{ fontWeight: 700, fontSize: 12.5 }}>Default Cutoff Day</label>
          <input id="cutoff-day" type="number" min={1} max={28} className="input" style={{ width: 90 }} value={state.config.defaultCutoffDay} onChange={(e) => { const v = Math.min(28, Math.max(1, Number(e.target.value) || 1)); update((s) => { s.config.defaultCutoffDay = v; }); }} />
        </div>
      </section>
      {Object.values(state.clients).map((c) => {
        const ss = shootStatus(c, state);
        const pendingRush = state.rush.filter((r) => r.clientId === c.id);
        return (
          <section key={c.id} className="card stack-sm">
            <div className="row between"><h2 className="card-title">{c.name}</h2><Badge tone={SHOOT_BADGE[ss].tone}>{SHOOT_BADGE[ss].label}</Badge></div>
            <div className="grid2 stack-mobile">
              <div className="field"><label htmlFor={`sd-${c.id}`}>Shoot Date</label><input id={`sd-${c.id}`} type="date" className="input" value={c.shoot.date ?? ''} onChange={(e) => update((s) => { s.clients[c.id].shoot.date = e.target.value || undefined; })} /></div>
              <div className="field"><label htmlFor={`co-${c.id}`}>Account Cutoff Override</label><input id={`co-${c.id}`} type="date" className="input" value={c.shoot.cutoffOverride ?? ''} onChange={(e) => update((s) => { s.clients[c.id].shoot.cutoffOverride = e.target.value || undefined; })} /><span className="hint">Effective cutoff: {fmtFull(cutoffFor(c, state))}</span></div>
            </div>
            <div className="row wrap" style={{ gap: 8 }}>
              <button className="btn sm" disabled={!c.shoot.date} onClick={() => { update((s) => { const sh = s.clients[c.id].shoot; sh.confirmed = !sh.confirmed; sh.noShoot = false; if (!sh.time) sh.time = '2:00 PM'; }); audit(`Shoot ${c.shoot.confirmed ? 'unconfirmed' : 'confirmed with photographer and client'}`, 'Photographer', c.id); }}>{c.shoot.confirmed ? 'Mark Unconfirmed' : 'Confirm Shoot'}</button>
              <button className="btn sm" onClick={() => { update((s) => { s.clients[c.id].shoot.planShared = !s.clients[c.id].shoot.planShared; }); audit(`Shoot Plan ${c.shoot.planShared ? 'withdrawn' : 'shared (approved version)'}`, 'Marketing Manager', c.id); }}>{c.shoot.planShared ? 'Withdraw Shoot Plan' : 'Share Approved Shoot Plan'}</button>
            </div>
            <hr className="divider" />
            <strong style={{ fontSize: 13 }}>Delivery (Shoot Completed {fmtFull(c.delivery.shootCompletedOn)})</strong>
            <div className="grid2">
              {(['photos', 'videos'] as const).map((k) => (
                <div className="field" key={k}><label htmlFor={`dl-${c.id}-${k}`}>{k === 'photos' ? 'Photos' : 'Videos'}</label>
                  <select id={`dl-${c.id}-${k}`} className="select" value={c.delivery[k]} onChange={(e) => { const v = e.target.value as DeliveryState; update((s) => { s.clients[c.id].delivery[k] = v; }); audit(`${k} delivery → ${v}`, 'Production', c.id); if (v === 'Delivered') toast('Client notified that delivery is available (simulated).'); }}>
                    {(k === 'photos' ? ['Not Started', 'Processing', 'Delivered'] : ['Not Started', 'Editing', 'Delivered']).map((o) => <option key={o}>{o}</option>)}
                  </select></div>
              ))}
            </div>
            {pendingRush.length > 0 && <strong style={{ fontSize: 13, marginTop: 6 }}>Rush Requests</strong>}
            {pendingRush.map((r) => (
              <div key={r.id} className="minirow row between wrap">
                <div><strong>{r.type === 'photo' ? 'Photo' : 'Video'} Rush (+${r.fee})</strong><div className="note">Target {fmtFull(r.targetDue)} · requested {fmtStamp(r.requestedAt)}</div></div>
                {r.approval === 'Pending Review' ? (
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn sm" onClick={() => { update((s) => { const x = s.rush.find((y) => y.id === r.id)!; x.approval = 'Approved'; x.operator = 'Production Lead'; }); audit(`${r.type} rush approved (+$${r.fee}); deadline moved to ${r.targetDue}`, 'Production Lead', c.id); }}>Approve</button>
                    <button className="btn sm" onClick={() => { update((s) => { const x = s.rush.find((y) => y.id === r.id)!; x.approval = 'Declined'; x.operator = 'Production Lead'; }); audit(`${r.type} rush declined (not feasible)`, 'Production Lead', c.id); }}>Decline</button>
                  </div>
                ) : <Badge tone={r.approval === 'Approved' ? 'green' : 'gray'}>{r.approval}</Badge>}
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}

function IntegrationsAdmin() {
  const { state, update, audit } = useStore();
  const states: AdState[] = ['live', 'paused', 'payment_issue', 'restricted', 'stopped', 'unavailable'];
  return (
    <>
      <section className="card stack-sm">
        <h2 className="card-title">Ad Delivery Status</h2>
        <p className="card-sub">In production this is derived from Meta and Google Ads account, campaign and recent delivery data. Override here to preview each client-facing state.</p>
        {Object.values(state.clients).map((c) => (
          <div key={c.id} className="grid2 stack-mobile" style={{ alignItems: 'end' }}>
            {(['meta', 'google'] as const).map((k) => (
              <div className="field" key={k}><label htmlFor={`ad-${c.id}-${k}`}>{c.name}: {k === 'meta' ? 'Meta Ads' : 'Google Ads'}</label>
                <select id={`ad-${c.id}-${k}`} className="select" value={c.ads[k]} onChange={(e) => { const v = e.target.value as AdState; update((s) => { s.clients[c.id].ads[k] = v; s.clients[c.id].ads.checkedAt = new Date().toISOString(); }); audit(`${k === 'meta' ? 'Meta' : 'Google'} Ads status → ${AD_STATE[v].label}${AD_STATE[v].tone === 'red' ? ' (account manager notified)' : ''}`, 'Status Monitor', c.id); }}>
                  {states.map((s) => <option key={s} value={s}>{AD_STATE[s].label}</option>)}
                </select></div>
            ))}
          </div>
        ))}
      </section>
      <section className="card">
        <h2 className="card-title">Integration Adapters</h2>
        <p className="card-sub">Adapter layer ready for live connectors. None are connected in this demo.</p>
        <div className="table-wrap" style={{ marginTop: 10 }}>
          <table className="tbl"><thead><tr><th>Integration</th><th>Purpose</th><th>Status</th></tr></thead>
            <tbody>{ADAPTERS.map((a) => <tr key={a.key}><td><strong>{a.name}</strong></td><td className="note">{a.purpose}</td><td><Badge tone="gray">Demo Data</Badge></td></tr>)}</tbody></table>
        </div>
      </section>
    </>
  );
}

function SurveysAdmin() {
  const { state } = useStore();
  return (
    <section className="card stack-sm">
      <h2 className="card-title">Monthly NPS Responses</h2>
      <p className="card-sub">Scores of 6 or lower alert the assigned account manager (configurable threshold). Feedback is private.</p>
      {state.nps.length === 0 && <p className="note">No responses yet.</p>}
      {state.nps.map((n) => (
        <div key={n.id} className="minirow row between wrap">
          <div><strong>{state.clients[n.clientId]?.name}</strong> <span className="note">· {n.month}</span>{n.comment && <div className="note">“{n.comment}”</div>}</div>
          <div className="row" style={{ gap: 8 }}><span className="tnum" style={{ fontWeight: 700, fontSize: 18 }}>{n.score}</span>{n.score <= 6 ? <Badge tone="red">AM Alerted</Badge> : <Badge tone="green">Healthy</Badge>}</div>
        </div>
      ))}
    </section>
  );
}

function OnboardingAdmin() {
  const { state, update, audit, toast } = useStore();
  return (
    <>
      {state.onboarding.map((o) => {
        const done = o.checklist.every((c) => c.done);
        return (
          <section key={o.id} className="card stack-sm">
            <div className="row between"><h2 className="card-title">{o.name}</h2><Badge tone={o.activated ? 'green' : 'orange'}>{o.activated ? 'Active' : 'Onboarding'}</Badge></div>
            <p className="card-sub">One client record from onboarding to live. Every requirement must be complete before a CSR can activate.</p>
            {o.checklist.map((c, i) => (
              <label key={c.label} className="row" style={{ gap: 10, fontSize: 12.5 }}>
                <input type="checkbox" checked={c.done} disabled={o.activated} onChange={() => update((s) => { const x = s.onboarding.find((y) => y.id === o.id)!; x.checklist[i].done = !x.checklist[i].done; })} />{c.label}
              </label>
            ))}
            <button className="btn primary" disabled={!done || o.activated} onClick={() => { update((s) => { s.onboarding.find((y) => y.id === o.id)!.activated = true; }); audit('Client activated by CSR (manual Activate Client)', o.csr, o.id); toast(`${o.name} activated (demo).`); }}>{o.activated ? 'Client Activated' : 'Activate Client'}</button>
            {!done && <p className="note">Activate Client unlocks once every onboarding requirement is complete.</p>}
            <SimTag>Demonstration Flow, Not Connected to the Onboarding Codebase</SimTag>
          </section>
        );
      })}
    </>
  );
}
