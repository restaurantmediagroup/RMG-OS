import { useState } from 'react';
import { useStore } from '../store';
import { AD_STATE, SHOOT_BADGE, fmtNum, shootStatus } from '../lib/derive';
import { fmtFull, fmtMonthDay, greeting, officeStatus } from '../lib/time';
import { useRequestsNav } from '../lib/nav';
import { Badge, BrandMark, Ico, PageFoot, SimTag, useInfo } from '../components/ui';
import { BusinessHoursPanel, EmergencyGuidance, useContactAM, useContactPhotographer } from '../components/shared';
import { ShootActions, useShootDetails } from './Content';
import type { AdState } from '../data/types';

export default function Home() {
  const { state, client, openModal, go } = useStore();
  const nav = useRequestsNav();
  const info = useInfo();
  const contactAM = useContactAM();
  const contactPH = useContactPhotographer();
  const shootDetails = useShootDetails();
  const [hoursOpen, setHoursOpen] = useState(false);
  const now = new Date();
  const office = officeStatus(now, state.officeOverride);
  const ss = shootStatus(client, state);
  const sb = SHOOT_BADGE[ss];
  const holidayDone = client.actionItems.length === 0;

  const shootLine = ss === 'scheduled' ? `${fmtFull(client.shoot.date!).replace(/, (\d{4})$/, ', $1')}  |  ${client.shoot.time}`
    : ss === 'pending' ? 'Confirm with your photographer' : ss === 'overdue' ? 'Respond to your photographer' : 'No shoot scheduled yet';
  const shootSub = ss === 'scheduled' ? `${client.shoot.type}  |  ${client.shoot.location}` : ss === 'pending' ? `${client.shoot.type}  |  Date/time not confirmed` : ss === 'overdue' ? `${client.shoot.type}  |  Scheduling deadline missed` : 'Contact your photographer to schedule';

  return (
    <>
      <header className="home-header">
        <div style={{ minWidth: 0 }}>
          <BrandMark />
          <h1>{greeting(now)}</h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.85)', marginTop: 8 }}>Your restaurant's marketing at a glance</p>
        </div>
        <div className="hours-col stack-sm" style={{ alignItems: 'stretch', flexShrink: 0 }}>
          <div className="hours-card">
            <div className="st"><span className={`statusdot ${office.open ? 'green' : 'red'}`} />{office.open ? 'RMG is Open' : 'RMG is Closed'}</div>
            <div style={{ color: 'var(--muted)' }}>{office.todayLabel}</div>
            {!office.open && <div style={{ fontWeight: 700, marginTop: 2 }}>{office.nextOpening}</div>}
            <button className="linkbtn" style={{ color: 'var(--ink)', fontSize: 10.5, marginTop: 6 }} aria-expanded={hoursOpen} onClick={() => setHoursOpen(!hoursOpen)}>View full business hours {hoursOpen ? '^' : 'v'}</button>
            {hoursOpen && <div style={{ marginTop: 8 }}><BusinessHoursPanel /></div>}
          </div>
          {!office.open && (
            <>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 11.5, textAlign: 'center', marginTop: 4 }}>Off-hours emergency?</div>
              <button className="emergency-btn" onClick={() => openModal(<EmergencyGuidance />)}>Click Here &nbsp;&gt;</button>
            </>
          )}
        </div>
      </header>

      <div className="grid2">
        <KPI label="Website Visits" m={client.kpi.visits} onClick={() => go('performance', 'Digital Marketing Snapshot')} />
        <KPI label="Reservations" m={client.kpi.reservations} onClick={() => go('performance', 'Revenue Snapshot')} />
      </div>

      <section className="card">
        <div className="row between"><h2 className="card-title">Your RMG Team</h2><span className="note">Quick contact</span></div>
        <div style={{ marginTop: 6 }}>
          <div className="list-row"><Ico round lg>AM</Ico><div><div className="t">Account Manager</div><div className="s">Marketing &amp; support</div></div><button className="btn" style={{ marginLeft: 'auto', minWidth: 80 }} onClick={contactAM}>Contact</button></div>
          <div className="list-row"><Ico round lg>PH</Ico><div><div className="t">Photographer</div><div className="s">Photoshoot scheduling</div></div><button className="btn" style={{ marginLeft: 'auto', minWidth: 80 }} onClick={contactPH}>Contact</button></div>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <button className="row" style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', alignItems: 'flex-start' }} onClick={() => (ss === 'scheduled' ? shootDetails() : contactPH())}>
            <Ico lg>C</Ico>
            <div>
              <h2 className="card-title" style={{ fontSize: 18 }}>Upcoming Content Shoot</h2>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: ss === 'overdue' ? 'var(--red-text)' : ss === 'pending' ? 'var(--orange-text)' : 'var(--ink)' }}>{shootLine}</div>
              <div className="note" style={{ marginTop: 6 }}>{shootSub}</div>
            </div>
          </button>
          <Badge tone={sb.tone} dot>{sb.label}</Badge>
        </div>
        <hr className="divider" />
        <ShootActions onPrepare={() => go('content', 'Upcoming Activity')} />
        <p className="note" style={{ marginTop: 8, fontSize: 10.5 }}>Shoot Plans are usually sent 5 Business Days before the shoot (except last-minute bookings).</p>
      </section>

      <section className="card">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 className="card-title">Meetings</h2>
            {client.meetings.length === 0 && <p className="note" style={{ marginTop: 0, fontSize: 12.5 }}>You have no upcoming meetings scheduled.</p>}
          </div>
          <button className="btn" style={{ minWidth: 150 }} onClick={() => nav('meeting')}>Request a Meeting</button>
        </div>
        {client.meetings.map((m) => (
          <div key={m.id} className="minirow row between" style={{ marginTop: 12 }}>
            <div><div style={{ fontWeight: 700 }}>Upcoming Meeting: {m.title}</div><div className="note">{fmtFull(m.date)} · {m.time} ET · with your {m.with}</div></div>
            <Badge tone="green">Booked</Badge>
          </div>
        ))}
        <div style={{ height: client.meetings.length ? 0 : 22 }} />
      </section>

      {holidayDone ? (
        <section className="card row between">
          <div><h2 className="card-title">Action Needed</h2><p className="note">You're all caught up. No outstanding forms.</p></div>
          <Badge tone="green">All Clear</Badge>
        </section>
      ) : (
        <section className="card">
          <div className="row between"><h2 className="card-title">Action Needed</h2><Badge tone="orange">{client.actionItems.length} Pending</Badge></div>
          {client.actionItems.map((a) => (
            <div key={a.id} style={{ marginTop: 14, paddingLeft: 2 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
              <p className="note" style={{ fontSize: 12.5, marginTop: 4 }}>{a.desc}</p>
              <p className="note" style={{ fontSize: 10.5, marginTop: 4 }}>Due date: {fmtMonthDay(a.due)}</p>
              <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => nav('holiday')}>Complete Holiday Form &nbsp;&gt;</button>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2 className="card-title">Marketing Activity</h2>
        <button className="list-row" onClick={() => client.latestPost && info('Latest Published Post', (
          <>
            <p><strong>{client.latestPost.title}</strong> · {client.latestPost.platform}</p>
            <p className="note">Published {fmtFull(client.latestPost.publishedOn)}. This link opens the already-public post on {client.latestPost.platform}. Drafts, planned and scheduled posts are never shown in RMG OS.</p>
          </>
        ), { sim: 'Opens public post in production' })}>
          <span className={`statusdot ${client.latestPost ? 'green' : 'gray'}`} />
          <div><div className="t">Latest social post published</div><div className="s">View published marketing activity</div></div>
          <span className="chev">&gt;</span>
        </button>
        <hr className="divider" style={{ margin: '6px 0 12px' }} />
        <div className="grid2 stack-mobile">
          <AdCard name="Social Ads" platform="Meta" state={client.ads.meta} />
          <AdCard name="Google Ads" platform="Google Ads" state={client.ads.google} />
        </div>
        <hr className="divider" />
        <button className="minirow" style={{ width: '100%', textAlign: 'left' }} onClick={() => (ss === 'scheduled' ? go('content', 'Upcoming Activity') : contactPH())}>
          <div className="row between"><strong style={{ fontSize: 13.5 }}>Upcoming Content Shoot</strong><Badge tone={sb.tone} dot>{sb.label}</Badge></div>
          <div className="row between">
            <div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: ss === 'scheduled' ? 'var(--muted)' : ss === 'overdue' ? 'var(--red-text)' : 'var(--orange-text)', fontWeight: ss === 'scheduled' ? 400 : 700 }}>
                {ss === 'scheduled' ? `${fmtMonthDay(client.shoot.date!)}  -  ${client.shoot.time}` : ss === 'none' ? 'No shoot scheduled' : shootLine}
              </div>
              <div className="note" style={{ marginTop: 6, fontSize: 11 }}>
                {ss === 'scheduled' ? 'Your content shoot is confirmed.' : ss === 'pending' ? 'Date/time not yet confirmed | Contact Photographer >' : ss === 'overdue' ? 'Scheduling deadline missed | Contact Photographer >' : 'Contact Photographer >'}
              </div>
            </div>
            <span className="chev note">&gt;</span>
          </div>
        </button>
      </section>

      <section className="card">
        <h2 className="card-title">Need Something From RMG?</h2>
        <p className="note" style={{ maxWidth: 420 }}>Submit requests, attachments and feedback; review response times and emergency guidelines in one place.</p>
        <button className="btn primary block" style={{ marginTop: 14 }} onClick={() => nav('main', { tab: 'Current Requests' })}>Request Center &nbsp;&gt;</button>
      </section>
      <PageFoot left={`Demo data | All values are examples | Shoot status: ${sb.label}`} />
    </>
  );
}

function KPI({ label, m, onClick }: { label: string; m: { value: number | null; change?: number }; onClick: () => void }) {
  return (
    <button className="card" style={{ textAlign: 'left' }} onClick={onClick}>
      <div className="note" style={{ fontSize: 12.5 }}>{label}</div>
      {m.value === null ? (
        <><div style={{ fontSize: 17, fontWeight: 700, marginTop: 10, color: 'var(--muted)' }}>Unavailable</div><div className="note" style={{ marginTop: 8, fontSize: 11 }}>Not connected or not yet verified</div></>
      ) : (
        <><div className="big-number" style={{ marginTop: 6 }}>{fmtNum(m.value)}</div>{m.change !== undefined && <div style={{ color: 'var(--green-text)', fontSize: 11, marginTop: 8 }}>+ +{m.change}%</div>}</>
      )}
    </button>
  );
}

function AdCard({ name, platform, state }: { name: string; platform: string; state: AdState }) {
  const info = useInfo();
  const s = AD_STATE[state];
  const critical = s.tone === 'red';
  return (
    <button className="minirow" style={{ textAlign: 'left', borderColor: critical ? '#f4c3c9' : undefined, background: critical ? 'var(--red-soft)' : undefined }} onClick={() => info(`${name} Status`, (
      <>
        <div className="row"><span className={`statusdot ${s.tone}`} /><strong>{s.label}</strong></div>
        <p className="note">{state === 'live' ? `Verified from the connected ${platform} account: campaigns are enabled and delivered recently.` : state === 'unavailable' ? `RMG can't verify ${platform} delivery right now, so this is never shown as Live.` : s.sub}</p>
        {state === 'payment_issue' && (
          <>
            <div className="callout-red">A billing problem has stopped delivery. Resolve it directly in {platform}'s official billing page for your ad account. RMG OS never collects card details. Your account manager has been notified.</div>
            <button className="btn danger block">Resolve in {platform} Billing</button>
            <SimTag>Verified provider billing link in production</SimTag>
          </>
        )}
        <p className="note">Last checked {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Status is derived from account, campaign and recent delivery data.</p>
      </>
    ), { sim: false })}>
      <div className="row" style={{ gap: 8 }}><span className={`statusdot ${s.tone}`} /><strong style={{ fontSize: 13 }}>{name}</strong></div>
      <div className="note" style={{ marginLeft: 18, fontSize: 10.5, marginTop: 2, color: critical ? 'var(--red-text)' : undefined }}>{s.label}  -  {s.sub}</div>
    </button>
  );
}
