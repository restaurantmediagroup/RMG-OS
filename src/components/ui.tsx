import { useRef, type ReactNode } from 'react';
import type { Attachment } from '../data/types';
import { useStore } from '../store';
import rmgLogo from '../assets/rmg-logo.png';

export function PageHeader({ title, sub }: { title: string; sub: string }) {
  const { client, state } = useStore();
  return (
    <header className="page-header">
      <div className="top">
        <BrandMark />
        <span className="client-pill">{state.role === 'admin' ? 'RMG Internal' : 'Client View'}</span>
      </div>
      {state.role === 'client' && <div className="eyebrow">{client.name}</div>}
      <h1>{title}</h1>
      <p className="sub">{sub}</p>
    </header>
  );
}

export function BrandMark() {
  return (
    <div className="brandmark">
      <RmgAvatar size={30} />
      <div><div className="t1">RMG OS</div><div className="t2">Marketing Portal</div></div>
    </div>
  );
}

/** RMG's profile photo: the circular logo, used wherever RMG or an RMG team member appears. */
export function RmgAvatar({ size = 40, label }: { size?: number; label?: string }) {
  return <img className="rmg-avatar" src={rmgLogo} width={size} height={size} alt={label ?? ''} aria-hidden={label ? undefined : true} />;
}

export function Tabs<T extends string>({ items, value, onChange, four, label }: { items: T[]; value: T; onChange: (v: T) => void; four?: boolean; label: string }) {
  return (
    <div className={`tabs${four ? ' four' : ''}`} role="tablist" aria-label={label} style={{ gridTemplateColumns: items.map((it) => `minmax(0, ${Math.max(10, it.length)}fr)`).join(' ') }}>
      {items.map((it) => (
        <button key={it} role="tab" aria-selected={value === it} className={`tab${value === it ? ' active' : ''}`} onClick={() => onChange(it)}>{it}</button>
      ))}
    </div>
  );
}

export function Badge({ tone, children, dot }: { tone: 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'navy'; children: ReactNode; dot?: boolean }) {
  return <span className={`badge ${tone}`}>{dot && <span className="dot" />}{children}</span>;
}

export function Band({ title, tag, plain }: { title: string; tag?: string; plain?: boolean }) {
  return <div className="band"><h2>{title}</h2>{tag && <span className={`tag${plain ? ' plain' : ''}`}>{tag}</span>}</div>;
}

export function SimTag({ children = 'Simulated in demo' }: { children?: ReactNode }) {
  return <span className="sim-tag">{children}</span>;
}

export function Modal({ title, sub, children, wide }: { title: string; sub?: string; children: ReactNode; wide?: boolean }) {
  const { closeModal } = useStore();
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div><h3>{title}</h3>{sub && <p className="card-sub">{sub}</p>}</div>
          <button className="xbtn" onClick={closeModal} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/** Generic informational modal used for simulated external destinations (Slack, Google Drive, provider pages). */
export function useInfo() {
  const { openModal, closeModal } = useStore();
  return (title: string, body: ReactNode, opts?: { sim?: string | false; sub?: string; wide?: boolean }) =>
    openModal(
      <Modal title={title} sub={opts?.sub} wide={opts?.wide}>
        {opts?.sim !== false && <div><SimTag>{opts?.sim ?? 'Simulated in demo'}</SimTag></div>}
        {body}
        <button className="btn block" onClick={closeModal}>Close</button>
      </Modal>,
    );
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return <button className="switch" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)} />;
}

const MAX_FILE = 25 * 1024 * 1024;
const ALLOWED = /\.(pdf|png|jpe?g|gif|heic|webp|docx?|xlsx?|csv|txt|mp4|mov)$/i;

