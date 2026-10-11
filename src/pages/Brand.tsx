import { useState } from 'react';
import { useStore } from '../store';
import { useRequestsNav } from '../lib/nav';
import { fmtFull } from '../lib/time';
import { Badge, Band, PageFoot, PageHeader, Tabs } from '../components/ui';

const TABS = ['Strategy Overview', 'Audience & Ads', 'Brand & References'] as const;
type TabT = typeof TABS[number];

export default function Brand() {
  const { tab, setTab, client, update } = useStore();
  const nav = useRequestsNav();
  const current = tab('brand', 'Strategy Overview') as TabT;
  const b = client.brand;
  return (
    <>
      <PageHeader title="Brand Snapshot" sub="Your marketing direction, priorities, audience and brand." />
      {!b ? (
        <section className="card stack">
          <div className="row between"><h2 className="card-title">Your Brand Snapshot</h2><Badge tone="gray">Not Yet Published</Badge></div>
          <p className="note" style={{ fontSize: 12.5 }}>Your RMG team hasn't published an approved Brand Snapshot for {client.name} yet. Once your strategy is approved, your priorities, audience, ad blueprint and brand references appear here.</p>
          <div className="demo-banner"><span>Demo: the approved example Brand Snapshot belongs to the Columbia Inn sample client.</span><button className="btn sm" onClick={() => update((s) => { s.clientId = 'columbia'; s.page = 'brand'; })}>Switch to Columbia Inn</button></div>
        </section>
      ) : (
        <>
          <Tabs label="Brand Snapshot sections" items={[...TABS]} value={current} onChange={(t) => setTab('brand', t)} />
          {current === 'Strategy Overview' && (
            <>
              <Band title="Key Focus Areas & Content Pillars" tag="Content Strategy" />
              <section className="card">
                <div className="row between"><h3 className="card-title" style={{ fontSize: 15 }}>Current Campaigns</h3></div>
                <div style={{ marginTop: 6 }}>
                  {b.campaigns.map((c) => (
                    <div key={c.name} className="list-row" style={{ alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}><div className="t">{c.name}</div><div className="s">{c.detail}</div></div>
                      {c.priority && <Badge tone="orange">Priority</Badge>}
                    </div>
                  ))}
                </div>
              </section>
              <section className="card">
                <h3 className="card-title" style={{ fontSize: 15 }}>Recurring Promotion</h3>
                <div className="row between" style={{ marginTop: 8 }}>
                  <div><div style={{ fontWeight: 700 }}>{b.recurring.name}</div><div className="note">{b.recurring.detail}</div></div>
                  <Badge tone="orange">{b.recurring.cadence}</Badge>
                </div>
              </section>
              <section className="card">
                <h3 className="card-title" style={{ fontSize: 15 }}>Other Focus Areas</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gap: 12 }}>
                  {b.focus.map((f) => <li key={f} className="row" style={{ gap: 10, fontSize: 12.5 }}><span className="kdot" />{f}</li>)}
                </ul>
                <hr className="divider" />
                <div className="row wrap" style={{ gap: 14, fontSize: 12 }}><strong>Future Campaign</strong><span className="note">{b.future}</span></div>
              </section>
            </>
          )}
          {current === 'Audience & Ads' && (
            <>
              <Band title="Target Audience & Advertising Blueprint" tag="Planned Strategy" />
              <section className="card">
                <h3 className="card-title" style={{ fontSize: 15 }}>Audience Segments</h3>
                {b.segments.map((s) => <div key={s.title} className="list-row" style={{ display: 'block' }}><div className="t">{s.title}</div><div className="s">{s.detail}</div></div>)}
              </section>
              <section className="card">
                <h3 className="card-title" style={{ fontSize: 15 }}>Advertising Blueprint</h3>
                <div className="row wrap" style={{ gap: 24, marginTop: 12, alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--orange-soft)', borderRadius: 10, padding: '10px 14px' }}><div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: '.05em', color: 'var(--orange-text)' }}>MONTHLY BUDGET</div><div style={{ fontSize: 22, fontWeight: 700 }}>{b.budget}</div></div>
                  <div><div className="note" style={{ fontWeight: 700 }}>Placements</div><div style={{ fontWeight: 700, marginTop: 6 }}>{b.placements}</div></div>
                </div>
                <div style={{ marginTop: 14 }}><strong style={{ fontSize: 12.5 }}>Target Geography</strong><p style={{ fontSize: 12, marginTop: 6 }}>{b.geography}</p></div>
                <hr className="divider" />
                <div className="row wrap" style={{ gap: 14, fontSize: 12 }}><strong>Ad Targeting</strong><span className="note">{b.targeting}</span></div>
                <p className="note" style={{ fontSize: 10.5, marginTop: 10 }}>Planned strategy only. Live ad delivery status comes from connected Meta and Google accounts on Home and the Performance Dashboard.</p>
              </section>
              <section className="card">
                <h3 className="card-title" style={{ fontSize: 15 }}>Audience Motivations</h3>
                {b.motivations.map((m) => <div key={m.name} className="list-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}><span className="t">{m.name}</span><span className="note">{m.detail}</span></div>)}
              </section>
            </>
          )}
          {current === 'Brand & References' && <BrandRefs />}
          <section className="card row between wrap">
            <div style={{ minWidth: 0, flex: '1 1 240px' }}><strong>Have Thoughts on Your Strategy?</strong><p className="note">Share general feedback with your RMG team. Strategy changes are made by RMG.</p></div>
            <button className="btn" onClick={() => nav('feedback')}>Share Feedback</button>
          </section>
          <p className="note" style={{ padding: '0 4px', fontSize: 10.5 }}>{b.publishedOn ? `Last updated ${fmtFull(b.publishedOn)}.` : 'Approved strategy. No revision date provided in the source snapshot.'} Strategy categories, not verified live campaign data.</p>
        </>
      )}
      <PageFoot left={`Brand Snapshot | ${client.name} | Illustrative client view`} />
    </>
  );
}

function BrandRefs() {
  const { client } = useStore();
  const b = client.brand!;
  const [expanded, setExpanded] = useState(true);
  return (
    <>
      <Band title="Brand Positioning & Reference Library" tag="Brand Profile" />
      <section className="card">
        <h3 className="card-title" style={{ fontSize: 15 }}>Unique Selling Proposition</h3>
        <p style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.6 }}>{b.usp}</p>
        <hr className="divider" />
        <p style={{ fontWeight: 700, fontSize: 12.5 }}>Primary: {b.primary.join('  |  ')}</p>
        <p className="note" style={{ marginTop: 8 }}>Secondary: {b.secondary.join('  |  ')}</p>
      </section>
      <section className="card">
        <h3 className="card-title" style={{ fontSize: 15 }}>Brand Identity</h3>
        <div className="row wrap" style={{ gap: 18, marginTop: 12, fontSize: 12 }}><strong className="note" style={{ width: 110 }}>Reference Fonts</strong><span>{b.fonts.join(' · ')}</span></div>
        <div className="row wrap" style={{ gap: 18, marginTop: 14, fontSize: 12, alignItems: 'flex-start' }}><strong className="note" style={{ width: 110 }}>Reference Colors</strong>
          <div className="row wrap" style={{ gap: 18 }}>{b.colors.map((c) => <span key={c.hex} className="row" style={{ gap: 8 }}><span style={{ width: 22, height: 22, borderRadius: 5, background: c.hex, border: '1px solid #d8dbe0' }} aria-hidden="true" /><span style={{ fontSize: 11 }}>{c.name} <span className="note tnum">{c.hex}</span></span></span>)}</div>
        </div>
        <p className="note" style={{ fontSize: 10.5, marginTop: 12 }}>Restaurant brand references for your creative, not the portal's theme.</p>
      </section>
      <section className="card">
        <h3 className="card-title" style={{ fontSize: 15 }}>Inspiration & Competitive References</h3>
        <div className="row" style={{ gap: 18, marginTop: 12, fontSize: 12, alignItems: 'flex-start' }}><strong style={{ width: 90, flexShrink: 0 }}>North Stars</strong><span>{b.northStars}</span></div>
        <hr className="divider" />
        <div className="row" style={{ gap: 18, fontSize: 12, alignItems: 'flex-start' }}><strong style={{ width: 90, flexShrink: 0 }}>Competitors</strong><span>{b.competitors.join(' · ')}</span></div>
      </section>
      <section className="card">
        <h3 className="card-title" style={{ fontSize: 15 }}>Business Reference & Hashtags</h3>
        <p style={{ fontSize: 12, marginTop: 8 }}>{b.address}  |  {b.phone}</p>
        <p className="note" style={{ marginTop: 6 }}>{b.website}  |  {b.hours.join('  |  ')}</p>
        <hr className="divider" />
        <p style={{ fontSize: 11.5 }}>{b.hashtags.join('  ')}</p>
      </section>

      <button className="band" style={{ border: 0, width: '100%', textAlign: 'left' }} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        <h2>Messaging Examples & Hashtag Reference</h2><span className="tag">{expanded ? 'Expanded Sections ^' : 'Expand Sections v'}</span>
      </button>
      {expanded && (
        <>
          <section className="card">
            <h3 className="card-title" style={{ fontSize: 15 }}>Messaging & Brand Voice</h3>
            <p style={{ fontWeight: 700, fontSize: 12.5, marginTop: 8 }}>Primary: {b.primary.join('  |  ')}</p>
            <p className="note" style={{ marginTop: 6 }}>Secondary: {b.secondary.join('  |  ')}</p>
            <hr className="divider" />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 18 }}>
              {b.voice.map((v) => <li key={v} className="row" style={{ alignItems: 'flex-start', gap: 10, fontSize: 12.5 }}><span className="kdot" style={{ marginTop: 6, flexShrink: 0 }} />{v}</li>)}
            </ul>
          </section>
          <section className="card">
            <h3 className="card-title" style={{ fontSize: 15 }}>Hashtag Library</h3>
            {([['Brand', b.hashtagLibrary.brand], ['Location', b.hashtagLibrary.location], ['Niche (Under 50K)', b.hashtagLibrary.niche]] as const).map(([k, tags]) => (
              <div key={k} style={{ marginTop: 12 }}><strong style={{ fontSize: 12.5 }}>{k}</strong><p className="note" style={{ marginTop: 4, lineHeight: 1.6 }}>{tags.join(' ')}</p></div>
            ))}
          </section>
        </>
      )}
    </>
  );
}
