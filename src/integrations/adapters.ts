// Integration adapter layer. Each adapter has the same shape so production connectors can replace the demo
// implementations one at a time. Nothing here calls a live API: every adapter reports `demo` until real,
// verified credentials and tested calls exist. Credentials never reach the client bundle.

export type AdapterStatus = 'demo' | 'connected' | 'not_connected' | 'error';

export interface IntegrationAdapter<T = unknown> {
  key: string;
  name: string;
  purpose: string;
  status(): AdapterStatus;
  /** Production: server-side fetch scoped to the client/location. Demo: resolves seeded data. */
  fetch(clientId: string): Promise<T | null>;
}

function demo(key: string, name: string, purpose: string): IntegrationAdapter {
  return { key, name, purpose, status: () => 'demo', fetch: async () => null };
}

export const ADAPTERS: IntegrationAdapter[] = [
  demo('meta-ads', 'Meta Ads', 'Ad account, campaign serving, delivery and billing state; link clicks'),
  demo('google-ads', 'Google Ads', 'Campaign serving, delivery and billing state; link clicks'),
  demo('ga4', 'Google Analytics 4', 'Sessions, page views, key events and channel groups'),
  demo('gsc', 'Google Search Console', 'Search queries, impressions and ranking-related metrics'),
  demo('psi', 'PageSpeed Insights', 'Performance, Accessibility, Best Practices, SEO; Agentic Browsing when returned'),
  demo('drive', 'Google Drive', 'Client-scoped delivered photo and video folders'),
  demo('monday', 'Monday.com', 'Fulfillment tasks linked to RMG OS request records'),
  demo('slack', 'Slack', 'Dedicated client channels and urgent route'),
  demo('opentable', 'OpenTable', 'Reservation counts'),
  demo('ordering', 'Online Ordering Platforms', 'Uber Eats, DoorDash, Grubhub and ezCater platform-reported sales'),
  demo('social', 'Social Analytics', 'Instagram, Facebook, TikTok, YouTube and X published-post analytics'),
];