export function FileInput({ files, onChange, placeholder, id }: { files: Attachment[]; onChange: (f: Attachment[]) => void; placeholder: string; id: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const { toast } = useStore();
  return (
    <div className="stack-sm">
      <div className="filezone">
        <span>{placeholder}</span>
        <button type="button" className="btn sm" onClick={() => ref.current?.click()}>Add Files</button>
        <input id={id} ref={ref} type="file" multiple hidden onChange={(e) => {
          const list = Array.from(e.target.files ?? []);
          const ok: Attachment[] = [];
          for (const f of list) {
            if (f.size > MAX_FILE) { toast(`${f.name} is over 25 MB. Share large files through Slack or Google Drive.`); continue; }
            if (!ALLOWED.test(f.name)) { toast(`${f.name} isn't a supported file type.`); continue; }
            ok.push({ name: f.name, size: f.size, type: f.type || 'file' });
          }
          onChange([...files, ...ok]);
          e.target.value = '';
        }} />
      </div>
      {files.length > 0 && (
        <div className="row wrap" style={{ gap: 6 }}>
          {files.map((f, i) => (
            <span className="filechip" key={i}>{f.name} <span className="hint">{fmtSize(f.size)}</span>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => onChange(files.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
      )}
      <span className="hint">PDF, images, Office files or video, up to 25 MB each. Demo keeps file names only; nothing is uploaded.</span>
    </div>
  );
}

export function fmtSize(n: number) { return n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`; }

export function ListRow({ icon, title, sub, onClick, right }: { icon?: ReactNode; title: ReactNode; sub?: ReactNode; onClick?: () => void; right?: ReactNode }) {
  const inner = (
    <>
      {icon}
      <div style={{ minWidth: 0 }}><div className="t">{title}</div>{sub && <div className="s">{sub}</div>}</div>
      {right ?? (onClick ? <span className="chev" aria-hidden="true">&gt;</span> : null)}
    </>
  );
  return onClick ? <button className="list-row" onClick={onClick}>{inner}</button> : <div className="list-row">{inner}</div>;
}

export function Ico({ children, lg, round }: { children: ReactNode; lg?: boolean; round?: boolean }) {
  return <span className={`ico${lg ? ' lg' : ''}${round ? ' round' : ''}`} aria-hidden="true">{children}</span>;
}

export function PageFoot({ left, right }: { left: string; right?: string }) {
  return <div className="page-foot"><span>{left}</span>{right && <span>{right}</span>}</div>;
}

const TONES: Record<string, { bg: string; food: string }> = {
  pizza: { bg: '#5b5446', food: '#e7b96a' },
  steak: { bg: '#f1dfc4', food: '#8a4630' },
  pasta: { bg: '#e2e6c9', food: '#d0814f' },
  taco: { bg: '#c9d6d3', food: '#c48a3f' },
  cocktail: { bg: '#3c4a3e', food: '#f2e9d6' },
};

/** Illustrated placeholder for published post thumbnails (production shows the real published image). */
export function PostThumb({ tone = 'steak', label = 'Post Preview' }: { tone?: string; label?: string | null }) {
  const t = TONES[tone] ?? TONES.steak;
  return (
    <div className="post-thumb" style={{ background: t.bg }}>
      <svg viewBox="0 0 160 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {tone === 'cocktail' ? (
          <g>
            <path d="M60 30 L100 30 L94 80 L66 80 Z" fill={t.food} />
            <ellipse cx="80" cy="30" rx="20" ry="4" fill="#e87c5a" />
            <rect x="86" y="14" width="2" height="18" fill="#8fbf7a" transform="rotate(20 87 23)" />
          </g>
        ) : (
          <g>
            <ellipse cx="80" cy="52" rx="56" ry="36" fill="#f7f4ee" />
            <ellipse cx="80" cy="52" rx="44" ry="28" fill="none" stroke="#d9d3c7" strokeWidth="1" />
            <ellipse cx="80" cy="52" rx="32" ry="13" fill={t.food} />
            <circle cx="92" cy="47" r="3.2" fill="#4c7a3e" />
            <circle cx="70" cy="57" r="2.2" fill="#4c7a3e" />
          </g>
        )}
      </svg>
      {label && <span className="lbl">{label.toUpperCase()}</span>}
    </div>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="note" style={{ padding: '0 4px' }}>{children}</p>;
}
