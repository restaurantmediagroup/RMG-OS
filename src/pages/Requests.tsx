import { useMemo, useState } from 'react';
import { CATEGORIES, FIELD_LABELS, QUOTE_FULL, QUOTE_ITEMS, REFERRAL_FULL, REFERRAL_ITEMS, REQUEST_GROUPS, REQUEST_TYPES, TURNAROUND_TEXT, categoryName, requestType, typesInCategory, type RequestType } from '../data/catalog';
import { OPEN_STATUSES, type Attachment, type RequestRecord, type RequestStatus } from '../data/types';
import { useStore } from '../store';
import { useRequestsNav, type RequestsView } from '../lib/nav';
import { fmtFull, fmtShort, fmtStamp } from '../lib/time';
import { Badge, Band, FileInput, Ico, ListRow, Modal, PageFoot, PageHeader, SimTag, Tabs, RmgAvatar, TeamAvatar } from '../components/ui';
import { Field, useContactAM } from '../components/shared';

const TABS = ['Current Requests', 'How to Submit a Request', 'Additional Services'] as const;
type TabT = typeof TABS[number];

const SUBS: Record<RequestsView, string> = {
  main: 'Everything you need from your marketing team.',
  submit: 'Submit structured requests with the information RMG needs.',
  holiday: 'Proactive information requests and reminders from your RMG team.',
  meeting: 'Request time with your account manager for strategy or clarification.',
  feedback: 'Share ideas, suggestions or concerns with your marketing team.',
  quote: 'Request a quote or an introduction to a preferred partner.',
  directory: 'Browse requests by service or task, then submit with supporting details.',
  history: 'Completed and cancelled requests.',
};

export const STATUS_TONE: Record<RequestStatus, 'blue' | 'orange' | 'green' | 'gray' | 'navy'> = {
  Submitted: 'gray', 'Awaiting Review': 'blue', 'In Progress': 'blue', 'Waiting on Client': 'orange', Completed: 'green', Cancelled: 'gray',
};

export default function Requests() {
  const { state, setTab, update } = useStore();
  const view = (state.tabs['requests:view'] as RequestsView) || 'main';
  const tab = (state.tabs.requests as TabT) || 'Current Requests';
  const back = () => update((s) => { s.tabs['requests:view'] = 'main'; s.tabs['requests:prefill'] = ''; });

  const showTabs = view === 'main' || view === 'directory';
  return (
    <>
      <PageHeader title="Communication & Requests" sub={SUBS[view]} />
      {showTabs && <Tabs label="Communication & Requests sections" items={[...TABS]} value={view === 'directory' ? 'How to Submit a Request' : tab} onChange={(t) => { back(); setTab('requests', t); }} />}
      {!showTabs && (
        <div className="card tight"><button className="linkbtn" style={{ color: 'var(--ink)' }} onClick={back}>&lt;&nbsp; Back to {tab === 'Current Requests' || view === 'history' ? 'Current Requests' : tab}</button></div>
      )}
      {view === 'main' && tab === 'Current Requests' && <CurrentTab />}
      {view === 'main' && tab === 'How to Submit a Request' && <HowTab />}
      {view === 'main' && tab === 'Additional Services' && <AdditionalTab />}
      {view === 'directory' && <Directory />}
      {view === 'submit' && <RequestForm key={state.tabs['requests:prefill']} />}
      {view === 'holiday' && <HolidayForm />}
      {view === 'meeting' && <MeetingForm />}
      {view === 'feedback' && <FeedbackForm />}
      {view === 'quote' && <QuoteForm />}
      {view === 'history' && <History />}
      <PageFoot left="RMG OS | Communication & Requests | Demo data" />
    </>
  );
}

/* ---------------- Tab 1: Current Requests ---------------- */

