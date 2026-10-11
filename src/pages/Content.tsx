import { useRef, useState } from 'react';
import { useStore } from '../store';
import { SHOOT_BADGE, deliveryDue, deliveryPending, fmtNum, shootStatus } from '../lib/derive';
import { fmtFull, fmtLong, monthName, todayIso } from '../lib/time';
import { Badge, Band, Ico, Modal, PageFoot, PageHeader, PostThumb, SimTag, Tabs, useInfo } from '../components/ui';
import { useContactPhotographer } from '../components/shared';
import type { LibraryMonth } from '../data/types';

const TABS = ['Upcoming Activity', 'Content Library'] as const;
type TabT = typeof TABS[number];

/** Approved client-safe Shoot Plan (illustrative content). */
export function ShootPlanModal() {
  const { client, closeModal } = useStore();
  return (
    <Modal title="Approved Shoot Plan" sub={`${client.name} | ${client.shoot.date ? fmtFull(client.shoot.date) : ''} | ${client.shoot.time ?? ''}`} wide>
      <div><Badge tone="green">Approved Version</Badge> <SimTag>Sample plan content</SimTag></div>
      <div className="report-doc stack-sm">
        <h4>Deliverables</h4>
        <p className="note" style={{ color: 'var(--ink)' }}>24 edited photos and 2 short-form videos (Reels/TikTok format).</p>
        <h4>Shot List</h4>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>
          <li>Signature dish hero shots (3 dishes)</li><li>Seasonal special close-ups</li><li>Cocktail pour video</li><li>Kitchen action and team moments</li><li>Dining room ambiance</li>
        </ul>
        <h4>Arrival and Setup</h4>
        <p className="note" style={{ color: 'var(--ink)' }}>Photographer arrives 15 minutes early. Please have featured dishes ready to plate on cue.</p>
      </div>
      <div className="callout-orange">Request changes at least 1 full day before the shoot. Deliverable counts stay the same; comparable items may be substituted.</div>
      <button className="btn block" onClick={closeModal}>Close</button>
    </Modal>
  );
}

export function useShootDetails() {
  const { openModal, closeModal, client } = useStore();
  return () => openModal(
    <Modal title="Shoot Details" sub="Upcoming Content Shoot">
      <div className="grid2 stack-mobile">
        <div className="metric"><div className="lbl">Date</div><div style={{ fontWeight: 700, marginTop: 4 }}>{client.shoot.date ? fmtFull(client.shoot.date) : 'Not confirmed'}</div></div>
        <div className="metric"><div className="lbl">Time</div><div style={{ fontWeight: 700, marginTop: 4 }}>{client.shoot.time ?? 'Not confirmed'}</div></div>
        <div className="metric"><div className="lbl">Type</div><div style={{ fontWeight: 700, marginTop: 4 }}>{client.shoot.type}</div></div>
        <div className="metric"><div className="lbl">Location</div><div style={{ fontWeight: 700, marginTop: 4 }}>{client.shoot.location}</div></div>
      </div>
      <p className="note">Photographer: your assigned photographer. Confirmed with you and the photographer.</p>
      <button className="btn block" onClick={closeModal}>Close</button>
    </Modal>,
  );
}

