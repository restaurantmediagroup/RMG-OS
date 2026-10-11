import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { useRequestsNav } from '../lib/nav';
import { OPEN_STATUSES, type Attachment } from '../data/types';
import { TURNAROUND_TEXT, EMERGENCY_ROUTING } from '../data/catalog';
import { Badge, FileInput, Ico, ListRow, Modal, PageFoot, PageHeader, SimTag, Toggle, useInfo, RmgAvatar } from '../components/ui';
import { BusinessHoursPanel, Field } from '../components/shared';

type Screen = 'overview' | 'business' | 'services' | 'preferences' | 'policy-hours' | 'policy-requests' | 'policy-shoot';

const HEAD: Record<Screen, { title: string; sub: string; crumb?: string }> = {
  overview: { title: 'Account & Settings', sub: 'Manage your restaurant information, services, and account preferences.' },
  business: { title: 'Business Information', sub: 'Verified restaurant information and authorized contacts.', crumb: 'Business & Account / Details' },
  services: { title: 'My Services & Resources', sub: 'Understand your active services and access approved account materials.', crumb: 'Business & Account / Policies & Resources' },
  preferences: { title: 'Preferences & Security', sub: 'Control approved notifications and manage secure portal access.', crumb: 'Preferences & Security / Settings' },
  'policy-hours': { title: 'Business Hours & Emergencies', sub: 'RMG availability and urgent assistance.', crumb: 'Policies & Resources / Policy' },
  'policy-requests': { title: 'Request Guidelines & Turnaround Times', sub: 'How requests are submitted and handled.', crumb: 'Policies & Resources / Policy' },
  'policy-shoot': { title: 'Content & Shoot Policies', sub: 'Preparation, delivery, and cancellations.', crumb: 'Policies & Resources / Policy' },
};

export default function Account() {
  const { state, update } = useStore();
  const screen = (state.tabs['account:screen'] as Screen) || 'overview';
  const anchor = state.tabs['account:anchor'] || '';
  const open = (s: Screen, a = '') => { update((st) => { st.tabs['account:screen'] = s; st.tabs['account:anchor'] = a; }); if (!a) window.scrollTo({ top: 0 }); };
  const h = HEAD[screen];
  return (
    <>
      <PageHeader title={h.title} sub={h.sub} />
      {screen !== 'overview' && (
        <div className="row between wrap" style={{ padding: '0 2px' }}>
          <button className="linkbtn" style={{ color: 'var(--ink)' }} onClick={() => open(screen.startsWith('policy') ? 'services' : 'overview')}>&lt;&nbsp; Back to {screen.startsWith('policy') ? 'My Services & Resources' : 'Account & Settings'}</button>
          {h.crumb && <span className="note" style={{ fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', fontSize: 10.5 }}>{h.crumb}</span>}
        </div>
      )}
      {screen === 'overview' && <Overview open={open} />}
      {screen === 'business' && <Business anchor={anchor} />}
      {screen === 'services' && <Services open={open} anchor={anchor} />}
      {screen === 'preferences' && <Preferences anchor={anchor} />}
      {screen === 'policy-hours' && <PolicyHours />}
      {screen === 'policy-requests' && <PolicyRequests />}
      {screen === 'policy-shoot' && <PolicyShoot />}
      <p className="note" style={{ padding: '0 8px', fontSize: 10.5 }}>Illustrative account data - exact services and contacts come from the client record.</p>
      <PageFoot left="RMG OS | Account & Settings | Demo data" />
    </>
  );
}

function useAnchor(anchor: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (anchor && ref.current) ref.current.scrollIntoView({ block: 'start' }); }, [anchor]);
  return ref;
}

function Overview({ open }: { open: (s: Screen, a?: string) => void }) {
  const { client } = useStore();
  return (
    <>
      <section className="card">
        <div className="row" style={{ alignItems: 'flex-start', gap: 16 }}>
          <Ico lg>{client.initial}</Ico>
          <div><h2 style={{ fontSize: 20 }}>{client.name}</h2><p className="note" style={{ marginTop: 4 }}>{client.packageName}</p><div style={{ marginTop: 10 }}><Badge tone="green">Active Account</Badge></div></div>
        </div>
        <hr className="divider" />
        <div className="row between" style={{ fontSize: 12 }}><span className="note">Account Status</span><strong>{client.accountStatus}</strong></div>
      </section>
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 16 }}>Business & Account</h2>
        <div style={{ marginTop: 6 }}>
          <ListRow icon={<Ico lg>B</Ico>} title="Business Information" sub="Restaurant details, hours, and locations" onClick={() => open('business')} />
          <ListRow icon={<Ico lg>C</Ico>} title="Contacts & Team" sub="Authorized contacts and assigned RMG team" onClick={() => open('business', 'contacts')} />
          <ListRow icon={<Ico lg>S</Ico>} title="My Services" sub="Active marketing services and package" onClick={() => open('services')} />
        </div>
      </section>
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 16 }}>Policies & Resources</h2>
        <div style={{ marginTop: 6 }}>
          <ListRow icon={<Ico lg>H</Ico>} title="Business Hours & Emergencies" sub="RMG availability and urgent assistance" onClick={() => open('policy-hours')} />
          <ListRow icon={<Ico lg>R</Ico>} title="Request Guidelines & Turnaround Times" sub="How requests are submitted and handled" onClick={() => open('policy-requests')} />
          <ListRow icon={<Ico lg>P</Ico>} title="Content & Shoot Policies" sub="Preparation, delivery, and cancellations" onClick={() => open('policy-shoot')} />
          <ListRow icon={<Ico lg>D</Ico>} title="Documents & Agreements" sub="Important account records and policies" onClick={() => open('services', 'documents')} />
        </div>
      </section>
      <section className="card">
        <h2 className="card-title" style={{ fontSize: 16 }}>Preferences & Security</h2>
        <div style={{ marginTop: 6 }}>
          <ListRow icon={<Ico lg>N</Ico>} title="Notification Preferences" sub="Email, text, and portal alerts" onClick={() => open('preferences')} />
          <ListRow icon={<Ico lg>L</Ico>} title="Login & Security" sub="Password and account access" onClick={() => open('preferences', 'security')} />
        </div>
      </section>
    </>
  );
}

