import { useState } from 'react';
import { useStore } from '../store';
import { fmtNum, fmtUsd } from '../lib/derive';
import { nyParts } from '../lib/time';
import { Badge, Modal, PageFoot, PageHeader, SimTag, Tabs } from '../components/ui';
import type { ReportPeriod } from '../data/types';

const TABS = ['Reports', 'Wins, Insights & History', 'Interaction Examples'] as const;
type TabT = typeof TABS[number];

export default function Reports() {
  const { tab, setTab } = useStore();
  const current = tab('reports', 'Reports') as TabT;
  return (
    <>
      <PageHeader title="Reports & Insights" sub="Your marketing growth, results, and opportunities." />
      <Tabs label="Reports & Insights sections" items={[...TABS]} value={current} onChange={(t) => setTab('reports', t)} />
      {current === 'Reports' && <ReportsTab />}
      {current === 'Wins, Insights & History' && <WinsTab />}
      {current === 'Interaction Examples' && <ExamplesTab />}
      <PageFoot left="RMG OS | Reports & Insights | Demonstration data" right={`Visual ${TABS.indexOf(current) + 1} of 3`} />
    </>
  );
}

function ReportView({ r, client }: { r: ReportPeriod; client: string }) {
  return (
    <div className="report-doc stack-sm">
      <div className="row between wrap"><strong style={{ fontSize: 15 }}>{client} | {r.reportName}</strong><Badge tone="green">Published</Badge></div>
      <p className="note">{r.range} · RMG-approved version</p>
      <h4 style={{ marginTop: 6 }}>Executive Summary</h4>
      <p style={{ fontSize: 12.5 }}>{r.summary}</p>
      <h4 style={{ marginTop: 6 }}>Results</h4>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>{r.results.map((x) => <li key={x}>{x}</li>)}</ul>
      <h4 style={{ marginTop: 6 }}>Recommended Focus</h4>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>{r.focus.map((x) => <li key={x}>{x}</li>)}</ul>
      <p className="note" style={{ fontSize: 10.5, marginTop: 6 }}>Online order sales are platform-reported and not attributed revenue.</p>
    </div>
  );
}

function useDownload() {
  const { openModal, closeModal } = useStore();
  return (name: string) => openModal(
    <Modal title="Download PDF" sub={name}>
      <SimTag>PDF export simulated</SimTag>
      <p>In production this downloads the RMG-branded PDF of the same stored, approved report version shown in the viewer. This demo has no report backend, so no file is generated.</p>
      <button className="btn block" onClick={closeModal}>Close</button>
    </Modal>,
  );
}

function ReportsTab() {
  const { client, setTab, state, update } = useStore();
  const download = useDownload();
  const key = (state.tabs['reports:period'] as ReportPeriod['key']) || 'Q';
  const [expanded, setExpanded] = useState(false);
  if (client.reports.length === 0) {
    return <section className="card stack-sm"><h2 className="card-title">Your Performance Reports</h2><p className="note">No published reports yet. Your first monthly report appears here after RMG reviews and publishes it.</p></section>;
  }
  const r = client.reports.find((x) => x.key === key) ?? client.reports[0];
  return (
    <>
      <section className="card">
        <h2 className="card-title">Your Performance Reports</h2>
        <p className="card-sub">Select a period to view a summary or download your full report.</p>
        <div className="grid2" style={{ marginTop: 12 }}>
          {client.reports.map((p) => {
            const sel = p.key === r.key;
            return (
              <button key={p.key} className="minirow" aria-pressed={sel} style={{ textAlign: 'left', background: sel ? 'var(--orange-soft)' : '#fff', borderColor: sel ? 'var(--orange)' : undefined }} onClick={() => { update((s) => { s.tabs['reports:period'] = p.key; }); setExpanded(false); }}>
                <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                  <span className="ico" style={{ width: 26, height: 26, fontSize: 12, background: sel ? '#ffe2bd' : undefined, color: sel ? 'var(--orange-text)' : undefined }}>{p.key}</span>
                  <div><div style={{ fontWeight: 700, fontSize: 13 }}>{p.title}</div><div className="note" style={{ fontSize: 10.5 }}>{p.sub}</div></div>
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 10, color: sel ? 'var(--orange-text)' : 'var(--muted)' }}>{sel ? 'Selected' : 'Select Report'}</div>
              </button>
            );
          })}
        </div>
      </section>
      <section className="card stack">
        <div className="row between" style={{ alignItems: 'flex-start' }}><div><h2 style={{ fontSize: 20 }}>{r.reportName}</h2><p className="note">{r.range}</p></div><Badge tone="green">Published</Badge></div>
        <div style={{ background: 'var(--navy)', color: '#fff', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11.5, opacity: 0.85 }}>Total Marketing Impressions</div>
          <div className="tnum" style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{fmtNum(r.impressions)}</div>
          <div style={{ fontSize: 11, color: '#9fe3bf', marginTop: 12 }}>+{r.growth}% vs. previous comparable period</div>
        </div>
        <div className="grid2">
          <div className="metric"><div className="lbl"><span className="kdot" />Website Visits</div><div className="val">{fmtNum(r.visits)}</div></div>
          <div className="metric"><div className="lbl"><span className="kdot" />Engagements</div><div className="val">{fmtNum(r.engagements)}</div></div>
          <div className="metric"><div className="lbl"><span className="kdot" />Online Order Sales</div><div className="val">{fmtUsd(r.orderSales)}</div><div className="note" style={{ fontSize: 9.5 }}>Platform-reported</div></div>
          <div className="metric"><div className="lbl"><span className="kdot" />Reporting Period</div><div className="val">{r.months}</div></div>
        </div>
        <div className="grid2">
          <button className="btn primary" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide Report' : 'View Report'}</button>
          <button className="btn" onClick={() => download(`${r.reportName} | ${r.range}`)}>Download PDF</button>
        </div>
        {expanded && <ReportView r={r} client={client.name} />}
      </section>
      <section className="card">
        <h2 className="card-title">Need a Previous Report?</h2>
        <p className="card-sub">Historical monthly and long-period reports</p>
        <button className="btn block" style={{ marginTop: 18 }} onClick={() => setTab('reports', 'Wins, Insights & History')}>View History &nbsp;&gt;</button>
        <p className="note" style={{ marginTop: 6, fontSize: 10.5 }}>Report actions open published records; PDF export uses the identical saved report.</p>
      </section>
    </>
  );
}