function CurrentTab() {
  const { state } = useStore();
  const nav = useRequestsNav();
  const contactAM = useContactAM();
  const openDetail = useRequestDetail();
  const current = state.requests.filter((r) => r.clientId === state.clientId && OPEN_STATUSES.includes(r.status));
  return (
    <>
      <section className="card">
        <div className="row between"><h2 className="card-title">Your RMG Team</h2><span className="note" style={{ fontWeight: 700, letterSpacing: '.04em' }}>PRIMARY CONTACT</span></div>
        <div className="row between" style={{ marginTop: 12 }}>
          <div className="row"><TeamAvatar role="accountManager" /><div><div style={{ fontWeight: 700 }}>Account Manager</div><div className="note">Marketing, Requests & Support</div></div></div>
          <button className="btn" style={{ minWidth: 110 }} onClick={contactAM}>Contact</button>
        </div>
      </section>

      <section className="panel-blue">
        <h2 style={{ fontSize: 22 }}>Submit a Request</h2>
        <p className="note" style={{ marginTop: 8, fontSize: 12.5, maxWidth: 640 }}>Website changes, marketing updates, promotions, social profile updates and more. Choose a request type and include all the details up front.</p>
        <div style={{ marginTop: 16 }}><Badge tone="blue">PORTAL-FIRST</Badge></div>
        <button className="btn primary block" style={{ marginTop: 10, minHeight: 46 }} onClick={() => nav('submit')}>Submit a Request &nbsp;&gt;</button>
      </section>

      <section className="card">
        <h2 className="card-title">What Would You Like to Do?</h2>
        <div style={{ marginTop: 8 }}>
          <ListRow icon={<Ico lg>M</Ico>} title="Request a Meeting" sub="Purpose, Availability, Context and Attachments" onClick={() => nav('meeting')} />
          <ListRow icon={<Ico lg>F</Ico>} title="Share General Feedback" sub="Ideas, Suggestions or Concerns" onClick={() => nav('feedback')} />
          <ListRow icon={<Ico lg>H</Ico>} title="Holiday Planning" sub="Submit Hours, Specials, Menus and Promotions" onClick={() => nav('holiday')} />
        </div>
      </section>

      <section className="card">
        <div className="row between"><h2 className="card-title">Current Requests</h2><button className="btn" onClick={() => nav('history')}>View History</button></div>
        <div className="stack-sm" style={{ marginTop: 12 }}>
          {current.length === 0 && <p className="note">No open requests right now. New requests appear here once submitted.</p>}
          {current.map((r) => (
            <button key={r.id} className="minirow row between" style={{ textAlign: 'left', width: '100%' }} onClick={() => openDetail(r.id)}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</div>
                <div className="note">{r.subtitle}</div>
                <div className="note" style={{ color: 'var(--muted-2)', fontSize: 10.5, marginTop: 2 }}>Submitted {fmtShort(r.submittedAt.slice(0, 10))}</div>
              </div>
              <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
            </button>
          ))}
        </div>
      </section>
      <p className="note" style={{ padding: '0 16px' }}>Completed requests are archived under View History, not listed as current work.</p>
    </>
  );
}

export function useRequestDetail() {
  const { openModal } = useStore();
  return (id: string) => openModal(<RequestDetail id={id} />);
}

function RequestDetail({ id }: { id: string }) {
  const { state, update, toast, closeModal } = useStore();
  const r = state.requests.find((x) => x.id === id);
  const [reply, setReply] = useState('');
  if (!r) return null;
  const t = r.typeId ? requestType(r.typeId) : undefined;
  return (
    <Modal title={r.title} sub={r.subtitle} wide>
      <div className="row between wrap">
        <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
        <span className="note">Request {r.id} · Last synced {fmtStamp(r.lastSynced)}</span>
      </div>
      {t && <div className="grid2 stack-mobile"><div className="metric"><div className="lbl">Request Type</div><div style={{ fontWeight: 700, marginTop: 4 }}>{t.name}</div></div><div className="metric"><div className="lbl">Turnaround</div><div style={{ fontWeight: 700, marginTop: 4 }}>{t.turnaround}</div></div></div>}
      {Object.entries(r.details).filter(([, v]) => v).map(([k, v]) => (
        <div key={k}><div className="label" style={{ fontWeight: 700, fontSize: 12 }}>{labelFor(k)}</div><p style={{ fontSize: 13, marginTop: 2, whiteSpace: 'pre-wrap' }}>{v}</p></div>
      ))}
      {r.neededBy && <p className="note">Requested by {fmtFull(r.neededBy)} (not a guaranteed deadline)</p>}
      {r.attachments.length > 0 && <div className="row wrap" style={{ gap: 6 }}>{r.attachments.map((a) => <span key={a.name} className="filechip">{a.name}</span>)}</div>}
      <div>
        <strong style={{ fontSize: 12.5 }}>Status History</strong>
        <div className="stack-sm" style={{ marginTop: 8 }}>
          {r.history.map((h, i) => (
            <div key={i} className="row" style={{ alignItems: 'flex-start', fontSize: 12 }}>
              <span className={`statusdot ${h.status === 'Completed' ? 'green' : h.status === 'Waiting on Client' ? 'orange' : 'gray'}`} style={{ marginTop: 4 }} />
              <div><strong>{h.status}</strong> <span className="note">· {fmtStamp(h.at)} · {h.by === 'Account Manager' ? <TeamAvatar role="accountManager" size={14} /> : h.by !== 'Client' && <RmgAvatar size={14} />}{h.by}</span>{h.note && <p className="note" style={{ color: 'var(--ink)' }}>{h.note}</p>}</div>
            </div>
          ))}
        </div>
      </div>
      {r.completionNote && <div className="minirow"><strong style={{ fontSize: 12 }}>Completion Note</strong><p className="note">{r.completionNote}</p></div>}
      {r.status === 'Waiting on Client' && (
        <div className="stack-sm">
          <Field label="Provide the Information Requested" htmlFor="reply"><textarea id="reply" className="textarea" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Add the details your account manager asked for..." /></Field>
          <button className="btn primary" disabled={reply.trim().length < 3} onClick={() => {
            update((s) => { const x = s.requests.find((q) => q.id === id)!; x.status = 'Awaiting Review'; x.history.push({ status: 'Awaiting Review', at: new Date().toISOString(), by: 'Client', note: reply.trim() }); x.lastSynced = new Date().toISOString(); });
            toast('Information sent to your account manager.'); closeModal();
          }}>Send Information</button>
        </div>
      )}
      <p className="note">Linked fulfillment task {r.mondayId} (Monday.com, simulated). Conversation and urgent issues stay in Slack.</p>
    </Modal>
  );
}

