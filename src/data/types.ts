export type PageId = 'home' | 'performance' | 'content' | 'requests' | 'reports' | 'brand' | 'account' | 'admin';

export type ShootStatus = 'scheduled' | 'pending' | 'overdue' | 'none';
export type AdState = 'live' | 'paused' | 'payment_issue' | 'restricted' | 'stopped' | 'unavailable';
export type DeliveryState = 'Not Started' | 'Processing' | 'Editing' | 'Delivered';
export type ConnState = 'connected' | 'not_connected' | 'issue' | 'delayed';

export type RequestStatus = 'Submitted' | 'Awaiting Review' | 'In Progress' | 'Waiting on Client' | 'Completed' | 'Cancelled';
export const OPEN_STATUSES: RequestStatus[] = ['Submitted', 'Awaiting Review', 'In Progress', 'Waiting on Client'];

export interface Attachment { name: string; size: number; type: string }

export interface StatusChange { status: RequestStatus; at: string; by: string; note?: string }

export interface RequestRecord {
  id: string; // RMG-xxxx
  mondayId: string; // linked Monday.com item (simulated)
  clientId: string;
  title: string;
  subtitle: string; // category or context line
  kind: 'standard' | 'meeting' | 'feedback' | 'holiday' | 'quote' | 'referral' | 'info-change' | 'rush' | 'contact-change' | 'access';
  typeId?: number;
  categoryId?: number;
  details: Record<string, string>;
  neededBy?: string;
  attachments: Attachment[];
  status: RequestStatus;
  submittedAt: string;
  history: StatusChange[];
  completionNote?: string;
  turnaround?: string;
  scope?: string;
  lastSynced: string;
}

export interface Meeting { id: string; title: string; date: string; time: string; with: string }
export interface ActionItem { id: string; title: string; desc: string; due: string; holidayId: string }

export interface ShootRecord {
  date?: string; // ISO
  time?: string;
  type: string;
  location: string;
  confirmed: boolean;
  /** Account-level exception to the global scheduling cutoff (ISO). Pending turns Overdue after the cutoff when unconfirmed. */
  cutoffOverride?: string;
  planShared: boolean;
  photographerAssigned: boolean;
  noShoot?: boolean;
}

export interface DeliveryRecord {
  shootCompletedOn: string; // ISO
  photos: DeliveryState;
  videos: DeliveryState;
}

export interface RushRequest {
  id: string; clientId: string; type: 'photo' | 'video'; fee: number; requestedAt: string;
  targetDue: string; approval: 'Pending Review' | 'Approved' | 'Declined'; operator?: string; note?: string;
}

export interface Creative { rank: number; title: string; platform: string; engagements: number; tone: 'pizza' | 'cocktail' | 'pasta' | 'taco' | 'steak' }
export interface LibraryMonth {
  month: number; year: number; shoots: number; status: 'In Progress' | 'Delivered';
  photos?: number; videos?: number; photosReady: boolean; videosReady: boolean;
  top?: Creative[] | 'awaiting' | 'unavailable';
}

export interface Metric { value: number | null; prefix?: string; suffix?: string }
export interface PlatformCard { key: string; name: string; letter: string; value: number | null; unit: 'count' | 'usd'; label: string; conn: ConnState; synced?: string }

export interface SocialNet {
  key: string; name: string; short: string; conn: ConnState;
  impressions: number; profileViews: number; linkClicks: number; websiteClicks: number; engagements: number; engagementRate: number; followers: number;
  top: number[];
}

export interface PerfData {
  revenue: PlatformCard[];
  marketing: { impressions: number; profileViews: number; linkClicks: number; websiteVisits: number; engagements: number; followers: number; trend: number[]; byNetwork: { name: string; value: number }[]; top: { engagements: number; platform: string }[] } | null;
  ga4: { conn: ConnState; visits: number; pageViews: number; conversions: number; bySource: { name: string; value: number }[]; convBySource: { name: string; value: number }[] } | null;
  psi: { url: string; mobile: number[]; desktop: number[]; testedAt: string } | null;
  agentic: { passed: number; applicable: number } | null;
  social: SocialNet[];
  adClicks: { meta: number | null; google: number | null };
  gscConnected: boolean;
}