function WinsTab() {
  const { client, openModal } = useStore();
  const download = useDownload();
  const [menu, setMenu] = useState<string | null>(null);
  const openWin = (i: number) => openModal(<WinModal i={i} />);
  const history = client.reportHistory.filter((h) => h.kind === 'Monthly').slice(0, 3);
  return (
    <>
      {client.lifetime ? (
        <section className="card">
          <h2 className="card-title">Lifetime Marketing Impact</h2>
          <p className="card-sub">Since measurable tracking began ({client.lifetime.since})</p>
          <div className="panel-blue" style={{ marginTop: 12, padding: 14 }}>
            <div className="note">Total Marketing Impressions</div>
            <div className="tnum" style={{ fontSize: 30, fontWeight: 700 }}>{client.lifetime.impressions}</div>
            <div className="note" style={{ fontSize: 10 }}>Across connected advertising and social channels</div>
          </div>
          <div className="grid2" style={{ marginTop: 12, padding: '0 14px' }}>
            <div><div className="note" style={{ fontSize: 10.5 }}>Website Visits</div><div className="tnum" style={{ fontSize: 22, fontWeight: 700 }}>{fmtNum(client.lifetime.visits)}</div></div>
            <div><div className="note" style={{ fontSize: 10.5 }}>Engagements</div><div className="tnum" style={{ fontSize: 22, fontWeight: 700 }}>{fmtNum(client.lifetime.engagements)}</div></div>
          </div>
        </section>
      ) : <section className="card"><h2 className="card-title">Lifetime Marketing Impact</h2><p className="note">Tracking coverage hasn't started yet, so no lifetime totals are shown.</p></section>}

      <section className="card">
        <h2 className="card-title">Marketing Wins & Milestones</h2>
        <p className="card-sub">Validated wins appear automatically with source evidence.</p>
        <div className="stack-sm" style={{ marginTop: 12 }}>
          {client.wins.length === 0 && <p className="note">No validated wins yet. Wins appear once verified source data supports them.</p>}
          {client.wins.map((w, i) => (
            <button key={w.title} className="minirow" style={{ textAlign: 'left' }} onClick={() => openWin(i)}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <span className="ico lg" style={{ background: '#e4ecf8' }}>*</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{w.title}</div><div className="note">{w.detail}</div><div className="note" style={{ fontSize: 10, marginTop: 8 }}>Source: {w.source}</div></div>
                <div className="tnum" style={{ fontSize: 18, fontWeight: 700 }}>{w.value}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {client.insights.working && (
        <section className="card">
          <h2 className="card-title">Insights & Opportunities</h2>
          <div className="minirow" style={{ marginTop: 10 }}><div className="row" style={{ gap: 8 }}><span className="statusdot green" /><strong style={{ fontSize: 12.5 }}>What's Working</strong></div><p className="note" style={{ marginTop: 4 }}>{client.insights.working}</p></div>
          <div className="minirow" style={{ marginTop: 8 }}><div className="row" style={{ gap: 8 }}><span className="statusdot orange" /><strong style={{ fontSize: 12.5 }}>Growth Opportunities</strong></div><p className="note" style={{ marginTop: 4 }}>{client.insights.opportunities}</p></div>
          <p className="note" style={{ fontSize: 10, marginTop: 8 }}>Formal narratives are reviewed and approved by RMG before publication.</p>
        </section>
      )}

      <section className="card">
        <div className="row between"><h2 className="card-title">Report History</h2><button className="btn" onClick={() => openModal(<ArchiveModal />)}>View All</button></div>
        {history.length === 0 && <p className="note" style={{ marginTop: 10 }}>No published reports yet.</p>}
        {history.map((h) => (
          <div key={h.label} className="list-row" style={{ position: 'relative' }}>
            <strong style={{ fontSize: 12.5, width: 110 }}>{h.label}</strong>
            <span className="note" style={{ flex: 1 }}>{h.name}</span>
            <button className="linkbtn" aria-expanded={menu === h.label} onClick={() => setMenu(menu === h.label ? null : h.label)}>PDF v</button>
            {menu === h.label && (
              <div className="card tight" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 5, padding: 6, display: 'grid', gap: 4, boxShadow: '0 8px 20px rgba(9,35,84,.12)' }}>
                <button className="btn sm" onClick={() => { setMenu(null); openModal(<Modal title={`${h.label} ${h.name}`}><SimTag>Archived snapshot (illustrative)</SimTag><p>This opens the frozen, versioned report published for {h.label}. Historical exports always match their stored snapshot.</p></Modal>); }}>View Report</button>
                <button className="btn sm" onClick={() => { setMenu(null); download(`${h.label} ${h.name}`); }}>Download PDF</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}

function WinModal({ i }: { i: number }) {
  const { client } = useStore();
  const w = client.wins[i];
  return (
    <Modal title={w.title} sub="Verified Win Details">
      <div className="panel-blue"><div className="row" style={{ gap: 14 }}><span className="tnum" style={{ fontSize: 26, fontWeight: 700 }}>{w.value}</span><span className="note">{w.detail}</span></div></div>
      {([['Measurement Period', w.period], ['Baseline', w.baseline], ['Source System', w.source], ['Verification Evidence', w.evidence], ['Classification', w.cls]] as const).map(([k, v]) => (
        <div key={k} className="row between" style={{ fontSize: 12.5, borderBottom: '1px solid var(--line-2)', paddingBottom: 8 }}><span className="note">{k}</span><strong style={{ textAlign: 'right' }}>{v}</strong></div>
      ))}
      <p className="note">Wins appear automatically when source-backed evidence verifies them. If the evidence changes, the win is adjusted or retracted.</p>
    </Modal>
  );
}

function ArchiveModal() {
  const { client, openModal } = useStore();
  const [kind, setKind] = useState<'All' | 'Monthly' | 'Quarterly' | 'Six-Month' | 'Annual'>('All');
  const list = client.reportHistory.filter((h) => kind === 'All' || h.kind === kind);
  return (
    <Modal title="Report Archive" sub="Published monthly, quarterly, six-month and annual reports" wide>
      <div className="seg">{(['All', 'Monthly', 'Quarterly', 'Six-Month', 'Annual'] as const).map((k) => <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{k}</button>)}</div>
      <div>{list.map((h) => (
        <div key={h.label} className="list-row"><strong style={{ width: 110, fontSize: 12.5 }}>{h.label}</strong><span className="note" style={{ flex: 1 }}>{h.name}</span>
          <button className="btn sm" onClick={() => openModal(<Modal title={`${h.label} ${h.name}`}><SimTag>Archived snapshot (illustrative)</SimTag><p>Opens the frozen published version of this report.</p></Modal>)}>View</button></div>
      ))}</div>
    </Modal>
  );
}

function ExamplesTab() {
  const { client, state, update, toast, openModal, closeModal } = useStore();
  const download = useDownload();
  const [sel, setSel] = useState<'survey' | 'win' | 'report'>('survey');
  const [score, setScore] = useState(8);
  const [comment, setComment] = useState('');
  const [showReport, setShowReport] = useState(false);
  const p = nyParts(new Date());
  const month = `${p.y}-${String(p.m).padStart(2, '0')}`;
  const existing = state.nps.find((n) => n.clientId === client.id && n.month === month);
  const q = client.reports.find((r) => r.key === 'Q');
  const win = client.wins[0];
  const opts = [['survey', 'Monthly Client Survey'], ['win', 'Verified Win Details'], ['report', 'Report Viewing']] as const;
  return (
    <>
      <section className="card">
        <h2 className="card-title">Interaction Examples</h2>
        <p className="card-sub">Examples of the actions available on published reports, wins, and surveys.</p>
        <div role="radiogroup" style={{ marginTop: 8 }}>
          {opts.map(([k, l]) => <button key={k} role="radio" aria-checked={sel === k} className={`radio${sel === k ? ' on' : ''}`} onClick={() => setSel(k)}><span className="r" />{l}</button>)}
        </div>
      </section>

      {sel === 'survey' && (
        <section className="card stack">
          <div><h2 className="card-title" style={{ fontSize: 19 }}>How Are We Doing?</h2><p className="card-sub" style={{ fontSize: 10.5 }}>Your Monthly RMG Experience Survey</p></div>
          {existing ? (
            <div className="panel-blue stack-sm">
              <Badge tone="green" dot>Submitted for {new Date(Date.UTC(p.y, p.m - 1, 15)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })}</Badge>
              <p>You rated RMG <strong>{existing.score} / 10</strong>. Thank you. The next survey opens next month.</p>
              {existing.comment && <p className="note">“{existing.comment}”</p>}
              <p className="note">One response per month. Your feedback stays private to your RMG team.</p>
            </div>
          ) : (
            <>
              <label htmlFor="nps" style={{ fontWeight: 700, fontSize: 13 }}>How likely are you to recommend RMG to another restaurant owner?</label>
              <div className="row between" style={{ marginTop: 6 }}><span className="note" style={{ fontSize: 10.5 }}>Not Likely</span><span className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>{score} / 10</span><span className="note" style={{ fontSize: 10.5 }}>Very Likely</span></div>
              <input id="nps" className="nps" type="range" min={0} max={10} step={1} value={score} onChange={(e) => setScore(Math.round(Number(e.target.value)))} aria-valuetext={`${score} out of 10`} />
              <label htmlFor="nps-comment" style={{ fontWeight: 700, fontSize: 12.5 }}>What's One Thing We Could Improve? (Optional)</label>
              <textarea id="nps-comment" className="textarea" style={{ background: '#fff' }} placeholder="Share your feedback..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className="btn primary block" onClick={() => openModal(
                <Modal title="Preview Survey Submission" sub="Your Monthly RMG Experience Survey">
                  <div className="panel-blue"><div className="note">Likelihood to recommend RMG</div><div className="tnum" style={{ fontSize: 24, fontWeight: 700 }}>{score} / 10</div></div>
                  <div><div className="note">What's One Thing We Could Improve?</div><p>{comment.trim() || 'No comment'}</p></div>
                  <button className="btn primary block" onClick={() => {
                    update((s) => { s.nps.unshift({ id: `nps-${Date.now()}`, clientId: client.id, month, score, comment: comment.trim(), at: new Date().toISOString() }); });
                    closeModal();
                    toast(score <= 6 ? 'Survey submitted. Your account manager will follow up.' : 'Survey submitted. Thank you!');
                  }}>Submit Survey</button>
                  <button className="btn block" onClick={closeModal}>Edit Response</button>
                </Modal>,
              )}>Preview Survey Submission</button>
              <p className="note" style={{ fontSize: 10.5 }}>Scores 0-10 only. One response per month; low scores alert your account manager privately.</p>
            </>
          )}
        </section>
      )}

      {sel === 'win' && (
        <section className="card stack-sm">
          <h2 className="card-title">Verified Win Details</h2>
          {win ? (
            <>
              <div className="panel-blue">
                <strong style={{ fontSize: 13 }}>{win.title}</strong>
                <div className="row" style={{ gap: 30, marginTop: 6 }}><span className="tnum" style={{ fontSize: 24, fontWeight: 700 }}>{win.value}</span><span className="note">{win.detail.toLowerCase()}</span></div>
                <p className="note" style={{ fontSize: 10.5, marginTop: 6 }}>Source: {win.source} | {win.evidence}</p>
              </div>
              {([['Measurement Period', win.period], ['Baseline', win.baseline], ['Classification', win.cls]] as const).map(([k, v]) => <div key={k} className="row between" style={{ fontSize: 12.5 }}><span className="note">{k}</span><strong>{v}</strong></div>)}
            </>
          ) : <p className="note">No verified wins yet.</p>}
        </section>
      )}

      {sel === 'report' && (
        <section className="card stack-sm">
          <h2 className="card-title">Report Viewing</h2>
          {q ? (
            <>
              <strong style={{ fontSize: 13 }}>Quarterly Marketing Report</strong>
              <p className="note">{q.range}</p>
              <div className="grid2" style={{ marginTop: 12 }}>
                <button className="btn primary" onClick={() => setShowReport(!showReport)}>{showReport ? 'Hide Published Report' : 'View Published Report'}</button>
                <button className="btn" onClick={() => download(`Quarterly Marketing Report | ${q.range}`)}>Download PDF</button>
              </div>
              {showReport && <ReportView r={q} client={client.name} />}
            </>
          ) : <p className="note">No published quarterly report yet.</p>}
          <p className="note" style={{ fontSize: 10.5, marginTop: 6 }}>Static demonstration of interactive controls, not live account submissions.</p>
        </section>
      )}
    </>
  );
}