/** Three shoot actions in approved order: Contact Your Photographer, See Shoot Plan / Shoot Plan Pending, Prepare for Your Shoot. */
export function ShootActions({ onPrepare }: { onPrepare: () => void }) {
  const { client, state, openModal } = useStore();
  const contactPH = useContactPhotographer();
  const info = useInfo();
  const ss = shootStatus(client, state);
  const planReady = ss === 'scheduled' && client.shoot.planShared;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,.9fr) minmax(0,1.4fr)', gap: 8 }} className="shoot-actions">
      <button className="btn" onClick={contactPH}>Contact Your Photographer</button>
      {planReady ? <button className="btn" onClick={() => openModal(<ShootPlanModal />)}>See Shoot Plan</button>
        : <button className="btn" aria-disabled="true" onClick={() => info('Shoot Plan Pending', <p>Your Shoot Plan isn't available yet. Plans are usually sent 5 Business Days before the shoot (except last-minute bookings). This timing is guidance, not a guarantee.</p>, { sim: false })} style={{ color: 'var(--ink)' }}>Shoot Plan Pending</button>}
      <button className="btn" onClick={onPrepare}>Prepare for Your Shoot</button>
    </div>
  );
}

export default function Content() {
  const { tab, setTab } = useStore();
  const current = tab('content', 'Upcoming Activity') as TabT;
  return (
    <>
      <PageHeader title="Content Shoot & Library" sub="Your upcoming shoot, delivery, and creative history." />
      <Tabs label="Content Shoot & Library sections" items={[...TABS]} value={current} onChange={(t) => setTab('content', t)} />
      {current === 'Upcoming Activity' ? <Upcoming /> : <Library />}
      <PageFoot left="RMG OS / Content Shoot & Library / Sample data" right={`Tab ${current === 'Upcoming Activity' ? 1 : 2} / 2`} />
    </>
  );
}

function Upcoming() {
  const { client, state } = useStore();
  const prepRef = useRef<HTMLDivElement>(null);
  const ss = shootStatus(client, state);
  const sb = SHOOT_BADGE[ss];
  const contactPH = useContactPhotographer();
  return (
    <>
      <section className="card">
        <div className="card-head">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <Ico lg>C</Ico>
            <div>
              <h2 className="card-title" style={{ fontSize: 18 }}>Upcoming Content Shoot</h2>
              {ss === 'scheduled' && <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{fmtFull(client.shoot.date!)}  |  {client.shoot.time}</div>}
              {ss === 'pending' && <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: 'var(--orange-text)' }}>Confirm with your photographer</div>}
              {ss === 'overdue' && <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: 'var(--red-text)' }}>Respond to your photographer</div>}
              {ss === 'none' && <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: 'var(--muted)' }}>No upcoming shoot scheduled</div>}
              <div className="note" style={{ marginTop: 6 }}>{client.shoot.type}  |  {ss === 'scheduled' ? client.shoot.location : ss === 'pending' ? 'Date/time not confirmed' : ss === 'overdue' ? 'Scheduling deadline missed' : 'Contact your photographer to schedule'}</div>
            </div>
          </div>
          <Badge tone={sb.tone}>{sb.label}</Badge>
        </div>
        <hr className="divider" />
        <ShootActions onPrepare={() => prepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
        <p className="note" style={{ marginTop: 6, fontSize: 10.5 }}>Shoot Plans are usually sent 5 Business Days before the shoot (except last-minute bookings).</p>
        {ss !== 'scheduled' && ss !== 'none' && <button className="linkbtn" style={{ marginTop: 6 }} onClick={contactPH}>Contact Photographer &gt;</button>}
      </section>

      {deliveryPending(client) && <Delivery />}

      <div ref={prepRef} style={{ scrollMarginTop: 70 }}><Band title="Before Your Next Content Shoot" /></div>
      <Prep />
    </>
  );
}

