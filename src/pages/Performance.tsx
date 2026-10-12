import { useState } from 'react';
import { useStore } from '../store';
import { AD_STATE, CONN, fmtNum, fmtUsd } from '../lib/derive';
import { fmtFull, fmtStamp } from '../lib/time';
import { useRequestsNav } from '../lib/nav';
import { Badge, Band, Ico, PageFoot, PageHeader, PostThumb, Tabs, useInfo } from '../components/ui';
import type { ConnState, PlatformCard } from '../data/types';

const TABS = ['Revenue Snapshot', 'Marketing Snapshot', 'Digital Marketing Snapshot', 'Social Media Snapshot'] as const;
type TabT = typeof TABS[number];
const PERIODS = [
  { key: '7', label: 'Last 7 Days', f: 0.24, weeks: ['Day 1-2', 'Day 3-4', 'Day 5-6', 'Day 7'] },
  { key: '30', label: 'Last 30 Days', f: 1, weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
  { key: '90', label: 'Last 90 Days', f: 2.9, weeks: ['Month 1', 'Month 2', 'Month 3', 'Now'] },
  { key: '365', label: 'Last 12 Months', f: 11.4, weeks: ['Q1', 'Q2', 'Q3', 'Q4'] },
  { key: 'custom', label: 'Custom Date Range', f: 1, weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
];

export default function Performance() {
  const { tab, setTab, state, update } = useStore();
  const current = tab('performance', 'Revenue Snapshot') as TabT;
  const periodKey = state.tabs['performance:period'] || '30';
  const period = PERIODS.find((p) => p.key === periodKey)!;
  const [from, setFrom] = useState('2026-09-11');
  const [to, setTo] = useState('2026-10-10');
  const scale = (n: number) => Math.round(n * period.f);
  return (
    <>
      <PageHeader title="Performance Dashboard" sub="Your marketing results in one place." />
      <Tabs four label="Performance Dashboard snapshots" items={[...TABS]} value={current} onChange={(t) => setTab('performance', t)} />
      <section className="card tight" style={{ padding: '14px 16px' }}>
        <div className="row between"><label htmlFor="period" style={{ fontWeight: 700, fontSize: 14 }}>Reporting Period</label>
          <button className="linkbtn" style={{ color: 'var(--muted)', fontWeight: 400 }} onClick={() => update((s) => { s.tabs['performance:period'] = 'custom'; })}>Calendar</button></div>
        <select id="period" className="select" style={{ marginTop: 10, fontWeight: 700, fontSize: 12 }} value={periodKey} onChange={(e) => update((s) => { s.tabs['performance:period'] = e.target.value; })}>
          {PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        {periodKey === 'custom' && (
          <div className="grid2" style={{ marginTop: 10 }}>
            <input aria-label="From" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input aria-label="To" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}
        <p className="note" style={{ marginTop: 8, fontSize: 10.5 }}>Applies to every tab. Followers are point-in-time totals. Data as of {fmtStamp(new Date().toISOString())} ET (demo data).</p>
      </section>
      {current === 'Revenue Snapshot' && <Revenue scale={scale} />}
      {current === 'Marketing Snapshot' && <Marketing scale={scale} weeks={period.weeks} label={period.label} />}
      {current === 'Digital Marketing Snapshot' && <Digital scale={scale} />}
      {current === 'Social Media Snapshot' && <Social scale={scale} />}
      <PageFoot left="RMG OS | Performance Dashboard | Illustrative data" />
    </>
  );
}

function ConnDot({ c }: { c: ConnState }) {
  return <span className={`statusdot ${CONN[c].tone}`} title={CONN[c].label} aria-label={CONN[c].label} />;
}

function Unavailable({ title, body }: { title: string; body: string }) {
  const nav = useRequestsNav();
  return (
    <section className="card stack-sm">
      <div className="row between"><h3 className="card-title">{title}</h3><Badge tone="gray">Unavailable</Badge></div>
      <p className="note">{body}</p>
      <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => nav('submit', { prefill: '68' })}>Report Missing Analytics</button>
    </section>
  );
}

function Revenue({ scale }: { scale: (n: number) => number }) {
  const { client } = useStore();
  const info = useInfo();
  const cards = client.perf.revenue;
  const ordering = cards.filter((c) => c.unit === 'usd' && c.conn === 'connected' && c.value !== null);
  const total = ordering.reduce((a, c) => a + scale(c.value!), 0);
  const open = (c: PlatformCard) => info(c.name, (
    <div className="stack-sm">
      <div className="row between"><span>Connection</span><Badge tone={CONN[c.conn].tone}>{CONN[c.conn].label}</Badge></div>
      <div className="row between"><span>Metric</span><strong>{c.label}</strong></div>
      <div className="row between"><span>Last Sync</span><strong>{c.synced ? fmtStamp(c.synced) : 'Never'}</strong></div>
      <p className="note">{c.unit === 'usd' ? 'Platform-reported gross sales from the provider. Not automatically attributable to RMG marketing.' : 'Reservation counts are kept separate from dollar revenue.'}</p>
    </div>
  ), { sim: 'Demo values' });
  return (
    <>
      <Band title="Revenue Snapshot" tag="Reservations & Online Ordering" plain />
      <p className="band-caption">Performance from your connected reservation, delivery and catering platforms.</p>
      <div className="grid2">
        {cards.map((c) => (
          <button key={c.key} className="card" style={{ textAlign: 'left' }} onClick={() => open(c)}>
            <div className="row between"><div className="row" style={{ gap: 10 }}><Ico>{c.letter}</Ico><strong style={{ fontSize: 13 }}>{c.name}</strong></div><ConnDot c={c.conn} /></div>
            {c.conn === 'connected' && c.value !== null ? (
              <><div className="big-number" style={{ marginTop: 8 }}>{c.unit === 'usd' ? fmtUsd(scale(c.value)) : fmtNum(scale(c.value))}</div><div className="note">{c.label}</div></>
            ) : (
              <><div style={{ fontSize: 16, fontWeight: 700, marginTop: 12, color: 'var(--muted)' }}>{CONN[c.conn].label}</div><div className="note">{c.label} unavailable</div></>
            )}
          </button>
        ))}
        <div className="panel-blue"><strong>Source-Aware Metrics</strong><p className="note" style={{ marginTop: 6 }}>Cards show their source, last sync, and availability.</p></div>
      </div>
      <section className="card">
        <div className="row between wrap"><h3 style={{ fontSize: 15 }}>Total Online-Ordering Revenue</h3></div>
        <div className="row between wrap" style={{ marginTop: 14 }}>
          {ordering.length ? <div className="big-number" style={{ fontSize: 36 }}>{fmtUsd(total)}</div> : <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--muted)' }}>No connected ordering platforms</div>}
          <Badge tone="green">Platform-Reported</Badge>
        </div>
        <p className="note" style={{ marginTop: 10 }}>Sample sales combined from {ordering.map((c) => c.name).join(', ').replace(/, ([^,]*)$/, ', and $1') || 'no connected platforms'}.</p>
        <p className="note" style={{ marginTop: 10 }}>Not automatically attributable to RMG marketing. OpenTable reservations are counted separately.</p>
      </section>
      <section className="panel-blue">
        <strong style={{ fontSize: 14 }}>Connected Data, Not Manual Placeholders</strong>
        <p className="note" style={{ marginTop: 8 }}>Only compatible verified metrics are combined. Unavailable integrations show their status, not a false zero or invented revenue.</p>
        <p className="note" style={{ marginTop: 18, fontSize: 10.5 }}>Account-specific source attribution and latest update time will be shown in production.</p>
      </section>
    </>
  );
}

function Marketing({ scale, weeks, label }: { scale: (n: number) => number; weeks: string[]; label: string }) {
  const { client } = useStore();
  const info = useInfo();
  const m = client.perf.marketing;
  if (!m) return (<><Band title="Marketing Snapshot" tag="Across Connected Channels" plain /><Unavailable title="Marketing Snapshot" body="Connected social and analytics accounts haven't returned verified data yet. Nothing is estimated while integrations are unavailable." /></>);
  const tiles: [string, number][] = [['Total Impressions', scale(m.impressions)], ['Profile Page Views', scale(m.profileViews)], ['Social Link Clicks', scale(m.linkClicks)], ['Website Visits', scale(m.websiteVisits)], ['Total Engagements', scale(m.engagements)], ['Total Followers', m.followers]];
  const max = Math.max(...m.byNetwork.map((n) => n.value));
  const colors = ['var(--navy)', 'var(--orange)', '#7f9fcf', '#7fcf9f'];
  return (
    <>
      <Band title="Marketing Snapshot" tag="Across Connected Channels" plain />
      <p className="band-caption">Overall marketing performance aggregated across supported platforms.</p>
      <div className="grid2">
        {tiles.map(([l, v]) => <div key={l} className="card"><div className="note row" style={{ gap: 8 }}><span className="kdot" />{l}</div><div className="big-number" style={{ fontSize: 24, marginTop: 10 }}>{fmtNum(v)}</div></div>)}
      </div>
      <section className="card">
        <div className="row between"><h3 style={{ fontSize: 15 }}>Website Traffic Trend</h3><span className="note" style={{ fontSize: 10.5 }}>GA4 | {label}</span></div>
        <LineChart values={m.trend.map(scale)} labels={weeks} />
      </section>
      <section className="card">
        <h3 style={{ fontSize: 15 }}>Engagement by Network</h3>
        <div className="stack-sm" style={{ marginTop: 12 }}>
          {m.byNetwork.map((n, i) => (
            <div key={n.name} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 56px', alignItems: 'center', gap: 10, fontSize: 11.5 }}>
              <strong>{n.name}</strong>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(n.value / max) * 100}%`, background: colors[i] }} /></div>
              <strong className="tnum" style={{ textAlign: 'right' }}>{fmtNum(scale(n.value))}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h3 style={{ fontSize: 15 }}>Top 3 Performing Posts</h3>
        <div className="grid3" style={{ marginTop: 12 }}>
          {m.top.map((p, i) => (
            <button key={i} style={{ border: 0, background: 'none', padding: 0, textAlign: 'left' }} onClick={() => info('Published Post', <p>{fmtNum(p.engagements)} engagements on {p.platform}. Opens the already-published post.</p>, { sim: 'Opens published post in production' })}>
              <PostThumb tone={['steak', 'pasta', 'taco'][i]} />
              <div style={{ fontWeight: 700, fontSize: 11.5, marginTop: 6 }}>{fmtNum(p.engagements)} engagements</div>
              <div className="note" style={{ fontSize: 10.5 }}>{p.platform}</div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 520, H = 120, padX = 16, top = 14, bottom = 92;
  const min = Math.min(...values) * 0.8, max = Math.max(...values) * 1.08;
  const x = (i: number) => padX + (i * (W - padX * 2)) / (values.length - 1);
  const y = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - top);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Website visits by period: ${values.map((v, i) => `${labels[i]} ${fmtNum(v)}`).join(', ')}`} style={{ marginTop: 10, overflow: 'visible' }}>
      {[0, 1, 2].map((g) => <line key={g} x1={padX} x2={W - padX} y1={top + (g * (bottom - top)) / 2} y2={top + (g * (bottom - top)) / 2} stroke="#e9edf3" />)}
      <polyline points={`${x(0)},${bottom} ${pts} ${x(values.length - 1)},${bottom}`} fill="rgba(250,131,0,0.08)" stroke="none" />
      <polyline points={pts} fill="none" stroke="#fa8300" strokeWidth="2.5" />
      {values.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 5 : 4} fill="#fff" stroke="#fa8300" strokeWidth="2" />
          <text x={x(i)} y={y(v) - 9} textAnchor="middle" fontSize="9" fill="#6b7a90">{fmtNum(v)}</text>
          <text x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === values.length - 1 ? 'end' : 'middle'} fontSize="10" fill="#6b7a90">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

function BarList({ title, rows, scale }: { title: string; rows: { name: string; value: number }[]; scale: (n: number) => number }) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>{title}</h3>
      <div className="stack">
        {rows.map((r) => (
          <div key={r.name}>
            <div className="row between" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}><span>{r.name}</span><span className="tnum">{fmtNum(scale(r.value))}</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function scoreTone(n: number) { return n >= 90 ? { c: '#22a565', l: 'Good' } : n >= 50 ? { c: '#e08a00', l: 'Needs Improvement' } : { c: '#dc3c4b', l: 'Poor' }; }

function Digital({ scale }: { scale: (n: number) => number }) {
  const { client, toast } = useStore();
  const info = useInfo();
  const [device, setDevice] = useState<'Mobile' | 'Desktop'>('Mobile');
  const [agenticRun, setAgenticRun] = useState(false);
  const g = client.perf.ga4, psi = client.perf.psi, ag = client.perf.agentic;
  const scores = psi ? (device === 'Mobile' ? psi.mobile : psi.desktop) : [];
  const labels = ['Performance', 'Accessibility', 'Best Practices', 'SEO'];
  return (
    <>
      <Band title="Digital Marketing Snapshot" tag="Traffic, Conversions & Site Quality" plain />
      {g ? (
        <section className="card stack">
          <div className="row between"><h3 className="card-title">Google Analytics 4</h3><Badge tone={CONN[g.conn].tone}>{CONN[g.conn].label}</Badge></div>
          <div className="grid2">
            <div className="metric"><div className="lbl">Website Visits</div><div className="val">{fmtNum(scale(g.visits))}</div></div>
            <div className="metric"><div className="lbl">Total Page Views</div><div className="val">{fmtNum(scale(g.pageViews))}</div></div>
            <div className="metric"><div className="lbl">Website Conversions</div><div className="val">{fmtNum(scale(g.conversions))}</div></div>
          </div>
          <BarList title="Website Visits by Source" rows={g.bySource} scale={scale} />
          <hr className="divider" />
          <BarList title="Website Conversions by Network Source" rows={g.convBySource} scale={scale} />
          <p className="note" style={{ fontSize: 10.5 }}>Visits = GA4 sessions. Conversions = GA4 key events. Sources use GA4 default channel groups.</p>
        </section>
      ) : <Unavailable title="Google Analytics 4" body="GA4 isn't connected for this account, so website visits and conversions are unavailable rather than shown as zero." />}

      <Band title="Digital Marketing Snapshot" tag="PageSpeed Insights & Advertising" plain />
      {psi ? (
        <section className="card stack">
          <div className="row between wrap" style={{ alignItems: 'flex-start' }}>
            <div><h3 className="card-title">Google PageSpeed Insights</h3><p className="card-sub">Four standard Lighthouse audit scores for the tested website and device.</p></div>
            <div className="seg" role="group" aria-label="Device">{(['Mobile', 'Desktop'] as const).map((d) => <button key={d} className={device === d ? 'on' : ''} onClick={() => setDevice(d)}>{d}</button>)}</div>
          </div>
          <p className="note" style={{ fontSize: 10.5 }}>{psi.url} | {device} | Sample Test | Tested {fmtFull(psi.testedAt)} | Source: Google PageSpeed Insights / Lighthouse</p>
          <div className="grid4">
            {scores.map((s, i) => { const t = scoreTone(s); return (
              <div key={labels[i]} className="card tight" style={{ textAlign: 'center' }}>
                <div className="ring" style={{ border: `5px solid ${t.c}` }} aria-label={`${labels[i]} ${s} out of 100, ${t.l}`}>{s}</div>
                <div style={{ fontWeight: 700, fontSize: 11.5, marginTop: 8 }}>{labels[i]}</div>
                <div className="note" style={{ fontSize: 9.5 }}>/ 100 · {t.l}</div>
              </div>
            ); })}
          </div>
          <div className="panel-blue stack-sm">
            <div className="row between"><h3 style={{ fontSize: 15 }}>Agentic Browsing</h3><Badge tone="orange">EXPERIMENTAL</Badge></div>
            {ag ? (
              <div className="row wrap" style={{ gap: 18 }}><span className="big-number" style={{ fontSize: 30 }}>{ag.passed} / {ag.applicable}</span><span className="note">Illustrative checks passed / applicable checks; NOT scored out of 100.</span></div>
            ) : (
              <div className="row wrap" style={{ gap: 12 }}><Badge tone="gray">Unavailable</Badge><button className="btn sm" onClick={() => { setAgenticRun(true); toast('Agentic audit not returned by the integration. Status stays Unavailable.'); }}>Run Agentic Audit</button></div>
            )}
            {agenticRun && <p className="note">The audit did not return agentic-browsing results, so no score is shown.</p>}
            <p className="note" style={{ fontSize: 10.5 }}>Agent-readiness audits are evolving. Show the available fractional result and detailed status only when a supported Lighthouse/PSI response provides it.</p>
            <p className="note" style={{ fontSize: 10 }}>If not returned by the integration, show Unavailable or Run Agentic Audit - never substitute an invented 0-100 score.</p>
          </div>
        </section>
      ) : <Unavailable title="Google PageSpeed Insights" body="No PageSpeed audit has been run for this website yet." />}

      <section className="card stack-sm">
        <h3 className="card-title" style={{ fontSize: 15 }}>Search Visibility (SEO)</h3>
        <p className="note">Separate search analytics from the PageSpeed SEO audit score. Connect Search Console for query, search impressions and ranking-related metrics.</p>
        {!client.perf.gscConnected && <div className="row wrap" style={{ gap: 10, marginTop: 6 }}><Badge tone="gray">Search Console Not Connected</Badge><button className="btn sm" onClick={() => info('Connect Search Console', <p>Your account manager connects Google Search Console with your permission. Once verified, search queries, impressions and ranking-related metrics appear here.</p>, { sim: 'Integration not connected in demo' })}>How to Connect</button></div>}
      </section>

      <section className="card">
        <h3 className="card-title" style={{ fontSize: 15 }}>Paid Advertising</h3>
        {([['Meta Ads', client.ads.meta, client.perf.adClicks.meta], ['Google Ads', client.ads.google, client.perf.adClicks.google]] as const).map(([n, st, clicks]) => (
          <div key={n} className="list-row">
            <span className={`statusdot ${AD_STATE[st].tone}`} />
            <div><div className="t">{n}</div><div className="s">{clicks !== null && st === 'live' ? `${fmtNum(scale(clicks))} link clicks` : AD_STATE[st].sub}</div></div>
            <span style={{ marginLeft: 'auto' }}><Badge tone={AD_STATE[st].tone}>{AD_STATE[st].label}</Badge></span>
          </div>
        ))}
        <p className="note" style={{ fontSize: 10.5, marginTop: 8 }}>Live status must be verified via account/campaign delivery and recent activity. Last checked {fmtStamp(client.ads.checkedAt)} ET.</p>
      </section>
    </>
  );
}

function Social({ scale }: { scale: (n: number) => number }) {
  const { client, state, update } = useStore();
  const info = useInfo();
  const nets = client.perf.social;
  const sel = nets.find((n) => n.key === state.tabs['performance:social']) ?? nets[0];
  const tiles: [string, string][] = [['Impressions', fmtNum(scale(sel.impressions))], ['Profile Views', fmtNum(scale(sel.profileViews))], ['Total Link Clicks', fmtNum(scale(sel.linkClicks))], ['Website Clicks', fmtNum(scale(sel.websiteClicks))], ['Engagements', fmtNum(scale(sel.engagements))], ['Engagement Rate', `${sel.engagementRate}%`], ['Total Followers', fmtNum(sel.followers)]];
  return (
    <>
      <Band title="Social Media Snapshot" tag="Individual Social Networks" plain />
      <p className="band-caption">Select a network to view its own analytics and top three published posts.</p>
      <section className="card">
        <h3 style={{ fontSize: 14 }}>Social Platform</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 8, marginTop: 12 }}>
          {nets.map((n) => (
            <button key={n.key} className="btn" style={sel.key === n.key ? { borderColor: 'var(--orange)', background: 'var(--orange-soft)' } : undefined} aria-pressed={sel.key === n.key} onClick={() => update((s) => { s.tabs['performance:social'] = n.key; })}>{n.name}</button>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="row between" style={{ alignItems: 'flex-start' }}><div className="row"><Ico lg>{sel.short}</Ico><h3 style={{ fontSize: 18 }}>{sel.name} Analytics</h3></div><Badge tone={CONN[sel.conn].tone}>{CONN[sel.conn].label}</Badge></div>
        {sel.conn === 'connected' ? (
          <div className="grid2" style={{ marginTop: 14 }}>{tiles.map(([l, v]) => <div key={l} className="metric"><div className="lbl">{l}</div><div className="val">{v}</div></div>)}</div>
        ) : (
          <p className="note" style={{ marginTop: 14 }}>{sel.conn === 'delayed' ? `${sel.name} data is delayed. Metrics return once the next sync completes.` : `${sel.name} isn't connected for this account, so no metrics are shown.`}</p>
        )}
      </section>
      {sel.conn === 'connected' && sel.top.length > 0 && (
        <section className="card">
          <h3 style={{ fontSize: 15 }}>Top 3 Published Posts - {sel.name}</h3>
          <p className="note">Ranked by engagements in the selected reporting period.</p>
          <div className="grid3" style={{ marginTop: 12 }}>
            {sel.top.map((e, i) => (
              <div key={i}>
                <PostThumb tone={['steak', 'pasta', 'taco'][i]} />
                <div style={{ fontWeight: 700, fontSize: 11.5, marginTop: 6 }}>{fmtNum(scale(e))} engagements</div>
                <button className="linkbtn" style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 10.5 }} onClick={() => info('Open Published Post', <p>Opens the already-published {sel.name} post. Scheduled or unpublished posts are never shown.</p>, { sim: 'Opens published post in production' })}>Open Published Post</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
