import type { AdState, AppState, ClientRecord, ConnState, ShootStatus } from '../data/types';
import { addBusinessDays, nyParts, todayIso } from './time';

export function cutoffFor(client: ClientRecord, state: AppState): string {
  if (client.shoot.cutoffOverride) return client.shoot.cutoffOverride;
  const p = nyParts(new Date());
  const day = String(state.config.defaultCutoffDay).padStart(2, '0');
  return `${p.y}-${String(p.m).padStart(2, '0')}-${day}`;
}

/** Shoot state comes from the scheduling record: confirmation status plus the configurable cutoff. */
export function shootStatus(client: ClientRecord, state: AppState): ShootStatus {
  const s = client.shoot;
  if (s.noShoot) return 'none';
  if (s.confirmed && s.date) return 'scheduled';
  return todayIso() > cutoffFor(client, state) ? 'overdue' : 'pending';
}

export const SHOOT_BADGE: Record<ShootStatus, { label: string; tone: 'green' | 'orange' | 'red' | 'gray' }> = {
  scheduled: { label: 'Scheduled', tone: 'green' },
  pending: { label: 'Pending', tone: 'orange' },
  overdue: { label: 'Overdue', tone: 'red' },
  none: { label: 'Not Scheduled', tone: 'gray' },
};

export function deliveryDue(client: ClientRecord) {
  const base = client.delivery.shootCompletedOn;
  return {
    photoStd: addBusinessDays(base, 2), photoRush: addBusinessDays(base, 1),
    videoStd: addBusinessDays(base, 5), videoRush: addBusinessDays(base, 3),
  };
}

export function deliveryPending(client: ClientRecord) {
  return client.delivery.photos !== 'Delivered' || client.delivery.videos !== 'Delivered';
}

export const AD_STATE: Record<AdState, { label: string; tone: 'green' | 'red' | 'orange' | 'gray'; sub: string }> = {
  live: { label: 'Live', tone: 'green', sub: 'Connected status' },
  paused: { label: 'Paused', tone: 'orange', sub: 'Campaigns paused' },
  payment_issue: { label: 'Payment Issue', tone: 'red', sub: 'Ads stopped until billing is resolved' },
  restricted: { label: 'Restricted', tone: 'red', sub: 'Account restricted by the platform' },
  stopped: { label: 'Stopped', tone: 'red', sub: 'Ads are not delivering' },
  unavailable: { label: 'Status Unavailable', tone: 'gray', sub: 'Not connected' },
};

export const CONN: Record<ConnState, { label: string; tone: 'green' | 'gray' | 'red' | 'orange' }> = {
  connected: { label: 'Connected', tone: 'green' },
  not_connected: { label: 'Not Connected', tone: 'gray' },
  issue: { label: 'Connection Issue', tone: 'red' },
  delayed: { label: 'Sync Delayed', tone: 'orange' },
};

export const fmtNum = (n: number) => n.toLocaleString('en-US');
export const fmtUsd = (n: number) => `$${n.toLocaleString('en-US')}`;