const INFO_FIELDS = ['Business Name', 'Location', 'Phone', 'Website', 'Regular Hours'] as const;

function Business({ anchor }: { anchor: string }) {
  const { client, state, openModal } = useStore();
  const info = useInfo();
  const nav = useRequestsNav();
  const contactsRef = useAnchor(anchor === 'contacts' ? 'contacts' : '');
  const [draft, setDraft] = useState('');
  const pending = state.requests.filter((r) => r.clientId === client.id && r.kind === 'info-change' && OPEN_STATUSES.includes(r.status));
  const values: Record<string, string> = { 'Business Name': client.name, Location: client.location, Phone: client.phone, Website: client.website, 'Regular Hours': 'See verified business hours' };
  return (
    <>
      <section className="card">
        <h2 className="card-title">Restaurant Information</h2>
        <div style={{ marginTop: 6 }}>
          {INFO_FIELDS.map((f) => {
            const p = pending.find((r) => r.details.field === f);
            return (
              <div key={f} className="list-row" style={{ display: 'block' }}>
                <div className="note" style={{ fontSize: 10.5 }}>{f}</div>
                {f === 'Regular Hours' ? (
                  <button className="linkbtn" style={{ color: 'var(--ink)', fontSize: 13, marginTop: 3 }} onClick={() => info('Verified Business Hours', <div className="stack-sm">{client.regularHours.map((h) => <div key={h} style={{ fontSize: 13 }}>{h}</div>)}</div>, { sim: false })}>See verified business hours</button>
                ) : <div style={{ fontWeight: 700, fontSize: 13, marginTop: 3 }}>{values[f]}</div>}
                {p && <div style={{ marginTop: 6 }}><Badge tone="orange">Change requested: pending RMG verification</Badge></div>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14 }}>
          <label htmlFor="ic-draft" style={{ fontWeight: 700, fontSize: 13 }}>Request an Information Change</label>
          <textarea id="ic-draft" className="textarea" style={{ marginTop: 10, minHeight: 50 }} placeholder="Tell us which restaurant details should be updated..." value={draft} onChange={(e) => setDraft(e.target.value)} />
        </div>
        <button className="btn primary block" style={{ marginTop: 10 }} onClick={() => openModal(<ChangeRequestModal initial={draft} values={values} onDone={() => setDraft('')} />)}>Review Change Request</button>
      </section>

      <div ref={contactsRef} style={{ scrollMarginTop: 70 }} />
      <section className="card">
        <h2 className="card-title">Contacts & Team</h2>
        <p className="note" style={{ fontWeight: 700, marginTop: 8 }}>Authorized Business Contacts</p>
        {client.contacts.map((c) => (
          <div key={c.name} className="row between wrap" style={{ marginTop: 8, gap: 10 }}>
            <div className="row"><Ico lg>C</Ico><div><div style={{ fontWeight: 700 }}>{c.name}</div><div className="note">{c.role}</div></div></div>
            <button className="btn" onClick={() => nav('submit', { prefill: '71' })}>Request Contact Changes</button>
          </div>
        ))}
        <hr className="divider" />
        <p style={{ fontWeight: 700, fontSize: 13 }}>Your RMG Team</p>
        <div className="grid2 stack-mobile" style={{ marginTop: 10 }}>
          <div className="row"><RmgAvatar /><div><div style={{ fontWeight: 700 }}>Account Manager</div><div className="note">Marketing strategy and requests</div></div></div>
          <div className="row"><RmgAvatar /><div><div style={{ fontWeight: 700 }}>Photographer</div><div className="note">Content shoot scheduling</div></div></div>
        </div>
        <div className="minirow" style={{ marginTop: 14, background: 'var(--blue-panel)', borderColor: 'var(--blue-panel-line)', fontSize: 11.5 }}>Public-facing updates require RMG verification before publishing.</div>
      </section>
    </>
  );
}

function ChangeRequestModal({ initial, values, onDone }: { initial: string; values: Record<string, string>; onDone: () => void }) {
  const { addRequest, closeModal, toast } = useStore();
  const [field, setField] = useState<string>('Location');
  const [proposed, setProposed] = useState('');
  const [notes, setNotes] = useState(initial);
  const [files, setFiles] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const valid = proposed.trim().length > 1;
  return (
    <Modal title="Review Change Request" sub="Changes are verified by RMG before anything public is updated">
      <Field label="Detail to Change" htmlFor="cr-field"><select id="cr-field" className="select" value={field} onChange={(e) => setField(e.target.value)}>{INFO_FIELDS.map((f) => <option key={f}>{f}</option>)}</select></Field>
      <div className="minirow"><div className="note">Current Value on File</div><div style={{ fontWeight: 700 }}>{values[field]}</div></div>
      <Field label="Proposed Value" htmlFor="cr-new"><input id="cr-new" className="input" value={proposed} onChange={(e) => setProposed(e.target.value)} placeholder="What should it say?" /></Field>
      <Field label="Notes (Optional)" htmlFor="cr-notes"><textarea id="cr-notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div className="field"><span className="label">Attachments</span><FileInput id="cr-files" files={files} onChange={setFiles} placeholder="Optional supporting files" /></div>
      <div className="callout-orange">Submitting does not change your website, Google Business Profile, social platforms or listings directly. Your account manager verifies and makes approved updates.</div>
      <button className="btn primary block" disabled={!valid || sending} onClick={() => {
        setSending(true);
        window.setTimeout(() => {
          const r = addRequest({ title: `Update ${field}`, subtitle: 'Business Information Change', kind: 'info-change', typeId: field === 'Regular Hours' ? 1 : 4, categoryId: 1, details: { field, current: values[field], proposed: proposed.trim(), description: notes.trim() }, attachments: files, turnaround: 'Multi-Business Day', scope: 'Included' });
          closeModal(); onDone(); toast(`Change request ${r.id} submitted for verification.`);
        }, 600);
      }}>{sending ? 'Submitting…' : 'Submit Change Request'}</button>
    </Modal>
  );
}

function Services({ open, anchor }: { open: (s: Screen, a?: string) => void; anchor: string }) {
  const { client } = useStore();
  const nav = useRequestsNav();
  const info = useInfo();
  const docsRef = useAnchor(anchor === 'documents' ? 'documents' : '');
  const [exp, setExp] = useState<string | null>(null);
  const doc = (name: string) => info(name, (
    <>
      <div className="row between"><Badge tone="green">Approved / Current</Badge><span className="note">Version 2026.1</span></div>
      <p>Opens a secure, permission-checked copy of {name.toLowerCase()} for {client.name}. Links never grant access to the underlying Drive.</p>
    </>
  ), { sim: 'Secure document viewer simulated' });
  return (
    <>
      <section className="card">
        <div className="row between wrap"><h2 className="card-title">Your Active Services</h2><Badge tone="blue">{client.packageName}</Badge></div>
        <div style={{ marginTop: 6 }}>
          {client.services.map((s) => (
            <div key={s.name} className="list-row" style={{ display: 'block' }}>
              <button className="row" style={{ border: 0, background: 'none', padding: 0, width: '100%', textAlign: 'left', alignItems: 'flex-start' }} aria-expanded={exp === s.name} onClick={() => setExp(exp === s.name ? null : s.name)}>
                <span className="statusdot green" style={{ marginTop: 4 }} />
                <div style={{ flex: 1 }}><div className="t">{s.name}</div><div className="s">{s.desc}</div></div>
                <span className="note">{exp === s.name ? '^' : 'v'}</span>
              </button>
              {exp === s.name && (
                <ul style={{ margin: '8px 0 0 24px', paddingLeft: 14, fontSize: 12 }}>
                  {s.detail.map((d) => <li key={d}>{d}</li>)}
                  <li className="note">Reference: Active Service Agreement. Specific changes follow request rules and may need scope review.</li>
                </ul>
              )}
            </div>
          ))}
        </div>
        <button className="btn block" style={{ marginTop: 10 }} onClick={() => nav('main', { tab: 'Additional Services' })}>Explore Additional Services</button>
      </section>
      <section className="card">
        <h2 className="card-title">Policies & Resources</h2>
        <div style={{ marginTop: 6 }}>
          <ListRow icon={<Ico lg>B</Ico>} title="Business Hours & Emergencies" sub="Office availability and after-hours guidance" onClick={() => open('policy-hours')} />
          <ListRow icon={<Ico lg>R</Ico>} title="Request Guidelines & Turnaround Times" sub="Submitting requests and expected time frames" onClick={() => open('policy-requests')} />
          <ListRow icon={<Ico lg>C</Ico>} title="Content & Shoot Policies" sub="Content planning, rush options, and cancellation fees" onClick={() => open('policy-shoot')} />
        </div>
      </section>
      <div ref={docsRef} style={{ scrollMarginTop: 70 }} />
      <section className="card">
        <h2 className="card-title">Documents & Agreements</h2>
        <div style={{ marginTop: 6 }}>
          {['Active Service Agreement', 'Approved Content & Shoot Policies', 'Request & Communication Guidelines'].map((d) => (
            <ListRow key={d} icon={<span className="ico orange">D</span>} title={<span style={{ fontWeight: 400 }}>{d}</span>} onClick={() => doc(d)} />
          ))}
        </div>
      </section>
    </>
  );
}

function Preferences({ anchor }: { anchor: string }) {
  const { client, update, toast } = useStore();
  const info = useInfo();
  const nav = useRequestsNav();
  const secRef = useAnchor(anchor === 'security' ? 'security' : '');
  const [saving, setSaving] = useState<string | null>(null);
  const set = (k: 'email' | 'sms' | 'portal', v: boolean) => {
    setSaving(k);
    window.setTimeout(() => { update((s) => { s.clients[s.clientId].notif[k] = v; }); setSaving(null); toast('Notification preference saved.'); }, 450);
  };
  const rows: { k: 'email' | 'sms' | 'portal'; t: string; s: string }[] = [
    { k: 'email', t: 'Email Notifications', s: 'Updates and reminders to the email on your account' },
    { k: 'sms', t: 'SMS Notifications', s: 'Text alerts to your authorized mobile number' },
    { k: 'portal', t: 'Portal Notifications', s: 'Notices displayed in your RMG OS account' },
  ];
  return (
    <>
      <section className="card">
        <h2 className="card-title">Notification Preferences</h2>
        <p className="card-sub" style={{ marginTop: 8 }}>Choose how RMG contacts you about content shoots, delivery, requests, and account updates.</p>
        <div style={{ marginTop: 12 }}>
          {rows.map((r) => (
            <div key={r.k} className="list-row" style={{ padding: '14px 0' }}>
              <div style={{ flex: 1 }}><div className="t">{r.t}</div><div className="s">{saving === r.k ? 'Saving…' : r.s}</div></div>
              <Toggle label={r.t} on={client.notif[r.k]} disabled={saving !== null} onChange={(v) => set(r.k, v)} />
            </div>
          ))}
        </div>
        <p className="note" style={{ fontSize: 10.5, marginTop: 8 }}>SMS follows opt-in and opt-out rules; reply STOP to any text to opt out. Required service and security notices are still sent.</p>
      </section>
      <div ref={secRef} style={{ scrollMarginTop: 70 }} />
      <section className="card">
        <h2 className="card-title">Login & Security</h2>
        <div className="row" style={{ marginTop: 12 }}><Ico lg>PW</Ico><div><div style={{ fontWeight: 700 }}>Account Password</div><div className="note">Manage your portal login securely.</div></div></div>
        <button className="btn block" style={{ marginTop: 14 }} onClick={() => info('Password & Account Recovery', (
          <>
            <p>A secure reset link is sent by the sign-in provider to the email on your account. RMG never sees or stores your password.</p>
            <button className="btn primary block" onClick={() => toast('If the email is on file, a reset link is on its way.')}>Send Reset Link</button>
          </>
        ), { sim: 'Sign-in provider simulated' })}>Password & Account Recovery</button>
        <hr className="divider" />
        <button className="row" style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', width: '100%' }} onClick={() => info('Account Access', (
          <>
            <p className="note">Authorized users and permissions for {client.name}.</p>
            {client.portalUsers.map((u) => <div key={u.name} className="minirow row between"><div><strong>{u.name}</strong><div className="note">{u.role}</div></div><span className="note">{u.access}</span></div>)}
            <p className="note">Only authorized business contacts can request access changes. Changes need verification.</p>
            <button className="btn primary block" onClick={() => nav('submit', { prefill: '72' })}>Request an Access Change</button>
          </>
        ), { sim: false })}>
          <Ico lg>AC</Ico><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>Account Access</div><div className="note">Authorized users and permissions.</div></div><span className="chev note">&gt;</span>
        </button>
      </section>
      <section className="panel-blue">
        <h3 style={{ fontSize: 14 }}>Security & Access Safeguards</h3>
        <p style={{ fontSize: 12, marginTop: 10 }}>Do not expose passwords, API keys, integration tokens, or sensitive internal account notes in the client-facing portal.</p>
      </section>
    </>
  );
}