function labelFor(k: string) {
  const map: Record<string, string> = { description: 'What Needs to Change?', purpose: 'Purpose', availability: 'Rough Availability', context: 'Context', feedbackType: 'Feedback Type', message: 'Feedback', service: 'Service', need: 'Business Need', location: 'Location', budget: 'Budget / Timing', hours: 'Restaurant Hours & Closures', specials: 'Specials & Promotions', holiday: 'Holiday / Occasion', field: 'Detail to Change', current: 'Current Value', proposed: 'Proposed Value' };
  return map[k] ?? (FIELD_LABELS as Record<string, { label: string }>)[k]?.label ?? k;
}

/* ---------------- History ---------------- */

function History() {
  const { state } = useStore();
  const openDetail = useRequestDetail();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'All' | 'Completed' | 'Cancelled'>('All');
  const [cat, setCat] = useState('0');
  const items = state.requests.filter((r) => r.clientId === state.clientId && !OPEN_STATUSES.includes(r.status))
    .filter((r) => status === 'All' || r.status === status)
    .filter((r) => cat === '0' || String(r.categoryId) === cat)
    .filter((r) => !q || `${r.title} ${r.subtitle} ${r.completionNote ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="card stack">
      <div><h2 className="card-title">Request History</h2><p className="card-sub">Completed and cancelled requests, with completion notes.</p></div>
      <input id="hist-search" className="input" placeholder="Search Request History..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid2">
        <select id="hist-status" className="select" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status"><option>All</option><option>Completed</option><option>Cancelled</option></select>
        <select id="hist-cat" className="select" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category"><option value="0">All Categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </div>
      <div className="stack-sm">
        {items.length === 0 && <p className="note">No matching requests.</p>}
        {items.map((r) => (
          <button key={r.id} className="minirow" style={{ textAlign: 'left' }} onClick={() => openDetail(r.id)}>
            <div className="row between"><strong style={{ fontSize: 13 }}>{r.title}</strong><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></div>
            <div className="note">{r.subtitle} · Submitted {fmtShort(r.submittedAt.slice(0, 10))}</div>
            {r.completionNote && <div className="note" style={{ marginTop: 4, color: 'var(--ink)' }}>{r.completionNote}</div>}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Tab 2: How to Submit a Request ---------------- */

function HowTab() {
  const nav = useRequestsNav();
  const [open, setOpen] = useState(0);
  const [item, setItem] = useState<string | null>(null);
  const steps = [
    ['Submit Through the Portal', 'Choose request type and provide dates, files, links and context.'],
    ['RMG Reviews and Routes the Request', 'Your account manager coordinates the appropriate team.'],
    ['Track the Request', 'See Submitted, In Progress, Waiting on Client or Completed.'],
    ['Request a Meeting If Needed', 'Calls are for strategy or clarification, not initial intake.'],
  ];
  return (
    <>
      <Band title="Request Workflow" />
      <section className="card">
        {steps.map(([t, s], i) => <ListRow key={t} icon={<Ico lg>{i + 1}</Ico>} title={t} sub={s} />)}
      </section>
      <Band title="Request Types & Turnaround Times" />
      <section className="card stack-sm">
        {REQUEST_GROUPS.map((g, gi) => {
          const isOpen = open === gi;
          return (
            <div key={g.title} className={`acc${isOpen ? ' open' : ''}`}>
              <button className="acc-head" aria-expanded={isOpen} onClick={() => { setOpen(isOpen ? -1 : gi); setItem(null); }}>
                <div><div className="t">{g.title}</div>{!isOpen && <div className="s">5 Request Groups</div>}</div>
                <span className="act">{isOpen ? 'HIDE ^' : 'SHOW v'}</span>
              </button>
              {isOpen && (
                <div className="acc-body">
                  <hr className="divider" style={{ margin: '0 0 8px' }} />
                  {g.short.map((label, i) => {
                    const opt = g.options[i];
                    const key = `${gi}-${i}`;
                    const exp = item === key;
                    return (
                      <div key={label}>
                        <button className="radio" style={{ padding: '5px 0', width: '100%', justifyContent: 'space-between' }} aria-expanded={exp} onClick={() => setItem(exp ? null : key)} title={opt.label}>
                          <span style={{ fontSize: 12.5 }}><span className="tnum" style={{ display: 'inline-block', width: 18 }}>{i + 1}</span>{label}</span>
                          <span className="note">{exp ? '^' : 'v'}</span>
                        </button>
                        {exp && (
                          <div className="stack-sm" style={{ margin: '4px 0 10px 18px' }}>
                            <p className="note">{opt.label}</p>
                            {opt.ids.map((id) => { const t = requestType(id)!; return <TypeRow key={id} t={t} onStart={() => nav('submit', { prefill: String(id) })} />; })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>
      <Band title="Browse All Request Types" />
      <section className="card stack">
        <p className="note" style={{ fontSize: 12.5 }}>74 potential request types organized into 10 categories. Search by service, task or platform; the form adapts to the selected request.</p>
        <button className="btn primary block" style={{ minHeight: 44 }} onClick={() => nav('directory')}>Browse Request Directory &nbsp;&gt;</button>
      </section>
    </>
  );
}

function scopeTone(scope: string): 'green' | 'blue' | 'orange' | 'gray' {
  return scope === 'Included' ? 'green' : scope === 'Requires Review' ? 'blue' : scope === 'Requires Quote' || scope === 'Referral' ? 'orange' : 'gray';
}

function TypeRow({ t, onStart }: { t: RequestType; onStart: () => void }) {
  return (
    <button className="minirow" style={{ textAlign: 'left', background: '#fff' }} onClick={onStart}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 12.5 }}><span className="note tnum">{String(t.id).padStart(2, '0')}.</span> {t.name}</div>
          <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
            <span className={`badge ${t.emergency ? 'red' : 'gray'}`} style={{ padding: '3px 9px', fontSize: 10.5 }}>{t.turnaround}</span>
            <span className={`badge ${scopeTone(t.scope)}`} style={{ padding: '3px 9px', fontSize: 10.5 }}>{t.scope}</span>
          </div>
        </div>
        <span className="note" style={{ color: 'var(--orange)', fontWeight: 900 }}>&gt;</span>
      </div>
    </button>
  );
}

function Directory() {
  const nav = useRequestsNav();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<number | null>(null);
  const results = useMemo(() => (q.trim() ? REQUEST_TYPES.filter((t) => `${t.name} ${categoryName(t.categoryId)}`.toLowerCase().includes(q.trim().toLowerCase())) : []), [q]);
  return (
    <>
      <Band title="Full Request Directory" tag="74 Types" />
      <input id="dir-search" className="input" style={{ background: '#fff', padding: '16px' }} placeholder="Search for a Request..." value={q} onChange={(e) => { setQ(e.target.value); setCat(null); }} />
      {q.trim() ? (
        <section className="card stack-sm">
          <strong>{results.length} matching request type{results.length === 1 ? '' : 's'}</strong>
          {results.map((t) => <TypeRow key={t.id} t={t} onStart={() => nav('submit', { prefill: String(t.id) })} />)}
        </section>
      ) : cat ? (
        <section className="card stack-sm">
          <button className="linkbtn" onClick={() => setCat(null)}>&lt; All Categories</button>
          <h2 className="card-title">{categoryName(cat)}</h2>
          <p className="card-sub">{typesInCategory(cat).length} request types. Expected turnaround and scope shown for each.</p>
          {typesInCategory(cat).map((t) => <TypeRow key={t.id} t={t} onStart={() => nav('submit', { prefill: String(t.id) })} />)}
        </section>
      ) : (
        <>
          <span className="note" style={{ fontWeight: 700, letterSpacing: '.05em', padding: '0 14px' }}>SELECT A CATEGORY</span>
          <div className="grid2">
            {CATEGORIES.map((c) => (
              <button key={c.id} className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 92 }} onClick={() => setCat(c.id)}>
                <div className="row" style={{ alignItems: 'flex-start' }}><Ico lg>{c.id}</Ico><strong style={{ fontSize: 12.5 }}>{c.name}</strong></div>
                <div className="row between"><span className="note" style={{ paddingLeft: 52 }}>{typesInCategory(c.id).length} request types</span><span style={{ color: 'var(--orange)', fontWeight: 900 }}>&gt;</span></div>
              </button>
            ))}
          </div>
        </>
      )}
      <section className="panel-blue">
        <h3 style={{ fontSize: 15 }}>What Happens Next?</h3>
        <p className="note" style={{ marginTop: 6 }}>Selecting a category displays its individual request types with expected turnaround, required information and attachments. Requests outside the client package are labeled Quote or Scope Review instead of implying included service.</p>
      </section>
    </>
  );
}

/* ---------------- Tab 3: Additional Services ---------------- */

function AdditionalTab() {
  const nav = useRequestsNav();
  return (
    <section className="card stack">
      <div><h2 className="card-title">Additional Services</h2><p className="card-sub">Need something beyond your current marketing services? Request a quote or an introduction to a preferred partner.</p></div>
      <div className="panel-blue" style={{ padding: 14 }}><strong>Request a Quote</strong><p className="note">Additional marketing, production, advertising and digital services.</p></div>
      <div>{QUOTE_ITEMS.map((i) => <ListRow key={i.name} icon={<Ico>{i.letter}</Ico>} title={i.name} onClick={() => nav('quote', { prefill: `Quote|${i.name}` })} right={<span />} />)}</div>
      <hr className="divider" />
      <div className="panel-blue" style={{ padding: 14 }}><strong>Request a Referral</strong><p className="note">Connect with vetted outside providers for services beyond RMG's scope.</p></div>
      <div>{REFERRAL_ITEMS.map((i) => <ListRow key={i.name} icon={<Ico>{i.letter}</Ico>} title={i.name} onClick={() => nav('quote', { prefill: `Referral|${i.name}` })} right={<span />} />)}</div>
      <button className="btn primary block" style={{ minHeight: 44 }} onClick={() => nav('quote')}>Request a Quote or Referral &nbsp;&gt;</button>
      <p className="note">All inquiries go to RMG for scope review. Nothing is purchased automatically.</p>
    </section>
  );
}

/* ---------------- Forms ---------------- */

type Step = 'edit' | 'review' | 'sending' | 'done';

function useSubmitter() {
  const [step, setStep] = useState<Step>('edit');
  const [rec, setRec] = useState<RequestRecord | null>(null);
  const run = (fn: () => RequestRecord) => { setStep('sending'); window.setTimeout(() => { setRec(fn()); setStep('done'); window.scrollTo({ top: 0 }); }, 700); };
  return { step, setStep, rec, run };
}

function Done({ rec, title, body }: { rec: RequestRecord; title: string; body: string }) {
  const { update } = useStore();
  const nav = useRequestsNav();
  return (
    <section className="card stack">
      <Badge tone="green" dot>Received</Badge>
      <h2 className="card-title">{title}</h2>
      <p style={{ fontSize: 13 }}>{body}</p>
      <div className="grid2 stack-mobile">
        <div className="metric"><div className="lbl">RMG OS Request</div><div style={{ fontWeight: 700, marginTop: 4 }}>{rec.id}</div></div>
        <div className="metric"><div className="lbl">Linked Monday.com Task <SimTag>Simulated</SimTag></div><div style={{ fontWeight: 700, marginTop: 4 }}>{rec.mondayId}</div></div>
      </div>
      <p className="note">You'll be notified about receipt, Waiting on Client, completion and meaningful changes, based on your notification preferences.</p>
      <button className="btn primary block" onClick={() => { update((s) => { s.tabs.requests = 'Current Requests'; }); nav('main', { tab: 'Current Requests' }); }}>View Current Requests</button>
    </section>
  );
}

function RequestForm() {
  const { state, addRequest } = useStore();
  const prefill = Number(state.tabs['requests:prefill'] || 0);
  const pre = prefill ? requestType(prefill) : undefined;
  const [catId, setCatId] = useState<number>(pre?.categoryId ?? 0);
  const [typeId, setTypeId] = useState<number>(pre?.id ?? 0);
  const [desc, setDesc] = useState('');
  const [needed, setNeeded] = useState('');
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Attachment[]>([]);
  const [touched, setTouched] = useState(false);
  const { step, setStep, rec, run } = useSubmitter();
  const t = typeId ? requestType(typeId) : undefined;
  const errors = { cat: !catId, type: !typeId, desc: desc.trim().length < 10 };
  const valid = !errors.cat && !errors.type && !errors.desc;

  if (step === 'done' && rec) return <Done rec={rec} title="Request Submitted" body={`Your ${t?.name ?? 'request'} was routed to your assigned account manager. Track it under Current Requests.`} />;

  if (step === 'review' || step === 'sending') {
    return (
      <section className="card stack">
        <h2 className="card-title">Review Your Request</h2>
        <div className="minirow stack-sm">
          <div><span className="note">Request Category</span><div style={{ fontWeight: 700 }}>{categoryName(catId)}</div></div>
          <div><span className="note">Specific Request</span><div style={{ fontWeight: 700 }}>{t?.name}</div></div>
          <div><span className="note">What Needs to Change?</span><div style={{ whiteSpace: 'pre-wrap' }}>{desc}</div></div>
          {Object.entries(extra).filter(([, v]) => v).map(([k, v]) => <div key={k}><span className="note">{labelFor(k)}</span><div>{v}</div></div>)}
          <div><span className="note">When Is This Needed?</span><div>{needed ? fmtFull(needed) : 'No date selected'}</div></div>
          <div><span className="note">Attachments</span><div>{files.length ? files.map((f) => f.name).join(', ') : 'None'}</div></div>
        </div>
        {t && <TurnaroundBox t={t} />}
        <div className="callout-orange">Requested dates are preferences, not guaranteed deadlines. The turnaround clock starts once RMG has complete information{t?.scope !== 'Included' ? '. This request needs scope review before work begins' : ''}.</div>
        <div className="grid2">
          <button className="btn" onClick={() => setStep('edit')} disabled={step === 'sending'}>Edit Request</button>
          <button className="btn primary" disabled={step === 'sending'} onClick={() => run(() => addRequest({
            title: t!.name, subtitle: categoryName(catId), kind: 'standard', typeId, categoryId: catId,
            details: { description: desc.trim(), ...extra }, neededBy: needed || undefined, attachments: files, turnaround: t!.turnaround, scope: t!.scope,
          }))}>{step === 'sending' ? 'Submitting…' : 'Submit Request'}</button>
        </div>
        <p className="note">Submission creates an RMG OS record and linked internal Monday.com task.</p>
      </section>
    );
  }

  return (
    <form className="card stack" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (valid) { setStep('review'); window.scrollTo({ top: 0 }); } }}>
      <div><h2 style={{ fontSize: 22 }}>Submit a Request</h2><p className="card-sub">Complete this form to route your request directly to your assigned account manager.</p></div>
      <Field label="Request Category" htmlFor="rf-cat">
        <select id="rf-cat" className="select" value={catId} onChange={(e) => { setCatId(Number(e.target.value)); setTypeId(0); setExtra({}); }}>
          <option value={0}>Select a category</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {touched && errors.cat && <span className="error">Choose a request category.</span>}
      </Field>
      <Field label="Specific Request" htmlFor="rf-type">
        <select id="rf-type" className="select" value={typeId} disabled={!catId} onChange={(e) => { setTypeId(Number(e.target.value)); setExtra({}); }}>
          <option value={0}>{catId ? 'Select a specific request' : 'Choose a category first'}</option>
          {catId > 0 && typesInCategory(catId).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        {touched && errors.type && <span className="error">Choose the specific request.</span>}
      </Field>
      {t?.emergency && <div className="callout-red"><strong>Is this happening right now?</strong> True emergencies use the dedicated Slack emergency procedure so the team sees it immediately. Submit this form as well for the written record.</div>}
      <Field label="What Needs to Change?" htmlFor="rf-desc">
        <textarea id="rf-desc" className="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the change, include links, names, prices and anything RMG needs to complete it." />
        {touched && errors.desc && <span className="error">Add a short description (at least 10 characters).</span>}
      </Field>
      {t?.fields?.map((f) => (
        <Field key={f} label={FIELD_LABELS[f].label} htmlFor={`rf-${f}`}>
          <input id={`rf-${f}`} className="input" value={extra[f] ?? ''} placeholder={FIELD_LABELS[f].placeholder} onChange={(e) => setExtra({ ...extra, [f]: e.target.value })} />
        </Field>
      ))}
      <Field label="When Is This Needed?" htmlFor="rf-date" hint="Optional. A preferred date, not a guaranteed deadline.">
        <input id="rf-date" type="date" className="input" value={needed} onChange={(e) => setNeeded(e.target.value)} />
      </Field>
      <div className="field"><span className="label">Attachments</span><FileInput id="rf-files" files={files} onChange={setFiles} placeholder="Add menus, screenshots, photos or supporting files" /></div>
      {t ? <TurnaroundBox t={t} /> : (
        <div className="panel-blue"><strong>Estimated Turnaround</strong><p className="note" style={{ marginTop: 4 }}>Select a specific request to see its expected turnaround.</p></div>
      )}
      <div className="callout-orange">Requests outside your current services may be converted to a Quote Request before work begins.</div>
      <button type="submit" className="btn primary block" style={{ minHeight: 46 }}>Review Request &nbsp;&gt;</button>
      <p className="note">Submission creates an RMG OS record and linked internal Monday.com task.</p>
    </form>
  );
}

function TurnaroundBox({ t }: { t: RequestType }) {
  return (
    <div className="panel-blue">
      <div className="row between wrap"><strong>Estimated Turnaround</strong><span className={`badge ${scopeTone(t.scope)}`} style={{ padding: '3px 9px', fontSize: 10.5 }}>{t.scope}</span></div>
      <p style={{ marginTop: 6, fontSize: 13 }}>{TURNAROUND_TEXT[t.turnaround]}</p>
      <p className="note" style={{ marginTop: 6 }}>No automatic promise of completion on the requested date.</p>
    </div>
  );
}

const HOLIDAYS = ['Thanksgiving', 'Christmas Eve & Christmas Day', "New Year's Eve & New Year's Day", "Valentine's Day", 'St. Patrick’s Day', 'Easter', "Mother's Day", 'Cinco de Mayo', 'Memorial Day', 'Fourth of July', 'Labor Day', 'Other Occasion'];

function HolidayForm() {
  const { state, update, addRequest } = useStore();
  const rec = state.holidays.find((h) => h.clientId === state.clientId && h.holiday === 'Thanksgiving');
  const [holiday, setHoliday] = useState('Thanksgiving');
  const [hours, setHours] = useState(rec?.hours ?? 'Thursday: Closed; Friday: 12 PM - 9 PM');
  const [specials, setSpecials] = useState(rec?.specials ?? '');
  const [files, setFiles] = useState<Attachment[]>([]);
  const { step, setStep, rec: done, run } = useSubmitter();
  const submitted = rec && ['Submitted', 'Approved', 'Fulfilled'].includes(rec.status) && holiday === 'Thanksgiving';

  if (step === 'done' && done) return <Done rec={done} title="Holiday Submission Received" body={`RMG received your ${holiday} details. The associated work is routed internally and your account shows as Submitted in the holiday tracker.`} />;

  if (step === 'review' || step === 'sending') {
    return (
      <section className="card stack">
        <h2 className="card-title">Review Holiday Submission</h2>
        <div className="minirow stack-sm">
          <div><span className="note">Holiday / Occasion</span><div style={{ fontWeight: 700 }}>{holiday}</div></div>
          <div><span className="note">Restaurant Hours & Closures</span><div>{hours || 'Not provided'}</div></div>
          <div><span className="note">Specials & Promotions</span><div>{specials || 'Not provided'}</div></div>
          <div><span className="note">Menus, Artwork & Supporting Files</span><div>{files.length ? files.map((f) => f.name).join(', ') : 'None'}</div></div>
        </div>
        <div className="grid2">
          <button className="btn" onClick={() => setStep('edit')} disabled={step === 'sending'}>Edit</button>
          <button className="btn primary" disabled={step === 'sending'} onClick={() => run(() => {
            update((s) => {
              const h = s.holidays.find((x) => x.clientId === s.clientId && x.holiday === holiday);
              const at = new Date().toISOString();
              if (h) { h.status = 'Submitted'; h.hours = hours; h.specials = specials; h.attachments = files; h.submittedAt = at; h.revisions += 1; }
              else s.holidays.push({ id: `hol-${s.clientId}-${Date.now()}`, clientId: s.clientId, holiday, due: '', status: 'Submitted', hours, specials, attachments: files, submittedAt: at, revisions: 1 });
              const c = s.clients[s.clientId];
              c.actionItems = c.actionItems.filter((a) => !(h && a.holidayId === h.id));
            });
            return addRequest({ title: 'Holiday Planning Submission', subtitle: `${holiday} Information`, kind: 'holiday', details: { holiday, hours, specials }, attachments: files });
          })}>{step === 'sending' ? 'Submitting…' : 'Submit Holiday Information'}</button>
        </div>
      </section>
    );
  }

  return (
    <form className="card stack" onSubmit={(e) => { e.preventDefault(); setStep('review'); window.scrollTo({ top: 0 }); }}>
      <h2 style={{ fontSize: 22 }}>Holiday Planning</h2>
      {holiday === 'Thanksgiving' && rec && (
        <div style={{ background: submitted ? 'var(--green-soft)' : 'var(--orange-soft)', borderRadius: 10, padding: 14 }}>
          <strong>Thanksgiving Planning</strong>
          <p style={{ color: submitted ? 'var(--green-text)' : 'var(--orange-text)', fontSize: 12, marginTop: 4 }}>
            Due {rec.due ? fmtFull(rec.due) : 'TBD'} &nbsp;|&nbsp; {submitted ? 'Submitted — you can send an update' : 'Awaiting Your Information'}
          </p>
        </div>
      )}
      <Field label="Holiday / Occasion" htmlFor="hf-holiday">
        <select id="hf-holiday" className="select" value={holiday} onChange={(e) => setHoliday(e.target.value)}>{HOLIDAYS.map((h) => <option key={h}>{h}</option>)}</select>
      </Field>
      <Field label="Restaurant Hours & Closures" htmlFor="hf-hours"><textarea id="hf-hours" className="textarea" style={{ minHeight: 60 }} value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
      <Field label="Specials & Promotions" htmlFor="hf-specials"><textarea id="hf-specials" className="textarea" style={{ minHeight: 60 }} value={specials} placeholder="Catering trays and Thanksgiving takeout specials..." onChange={(e) => setSpecials(e.target.value)} /></Field>
      <div className="field"><span className="label">Menus, Artwork & Supporting Files</span><FileInput id="hf-files" files={files} onChange={setFiles} placeholder="Upload Menu, Flyer or Photo" /></div>
      <div className="panel-blue"><strong>What Happens After Submission?</strong><p className="note" style={{ marginTop: 6 }}>RMG receives the completed submission, the associated work is routed internally, and the account appears as Submitted in the agency-wide holiday tracker.</p></div>
      <button type="submit" className="btn primary block" style={{ minHeight: 46 }}>Review Holiday Submission &nbsp;&gt;</button>
      <p className="note">Admin will track Submitted, Missing and Needs Clarification by holiday and client.</p>
      <p className="note">Notifications link into this form, not back to a long email thread.</p>
    </form>
  );
}

function MeetingForm() {
  const { addRequest } = useStore();
  const [purpose, setPurpose] = useState('');
  const [avail, setAvail] = useState('');
  const [context, setContext] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [touched, setTouched] = useState(false);
  const { step, rec, run } = useSubmitter();
  if (step === 'done' && rec) return <Done rec={rec} title="Meeting Request Sent" body="Your account manager will follow up to coordinate a time. This is a request, not an instant booking; your meeting appears on Home once it is booked." />;
  const valid = purpose && avail.trim().length > 2;
  return (
    <form className="card stack" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (valid) run(() => addRequest({ title: 'Meeting Request', subtitle: purpose, kind: 'meeting', typeId: 69, categoryId: 10, details: { purpose, availability: avail, context }, attachments: files, turnaround: 'Multi-Business Day', scope: 'Included' })); }}>
      <div><h2 style={{ fontSize: 22 }}>Request a Meeting</h2><p className="card-sub">Calls are for strategy or clarification, not initial intake. Submit new work through Submit a Request.</p></div>
      <Field label="Purpose" htmlFor="mf-purpose">
        <select id="mf-purpose" className="select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">Select a purpose</option>
          {['Marketing Strategy', 'Campaign Planning', 'Reporting Review', 'Clarification on a Request', 'Holiday Planning', 'Other'].map((p) => <option key={p}>{p}</option>)}
        </select>
        {touched && !purpose && <span className="error">Choose a purpose.</span>}
      </Field>
      <Field label="Rough Availability" htmlFor="mf-avail"><input id="mf-avail" className="input" value={avail} onChange={(e) => setAvail(e.target.value)} placeholder="e.g. Tue or Thu afternoons, after 2 PM" />{touched && avail.trim().length <= 2 && <span className="error">Share a few days or times that work.</span>}</Field>
      <Field label="Context" htmlFor="mf-context"><textarea id="mf-context" className="textarea" value={context} onChange={(e) => setContext(e.target.value)} placeholder="What would you like to cover?" /></Field>
      <div className="field"><span className="label">Attachments</span><FileInput id="mf-files" files={files} onChange={setFiles} placeholder="Add any supporting files" /></div>
      <button type="submit" className="btn primary block" disabled={step === 'sending'}>{step === 'sending' ? 'Sending…' : 'Send Meeting Request'}</button>
      <p className="note">Your account manager coordinates the time. No meeting is booked automatically.</p>
    </form>
  );
}

function FeedbackForm() {
  const { addRequest } = useStore();
  const [kind, setKind] = useState('Idea');
  const [msg, setMsg] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [touched, setTouched] = useState(false);
  const { step, rec, run } = useSubmitter();
  if (step === 'done' && rec) return <Done rec={rec} title="Thanks for the Feedback" body="Your account manager received it. If it needs action, they will follow up." />;
  return (
    <form className="card stack" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (msg.trim().length >= 5) run(() => addRequest({ title: 'General Feedback', subtitle: kind, kind: 'feedback', typeId: 70, categoryId: 10, details: { feedbackType: kind, message: msg.trim() }, attachments: files })); }}>
      <div><h2 style={{ fontSize: 22 }}>Share General Feedback</h2><p className="card-sub">Ideas, suggestions or concerns about your marketing. Feedback on published content is welcome; scheduled posts are not reviewed here.</p></div>
      <div className="field"><span className="label">Feedback Type</span>
        <div className="seg">{['Idea', 'Suggestion', 'Concern', 'Compliment'].map((k) => <button type="button" key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{k}</button>)}</div>
      </div>
      <Field label="Your Feedback" htmlFor="ff-msg"><textarea id="ff-msg" className="textarea" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Share your feedback..." />{touched && msg.trim().length < 5 && <span className="error">Add a few words of feedback.</span>}</Field>
      <div className="field"><span className="label">Attachments</span><FileInput id="ff-files" files={files} onChange={setFiles} placeholder="Optional screenshots or files" /></div>
      <button type="submit" className="btn primary block" disabled={step === 'sending'}>{step === 'sending' ? 'Sending…' : 'Send Feedback'}</button>
    </form>
  );
}

function QuoteForm() {
  const { state, addRequest } = useStore();
  const [preKind, preService] = (state.tabs['requests:prefill'] || '').split('|');
  const [kind, setKind] = useState<'Quote' | 'Referral'>(preKind === 'Referral' ? 'Referral' : 'Quote');
  const [service, setService] = useState(preService ?? '');
  const [need, setNeed] = useState('');
  const [loc, setLoc] = useState(state.clients[state.clientId].name);
  const [budget, setBudget] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [touched, setTouched] = useState(false);
  const { step, rec, run } = useSubmitter();
  const list = kind === 'Quote' ? Array.from(new Set([...QUOTE_ITEMS.map((i) => i.name), ...QUOTE_FULL])) : Array.from(new Set([...REFERRAL_ITEMS.map((i) => i.name), ...REFERRAL_FULL]));
  if (step === 'done' && rec) return <Done rec={rec} title={`${kind} Request Sent`} body={`Your account manager will review scope${kind === 'Quote' ? ' and pricing' : ' and make an introduction'}. Nothing is purchased or invoiced automatically.`} />;
  const valid = service && need.trim().length >= 5;
  return (
    <form className="card stack" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (valid) run(() => addRequest({ title: `${kind} Request: ${service}`, subtitle: 'Additional Services', kind: kind === 'Quote' ? 'quote' : 'referral', details: { service, need: need.trim(), location: loc, budget }, attachments: files, scope: kind === 'Quote' ? 'Requires Quote' : 'Referral', status: 'Awaiting Review' })); }}>
      <div><h2 style={{ fontSize: 22 }}>Request a Quote or Referral</h2><p className="card-sub">Need something beyond your current marketing services? Request a quote or an introduction to a preferred partner.</p></div>
      <div className="seg">{(['Quote', 'Referral'] as const).map((k) => <button type="button" key={k} className={kind === k ? 'on' : ''} onClick={() => { setKind(k); setService(''); }}>Request a {k}</button>)}</div>
      <Field label="Service" htmlFor="qf-service">
        <select id="qf-service" className="select" value={service} onChange={(e) => setService(e.target.value)}><option value="">Select a service</option>{list.map((s) => <option key={s}>{s}</option>)}</select>
        {touched && !service && <span className="error">Choose a service.</span>}
      </Field>
      <Field label="Business Need" htmlFor="qf-need"><textarea id="qf-need" className="textarea" value={need} onChange={(e) => setNeed(e.target.value)} placeholder="What are you hoping to accomplish?" />{touched && need.trim().length < 5 && <span className="error">Describe the need in a few words.</span>}</Field>
      <Field label="Location" htmlFor="qf-loc"><input id="qf-loc" className="input" value={loc} onChange={(e) => setLoc(e.target.value)} /></Field>
      <Field label="Budget or Timing (Optional)" htmlFor="qf-budget"><input id="qf-budget" className="input" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. before Thanksgiving, around $500" /></Field>
      <div className="field"><span className="label">Attachments</span><FileInput id="qf-files" files={files} onChange={setFiles} placeholder="Optional examples or files" /></div>
      <button type="submit" className="btn primary block" disabled={step === 'sending'}>{step === 'sending' ? 'Sending…' : `Send ${kind} Request`}</button>
      <p className="note">All inquiries go to RMG for scope review. Nothing is purchased automatically.</p>
    </form>
  );
}