function Delivery() {
  const { client, state, update, openModal, closeModal, toast, nextId } = useStore();
  const due = deliveryDue(client);
  const today = todayIso();
  const rushFor = (type: 'photo' | 'video') => state.rush.find((r) => r.clientId === client.id && r.type === type && r.approval !== 'Declined');

  const card = (type: 'photo' | 'video') => {
    const isPhoto = type === 'photo';
    const st = isPhoto ? client.delivery.photos : client.delivery.videos;
    const delivered = st === 'Delivered';
    const rush = rushFor(type);
    const rushTarget = isPhoto ? due.photoRush : due.videoRush;
    const feasible = rushTarget > today; // Rush window must still be achievable.
    const expected = rush?.approval === 'Approved' ? rush.targetDue : isPhoto ? due.photoStd : due.videoStd;
    return (
      <div className="card" key={type}>
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div className="row"><Ico lg>{isPhoto ? 'P' : 'V'}</Ico><h3 style={{ fontSize: 18 }}>{isPhoto ? 'Photos' : 'Videos'}</h3></div>
          <Badge tone={delivered ? 'green' : 'orange'}>{st}</Badge>
        </div>
        <p className="note" style={{ marginTop: 12 }}>Standard Turnaround</p>
        <p style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{isPhoto ? '2 Business Days' : '5 Business Days'}</p>
        <p style={{ fontSize: 12, marginTop: 6 }}>{delivered ? 'Delivered — see the Content Library' : `Expected: ${fmtLong(expected)}`}{rush?.approval === 'Approved' && !delivered ? ' (rush approved)' : ''}</p>
        <hr className="divider" />
        <p style={{ fontWeight: 700, fontSize: 12.5 }}>Rush: {isPhoto ? '1 Business Day' : '3 Business Days'}</p>
        <p className="note" style={{ fontSize: 10.5, marginTop: 4 }}>Subject to approval and feasibility</p>
        {delivered ? null : rush ? (
          <button className="btn block" style={{ marginTop: 14 }} aria-disabled="true">Rush {rush.approval === 'Approved' ? 'Approved' : 'Requested | Pending Review'}</button>
        ) : (
          <button className="btn block" style={{ marginTop: 14 }} disabled={!feasible} title={feasible ? undefined : 'The rush window can no longer be achieved'}
            onClick={() => openModal(
              <Modal title={`Request ${isPhoto ? 'Photo' : 'Video'} Rush`} sub={`${isPhoto ? '1 Business Day' : '3 Business Days'} | +$${isPhoto ? 50 : 100}`}>
                <p>Requested rush delivery: <strong>{fmtLong(rushTarget)}</strong> instead of {fmtLong(isPhoto ? due.photoStd : due.videoStd)}.</p>
                <div className="callout-orange">Rush requests need RMG feasibility review and confirmation. You won't be charged and the deadline won't change unless RMG approves the rush.</div>
                <button className="btn primary block" onClick={() => {
                  const id = nextId('RUSH');
                  update((s) => { s.rush.push({ id, clientId: s.clientId, type, fee: isPhoto ? 50 : 100, requestedAt: new Date().toISOString(), targetDue: rushTarget, approval: 'Pending Review' }); });
                  closeModal(); toast('Rush request sent for RMG review.');
                }}>Send Rush Request for Review</button>
                <button className="btn block" onClick={closeModal}>Cancel</button>
              </Modal>,
            )}>{feasible ? `Request ${isPhoto ? 'Photo' : 'Video'} Rush  |  $${isPhoto ? 50 : 100}` : 'Rush No Longer Available'}</button>
        )}
      </div>
    );
  };

  return (
    <>
      <Band title="Content Delivery & Rush Requests" tag="Hide when nothing is pending" />
      <div className="grid2 stack-mobile">{card('photo')}{card('video')}</div>
      <div className="panel-blue" style={{ padding: 12, fontSize: 12 }}>Photo and video delivery statuses are independent. This entire section automatically disappears once every required delivery is completed.</div>
    </>
  );
}

