import type { ReactNode } from 'react';
import { EMERGENCY_ROUTING } from '../data/catalog';
import { useStore } from '../store';
import { officeStatus, upcomingClosures, weeklyHours, fmtFull } from '../lib/time';
import { Modal, SimTag, RmgAvatar } from './ui';
import { useRequestsNav } from '../lib/nav';

/** Account Manager contact uses the client's dedicated Slack channel. */
export function useContactAM() {
  const { openModal, closeModal, client } = useStore();
  return () => openModal(
    <Modal title="Contact Your Account Manager" sub="Marketing, Requests & Support">
      <div><SimTag>Slack link simulated in demo</SimTag></div>
      <p>Your account manager is reachable in your dedicated Slack channel for conversation, clarifications and urgent communication.</p>
      <div className="minirow row"><RmgAvatar size={36} /><div><div className="label" style={{ fontWeight: 700 }}>#rmg-{client.id}-team</div><p className="note">Dedicated Slack channel for {client.name}</p></div></div>
      <p className="note">New work requests go through Submit a Request so they are tracked with a request record and turnaround estimate.</p>
      <button className="btn primary block" onClick={closeModal}>Open Slack Channel</button>
    </Modal>,
  );
}

/** Photographer contact is for shoot scheduling only. */
export function useContactPhotographer() {
  const { openModal, closeModal } = useStore();
  const nav = useRequestsNav();
  return () => openModal(
    <Modal title="Contact Your Photographer" sub="Photoshoot Scheduling">
      <div><SimTag>Messaging simulated in demo</SimTag></div>
      <p>Your assigned photographer handles content shoot scheduling, shoot-day logistics and plan questions. General agency requests go to your account manager.</p>
      <div className="callout-orange">Reminder: cancel at least 7 days before the shoot to avoid cancellation fees. Shoot Plan changes should be requested at least 1 full day before the shoot.</div>
      <button className="btn primary block" onClick={closeModal}>Message Photographer</button>
      <button className="btn block" onClick={() => nav('submit', { prefill: '35' })}>Submit a Scheduling Request Instead</button>
    </Modal>,
  );
}

export function EmergencyGuidance() {
  const { closeModal } = useStore();
  return (
    <Modal title="Off-Hours Emergency" sub="RMG office hours are 9:00 AM - 5:00 PM ET, Monday-Friday">
      <p>For true emergencies outside office hours, use the approved urgent route below. Routine requests submitted now will be handled when the office reopens.</p>
      <div className="callout-red">
        <strong>What counts as an emergency</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          {EMERGENCY_ROUTING.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>
      <div className="minirow">
        <strong>Urgent route</strong>
        <p className="note" style={{ marginTop: 4 }}>Post in your dedicated Slack channel and tag @rmg-urgent with what happened, what is affected, and links or screenshots. The on-call team monitors this route for the emergencies listed above.</p>
      </div>
      <p className="note">RMG does not provide 24/7 support. Response outside office hours is best effort for listed emergencies only.</p>
      <div><SimTag>Slack route simulated in demo</SimTag></div>
      <button className="btn danger block" onClick={closeModal}>Open Urgent Slack Route</button>
    </Modal>
  );
}

export function BusinessHoursPanel() {
  const { state } = useStore();
  const st = officeStatus(new Date(), state.officeOverride);
  return (
    <div className="stack-sm">
      <p className="note">Eastern Time (America/New_York). {st.open ? 'RMG is open now.' : 'RMG is closed now.'}</p>
      {weeklyHours().map((h) => (
        <div key={h.day} className="row between" style={{ fontSize: 12.5 }}><span>{h.day}</span><strong className="tnum">{h.hours}</strong></div>
      ))}
      <hr className="divider" />
      <strong style={{ fontSize: 12.5 }}>Upcoming Office Closures</strong>
      {upcomingClosures(new Date()).map((c) => (
        <div key={c.date} className="row between" style={{ fontSize: 12.5 }}><span>{c.label}</span><span className="tnum">{fmtFull(c.date)}</span></div>
      ))}
    </div>
  );
}

export function Field({ label, children, htmlFor, hint }: { label: string; children: ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