export interface ReportPeriod {
  key: 'M' | 'Q' | 'H' | 'Y'; title: string; sub: string; reportName: string; range: string; months: string;
  impressions: number; growth: number; visits: number; engagements: number; orderSales: number;
  summary: string; results: string[]; focus: string[];
}

export interface BrandSnapshot {
  campaigns: { name: string; detail: string; priority?: boolean }[];
  recurring: { name: string; detail: string; cadence: string };
  focus: string[];
  future: string;
  segments: { title: string; detail: string }[];
  budget: string; placements: string; geography: string; targeting: string;
  motivations: { name: string; detail: string }[];
  usp: string; primary: string[]; secondary: string[];
  fonts: string[]; colors: { name: string; hex: string }[];
  northStars: string; competitors: string[];
  address: string; phone: string; website: string; hours: string[];
  hashtags: string[];
  voice: string[];
  hashtagLibrary: { brand: string[]; location: string[]; niche: string[] };
  publishedOn?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  initial: string;
  packageName: string;
  accountStatus: 'Active' | 'Onboarding';
  location: string; phone: string; website: string;
  regularHours: string[];
  team: { am: string; photographer: string };
  contacts: { name: string; role: string }[];
  portalUsers: { name: string; role: string; access: string }[];
  services: { name: string; desc: string; detail: string[] }[];
  kpi: { visits: Metric & { change?: number }; reservations: Metric & { change?: number } };
  shoot: ShootRecord;
  delivery: DeliveryRecord;
  ads: { meta: AdState; google: AdState; checkedAt: string };
  meetings: Meeting[];
  actionItems: ActionItem[];
  latestPost: { title: string; platform: string; publishedOn: string } | null;
  library: LibraryMonth[];
  perf: PerfData;
  reports: ReportPeriod[];
  lifetime: { impressions: string; visits: number; engagements: number; since: string } | null;
  wins: { title: string; value: string; detail: string; source: string; period: string; baseline: string; evidence: string; cls: 'Measured' | 'Attributed' | 'Platform-Reported' }[];
  insights: { working: string; opportunities: string };
  reportHistory: { label: string; name: string; kind: 'Monthly' | 'Quarterly' | 'Six-Month' | 'Annual' }[];
  brand: BrandSnapshot | null;
  notif: { email: boolean; sms: boolean; portal: boolean };
}

export interface HolidayRecord {
  id: string; clientId: string; holiday: string; due: string;
  status: 'Not Requested' | 'Requested' | 'Incomplete' | 'Submitted' | 'Needs Clarification' | 'Approved' | 'Fulfilled';
  hours?: string; specials?: string; attachments: Attachment[]; submittedAt?: string; revisions: number;
}

export interface NpsResponse { id: string; clientId: string; month: string; score: number; comment: string; at: string }
export interface AuditEntry { id: string; at: string; actor: string; clientId?: string; action: string }

export interface OnboardingClient {
  id: string; name: string; csr: string;
  checklist: { label: string; done: boolean }[];
  activated: boolean;
}

export interface AppState {
  version: number;
  role: 'client' | 'admin';
  clientId: string;
  page: PageId;
  tabs: Record<string, string>;
  officeOverride: 'auto' | 'open' | 'closed';
  clients: Record<string, ClientRecord>;
  requests: RequestRecord[];
  holidays: HolidayRecord[];
  rush: RushRequest[];
  nps: NpsResponse[];
  audit: AuditEntry[];
  onboarding: OnboardingClient[];
  config: { defaultCutoffDay: number };
  seq: number;
}