function Prep() {
  const { openModal, toast } = useStore();
  const info = useInfo();
  const share = async () => {
    const link = 'https://portal.rmg.example/guides/content-guide (secure, client-scoped)';
    try { await navigator.clipboard.writeText(link); toast('Secure Content Guide link copied.'); }
    catch { info('Share Content Guide', <><p>Copy this secure link to share the approved Content Guide with your team:</p><input className="input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} /></>, { sim: 'Secure share link simulated' }); }
  };
  const guide = () => info('Content Guide', (
    <div className="report-doc stack-sm">
      <h4>Before the Shoot</h4><p className="note" style={{ color: 'var(--ink)' }}>Review your Shoot Plan, prep featured dishes, and make sure your team knows the schedule.</p>
      <h4>On Shoot Day</h4><p className="note" style={{ color: 'var(--ink)' }}>Clean, well-lit tables; dishes plated on cue; staff available for team shots.</p>
      <h4>After the Shoot</h4><p className="note" style={{ color: 'var(--ink)' }}>Photos in 2 business days, videos in 5. Delivered through secure Google Drive folders.</p>
    </div>
  ), { sim: 'Approved guide content illustrative' });
  const policies = () => info('Cancellation Policies', (
    <>
      <p>Please cancel at least 7 days in advance to avoid cancellation fees.</p>
      <p className="note">Fee amounts for cancellations inside 7 days come from your service agreement. Reviewed during your Launch Call and available anytime in Account &amp; Settings.</p>
    </>
  ), { sim: false });
  const items: { n: number; title: string; body: string; actions: { label: string; fn: () => void }[] }[] = [
    { n: 1, title: 'Review Shoot Plan', body: 'Review your Shoot Plan and request changes at least 1 full day before the shoot. Keep deliverable counts the same; comparable items may be substituted.', actions: [{ label: 'See Shoot Plan', fn: () => openModal(<ShootPlanModal />) }, { label: 'Print Shoot Plan', fn: () => openModal(<PrintPlan />) }] },
    { n: 2, title: 'Prepare for the Shoot', body: 'Read the Content Guide ahead of time to understand the process and requirements.', actions: [{ label: 'Read Content Guide', fn: guide }] },
    { n: 3, title: 'Prepare Your Team', body: 'Make sure your entire team knows about the shoot so they can best prepare.', actions: [{ label: 'Share Content Guide', fn: share }] },
    { n: 4, title: 'Cancellations', body: 'Please cancel at least 7 days in advance to avoid cancellation fees.', actions: [{ label: 'View Cancellation Policies', fn: policies }] },
  ];
  return (
    <section className="card">
      {items.map((it) => (
        <div key={it.n} className="list-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Ico lg>{it.n}</Ico>
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <div className="t" style={{ fontSize: 14 }}>{it.title}</div>
            <div className="s" style={{ fontSize: 11.5, marginTop: 4 }}>{it.body}</div>
          </div>
          <div className="row wrap" style={{ gap: 8, marginLeft: 'auto', alignSelf: 'center', justifyContent: 'flex-end' }}>
            {it.actions.map((a) => <button key={a.label} className="btn" style={{ minWidth: 130 }} onClick={a.fn}>{a.label}</button>)}
          </div>
        </div>
      ))}
    </section>
  );
}

function PrintPlan() {
  const { closeModal } = useStore();
  return (
    <Modal title="Print Shoot Plan">
      <SimTag>Print-friendly PDF in production</SimTag>
      <p>In production this opens the print-friendly PDF of the approved Shoot Plan version. Drafts are never printed. This demo frame can't open the browser print dialog.</p>
      <button className="btn block" onClick={closeModal}>Close</button>
    </Modal>
  );
}

function Library() {
  const { client } = useStore();
  const latestDelivered = client.library.find((m) => m.status === 'Delivered');
  const [open, setOpen] = useState<string | null>(latestDelivered ? `${latestDelivered.year}-${latestDelivered.month}` : null);
  const months = client.library;
  const first = months[months.length - 1];
  return (
    <>
      <Band title="Content Library & Shoot History" tag={months.length ? `${monthName(first.month)} - ${monthName(months[0].month)} ${months[0].year}` : ''} />
      {months.length === 0 && <div className="card note">No shoots yet. Your monthly history appears here after your first content shoot.</div>}
      {months.map((m) => <MonthRow key={`${m.year}-${m.month}`} m={m} expanded={open === `${m.year}-${m.month}`} onToggle={() => setOpen(open === `${m.year}-${m.month}` ? null : `${m.year}-${m.month}`)} />)}
      <div className="panel-blue" style={{ padding: 12, fontSize: 12 }}>All previous months start collapsed; only the latest completed month opens by default. Photos and Videos link to secure Google Drive folders, not a native RMG OS gallery.</div>
    </>
  );
}

function MonthRow({ m, expanded, onToggle }: { m: LibraryMonth; expanded: boolean; onToggle: () => void }) {
  const { client } = useStore();
  const info = useInfo();
  const name = `${monthName(m.month)} ${m.year}`;
  const drive = (kind: 'Photos' | 'Videos') => info(`${name} ${kind}`, (
    <>
      <p>This opens the secure, client-scoped Google Drive folder for {client.name}'s {name} {kind.toLowerCase()}{m.shoots > 1 ? '. This month had multiple shoots, so choose a shoot folder:' : '.'}</p>
      {m.shoots > 1 && <div className="stack-sm">{Array.from({ length: m.shoots }, (_, i) => <button key={i} className="btn">Shoot {i + 1} {kind} Folder</button>)}</div>}
      <p className="note">Access is verified server-side for your account. RMG OS doesn't host a gallery, player or ZIP export.</p>
    </>
  ), { sim: 'Google Drive folder simulated' });
  const summary = m.status === 'In Progress' ? `${m.shoots} Shoot${m.shoots === 1 ? '' : 's'}  |  Delivery in Progress`
    : `${m.shoots} Shoot${m.shoots === 1 ? '' : 's'}  |  Delivered${expanded && m.photos ? `  |  ${m.photos} Photos + ${m.videos} Videos` : ''}`;
  const buttons = (
    <div className="row" style={{ gap: 8 }}>
      <button className="btn sm" style={{ minWidth: 92 }} disabled={!m.photosReady} onClick={() => drive('Photos')}>See Photos</button>
      <button className="btn sm" style={{ minWidth: 92 }} disabled={!m.videosReady} onClick={() => drive('Videos')}>See Videos</button>
    </div>
  );
  return (
    <section className="card tight">
      <div className="row wrap" style={{ gap: 12 }}>
        <span className="month-num">{String(m.month).padStart(2, '0')}</span>
        <div style={{ flex: '1 1 150px', minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: expanded ? 17 : 14 }}>{name}</div>
          <div className="note" style={{ fontSize: 11 }}>{summary}</div>
        </div>
        {m.status === 'In Progress' && <Badge tone="orange">In Progress</Badge>}
        {expanded && m.status === 'Delivered' && <Badge tone="green">Delivered</Badge>}
        {!expanded && <div className="row wrap" style={{ gap: 10, marginLeft: 'auto' }}>{buttons}<button className="linkbtn" aria-expanded={false} onClick={onToggle}>Top Creative v</button></div>}
      </div>
      {m.status === 'In Progress' && !expanded && <p className="note" style={{ fontSize: 10, marginTop: 6 }}>Unavailable Until Delivered</p>}
      {expanded && (
        <>
          <hr className="divider" />
          <h3 style={{ fontSize: 14 }}>Top 3 Performing Creative</h3>
          <p className="note" style={{ fontSize: 11 }}>Only creative captured in {monthName(m.month)} shoots, even if published later.</p>
          {Array.isArray(m.top) ? (
            <div className="grid3" style={{ marginTop: 10 }}>
              {m.top.map((c) => (
                <button key={c.rank} className="minirow" style={{ padding: 6, textAlign: 'left', background: '#fff' }} onClick={() => info(`#${c.rank} ${c.title}`, <p>{fmtNum(c.engagements)} verified engagements on {c.platform}. Opens the published post.</p>, { sim: 'Opens published post in production' })}>
                  <PostThumb tone={c.tone} label={null} />
                  <div style={{ fontWeight: 700, fontSize: 11.5, marginTop: 6 }}>#{c.rank} {c.title}</div>
                  <div className="note" style={{ fontSize: 10.5 }}>{fmtNum(c.engagements)} Engagements · {c.platform}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="minirow note" style={{ marginTop: 10 }}>{m.top === 'awaiting' ? (m.status === 'In Progress' ? 'Unavailable until delivered and published.' : 'Awaiting Analytics: this month’s creative has not been published long enough to rank.') : 'Unavailable: social analytics mapping for this month is not available. No ranking is shown rather than an estimate.'}</div>
          )}
          <div className="row between wrap" style={{ marginTop: 14, gap: 10 }}>{buttons}<button className="linkbtn" aria-expanded onClick={onToggle}>Top Creative ^</button></div>
        </>
      )}
    </section>
  );
}