function PolicyMeta() { return <p className="note" style={{ fontSize: 10.5 }}>Policy version 2026.1 · Last updated October 1, 2026 · Same source used across RMG OS <SimTag>Illustrative policy text</SimTag></p>; }

function PolicyHours() {
  return (
    <>
      <section className="card stack-sm"><h2 className="card-title">RMG Office Hours</h2><BusinessHoursPanel /></section>
      <section className="card stack-sm">
        <h2 className="card-title">Emergencies</h2>
        <p style={{ fontSize: 12.5 }}>True emergencies use the dedicated Slack emergency procedure and bypass standard turnaround expectations. Outside office hours, the Home page shows an Off-hours emergency button.</p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>{EMERGENCY_ROUTING.map((e) => <li key={e}>{e}</li>)}</ul>
        <p className="note">RMG does not provide 24/7 support.</p>
        <PolicyMeta />
      </section>
    </>
  );
}

function PolicyRequests() {
  const nav = useRequestsNav();
  return (
    <section className="card stack-sm">
      <h2 className="card-title">Portal-First Requests</h2>
      <p style={{ fontSize: 12.5 }}>Submit regular work through Communication &amp; Requests. Include dates, files, links and context up front; the turnaround clock starts once RMG has complete information, during office hours.</p>
      <h3 style={{ fontSize: 14, marginTop: 8 }}>Turnaround Times</h3>
      {(['Same Business Day', 'Multi-Business Day', 'One Week or More'] as const).map((t) => <div key={t} className="minirow"><strong style={{ fontSize: 12.5 }}>{t}</strong><p className="note">{TURNAROUND_TEXT[t]}</p></div>)}
      <p style={{ fontSize: 12.5 }}>Slack remains the place for ongoing conversation, clarifications and urgent situations. Requests outside your package are labeled for scope review or quote before work begins.</p>
      <button className="btn" onClick={() => nav('main', { tab: 'How to Submit a Request' })}>See How to Submit a Request</button>
      <PolicyMeta />
    </section>
  );
}

function PolicyShoot() {
  return (
    <section className="card stack-sm">
      <h2 className="card-title">Content & Shoot Policies</h2>
      {[
        ['Shoot Plans', 'Shoot Plans are usually sent 5 Business Days before the shoot (except last-minute bookings). Request changes at least 1 full day before the shoot.'],
        ['Substitutions', 'Deliverable counts stay the same; comparable items may be substituted.'],
        ['Standard Delivery', 'Photos: 2 Business Days. Videos: 5 Business Days, counted from shoot completion.'],
        ['Rush Delivery', 'Photos: 1 Business Day, +$50. Videos: 3 Business Days, +$100. Rush requests need RMG feasibility review; nothing is charged unless approved.'],
        ['Cancellations', 'Please cancel at least 7 days in advance to avoid cancellation fees. Fees inside 7 days follow your service agreement.'],
        ['Delivered Content', 'Delivered photos and videos are shared through secure Google Drive folders scoped to your account.'],
      ].map(([t, b]) => <div key={t} className="minirow"><strong style={{ fontSize: 12.5 }}>{t}</strong><p className="note" style={{ marginTop: 3 }}>{b}</p></div>)}
      <PolicyMeta />
    </section>
  );
}
