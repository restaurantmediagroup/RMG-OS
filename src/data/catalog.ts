// The 74-item request catalog, its 10 categories, and the 5 client-facing groups (25 grouped choices)
// from the Communication & Requests developer specification (pages 11-16).

export type Turnaround = 'Same Business Day' | 'Multi-Business Day' | 'One Week or More' | 'Emergency Route';
export type Scope = 'Included' | 'Requires Review' | 'Requires Quote' | 'Referral' | 'Not Available';

export interface RequestType {
  id: number;
  name: string;
  categoryId: number;
  turnaround: Turnaround;
  scope: Scope;
  emergency?: boolean;
  /** Extra conditional fields shown on the form. */
  fields?: ConditionalField[];
}

export type ConditionalField =
  | 'newHours' | 'effectiveDates' | 'oldNewPrices' | 'postUrl' | 'affectedUrl' | 'shootPlan' | 'audienceSpend'
  | 'platform' | 'location' | 'eventDates' | 'currentValue' | 'meetingAvailability';

export const FIELD_LABELS: Record<ConditionalField, { label: string; placeholder: string }> = {
  newHours: { label: 'New Hours', placeholder: 'e.g. Mon-Thu 11 AM - 9 PM; Fri-Sat 11 AM - 11 PM' },
  effectiveDates: { label: 'Effective Dates', placeholder: 'e.g. Starting November 1' },
  oldNewPrices: { label: 'Old and New Prices or Menu Items', placeholder: 'e.g. Birria Tacos $14 → $15' },
  postUrl: { label: 'Published Post URL', placeholder: 'https://instagram.com/p/...' },
  affectedUrl: { label: 'Affected Page URL', placeholder: 'https://...' },
  shootPlan: { label: 'Shoot Plan / Deliverables', placeholder: 'Which items, dishes or deliverables does this affect?' },
  audienceSpend: { label: 'Audience and Spend', placeholder: 'Who should see it, and any budget in mind?' },
  platform: { label: 'Platform(s)', placeholder: 'e.g. Instagram, Google Business Profile, DoorDash' },
  location: { label: 'Location', placeholder: 'Which location does this apply to?' },
  eventDates: { label: 'Campaign, Holiday or Event Dates', placeholder: 'e.g. Nov 20 - Nov 30' },
  currentValue: { label: 'Current Value on File', placeholder: 'What is currently showing?' },
  meetingAvailability: { label: 'Rough Availability', placeholder: 'e.g. Tue/Thu afternoons' },
};

export const CATEGORIES: { id: number; name: string }[] = [
  { id: 1, name: 'Business Information, Hours & Holidays' },
  { id: 2, name: 'Website Updates & Digital Presence' },
  { id: 3, name: 'Social Media & Profile Management' },
  { id: 4, name: 'Graphics, Campaigns & Promotions' },
  { id: 5, name: 'Content Shoots & Deliverables' },
  { id: 6, name: 'Advertising & Campaign Support' },
  { id: 7, name: 'Listings, Reviews & Reputation' },
  { id: 8, name: 'Email, SMS & Customer Marketing' },
  { id: 9, name: 'Ordering, Reservations & Catering' },
  { id: 10, name: 'Reports, Meetings & Account Support' },
];

const S = 'Same Business Day', M = 'Multi-Business Day', W = 'One Week or More', E = 'Emergency Route';
const I = 'Included', R = 'Requires Review', Q = 'Requires Quote';

type Row = [number, string, number, Turnaround, Scope, ConditionalField[]?, boolean?];
const rows: Row[] = [
  [1, 'Update Regular Restaurant Hours', 1, M, I, ['newHours', 'effectiveDates', 'location']],
  [2, 'Update Holiday Hours or Temporary Closures', 1, M, I, ['newHours', 'effectiveDates', 'location']],
  [3, 'Submit Holiday Specials and Promotions', 1, M, I, ['eventDates']],
  [4, 'Update Address, Phone, Website or Contact Information', 1, M, I, ['currentValue', 'location']],
  [5, 'Update Public Reservation and Ordering Links', 1, M, I, ['affectedUrl', 'platform']],
  [6, 'Update Menus, Pricing or Menu Availability', 1, M, I, ['oldNewPrices']],
  [7, 'Update New Location or Closure Details', 1, W, R, ['location', 'effectiveDates']],
  [8, 'Submit Holiday/Event Information and Attachments', 1, M, I, ['eventDates']],
  [9, 'Update Website Text or Photos', 2, M, I, ['affectedUrl']],
  [10, 'Replace Website Menu or Update Prices', 2, M, I, ['oldNewPrices', 'affectedUrl']],
  [11, 'Add or Replace a Ready-Made Website Pop-Up', 2, S, I, ['effectiveDates']],
  [12, 'Update Website Links, Buttons or Calls to Action', 2, M, I, ['affectedUrl']],
  [13, 'Correct Broken Links or Website Display Issues', 2, S, I, ['affectedUrl']],
  [14, 'Request Existing-Page Content Changes', 2, M, I, ['affectedUrl']],
  [15, 'Request a New Website Page or Section', 2, W, R],
  [16, 'Report Website Outage or Critical Booking/Ordering Page Failure', 2, E, I, ['affectedUrl'], true],
  [17, 'Request Website/SEO/Traffic Investigation', 2, W, R, ['affectedUrl']],
  [18, 'Share a Ready-to-Publish Photo, Video or Graphic', 3, S, I, ['platform']],
  [19, 'Correct an Inaccurate Published Post', 3, S, I, ['postUrl']],
  [20, 'Update Social Profile Bio, Logo or Profile Photo', 3, M, I, ['platform']],
  [21, 'Update Social/Link-in-Bio URLs', 3, M, I, ['platform', 'affectedUrl']],
  [22, 'Pin or Unpin an Existing Post', 3, S, I, ['postUrl']],
  [23, 'Archive Expired Campaign or Published Content', 3, S, I, ['postUrl']],
  [24, 'Report a Missing or Failed Published Post', 3, S, I, ['platform']],
  [25, 'Share General Content Feedback', 3, M, I],
  [26, 'Notify RMG of Same-Day Closure or Entertainment Change', 3, E, I, ['effectiveDates'], true],
  [27, 'Request a Standalone Promotional Graphic', 4, M, I, ['eventDates']],
  [28, 'Update an Existing Graphic or Promotion', 4, M, I],
  [29, 'Request a Multi-Asset Marketing Campaign', 4, W, R, ['eventDates', 'audienceSpend']],
  [30, 'Request Holiday or Seasonal Promotions', 4, W, I, ['eventDates']],
  [31, 'Request a Catering or Private Events Promotion', 4, W, I, ['eventDates']],
  [32, 'Request a New Location / Rebrand Campaign', 4, W, R, ['location']],
  [33, 'Submit Event, Entertainment or Special Details', 4, M, I, ['eventDates']],
  [34, 'Request a Strategy or Campaign Discussion', 4, M, I, ['meetingAvailability']],
  [35, 'Confirm or Request Content Shoot Scheduling', 5, M, I, ['meetingAvailability']],
  [36, 'Review or Request Changes to a Shoot Plan', 5, M, I, ['shootPlan']],
  [37, 'Provide Must-Have Dishes, Staff or Items', 5, M, I, ['shootPlan']],
  [38, 'Request Comparable Item or Deliverable Substitutions', 5, M, I, ['shootPlan']],
  [39, 'Reschedule or Cancel a Content Shoot', 5, M, I, ['shootPlan']],
  [40, 'Request Photo Rush Delivery (+$50)', 5, M, R],
  [41, 'Request Video Rush Delivery (+$100)', 5, M, R],
  [42, 'Request Additional Photos or Videos (Quote)', 5, W, Q, ['shootPlan']],
  [43, 'Request a Weekend or Event Shoot (Quote)', 5, W, Q, ['eventDates']],
  [44, 'Request Delivered Content Folder Access', 5, S, I],
  [45, 'Report Meta/Social Ads Delivery or Billing Issue', 6, S, I, ['platform']],
  [46, 'Report Google Ads Delivery or Billing Issue', 6, S, I],
  [47, 'Request Campaign Offer/Copy/Targeting Update', 6, M, I, ['audienceSpend']],
  [48, 'Request Ad Budget or Spending Review', 6, M, I, ['audienceSpend']],
  [49, 'Request Advertising Performance Review', 6, M, I],
  [50, 'Request New Advertising Services (Quote)', 6, W, Q, ['audienceSpend']],
  [51, 'Update Google Business Profile Information', 7, M, I, ['currentValue', 'location']],
  [52, 'Update Apple Maps or Other Business Listings', 7, M, I, ['platform', 'currentValue']],
  [53, 'Report or Request a Response to a Review', 7, M, I, ['affectedUrl', 'platform']],
  [54, 'Request Review-Generation Support', 7, W, R],
  [55, 'Request Negative Review Appeal (No Removal Guarantee)', 7, W, Q, ['affectedUrl']],
  [56, 'Request an Email Marketing Campaign', 8, W, R, ['eventDates', 'audienceSpend']],
  [57, 'Request an SMS Promotion', 8, M, R, ['eventDates']],
  [58, 'Update Email/SMS Campaign Details or Creative', 8, M, I],
  [59, 'Request Customer List or Lead-Capture Support', 8, W, R],
  [60, 'Request Email/SMS Automation Changes (Scope Review)', 8, W, R],
  [61, 'Update Online Ordering/Reservation Website Links', 9, M, I, ['affectedUrl', 'platform']],
  [62, 'Report Broken Ordering or Reservation Flow', 9, S, I, ['affectedUrl', 'platform']],
  [63, 'Request Catering Inquiry or Menu Updates', 9, M, I, ['oldNewPrices']],
  [64, 'Request Third-Party Ordering Platform Changes (Scope Review)', 9, W, R, ['platform']],
  [65, 'Request New Platform Setup/Optimization (Quote)', 9, W, Q, ['platform']],
  [66, 'Ask a Reporting or Performance Question', 10, M, I],
  [67, 'Request Historical or Comparison Reporting', 10, M, I],
  [68, 'Report Missing Analytics or Disconnected Integration', 10, M, I, ['platform']],
  [69, 'Request a Meeting', 10, M, I, ['meetingAvailability']],
  [70, 'Share General Feedback or Suggestions', 10, M, I],
  [71, 'Update Authorized Contacts or Team Details', 10, M, R],
  [72, 'Request Social / Platform Account Access', 10, M, R, ['platform']],
  [73, 'Request Login or Two-Factor Authentication Help', 10, M, R],
  [74, 'Ask About Service Scope, Plan Changes or Cancellation', 10, M, R],
];

export const REQUEST_TYPES: RequestType[] = rows.map(([id, name, categoryId, turnaround, scope, fields, emergency]) => ({ id, name, categoryId, turnaround, scope, fields, emergency }));

export function typesInCategory(catId: number) { return REQUEST_TYPES.filter((t) => t.categoryId === catId); }
export function requestType(id: number) { return REQUEST_TYPES.find((t) => t.id === id); }
export function categoryName(id: number) { return CATEGORIES.find((c) => c.id === id)?.name ?? ''; }

export const TURNAROUND_TEXT: Record<Turnaround, string> = {
  'Same Business Day': 'Same Business Day (when received with complete information during office hours)',
  'Multi-Business Day': 'Multi-Business Day (subject to scope and complete information)',
  'One Week or More': 'One Week or More (larger campaigns, rebrands and website expansion)',
  'Emergency Route': 'Use the dedicated Slack emergency procedure for true emergencies; this form is for the written record.',
};

/** Developer addendum: five expandable categories, each with five grouped options mapped to specific request ids. */
export interface RequestGroup { title: string; short: string[]; options: { label: string; ids: number[] }[] }
export const REQUEST_GROUPS: RequestGroup[] = [
  {
    title: 'Business, Hours & Website',
    short: ['Restaurant Hours, Holidays & Closures', 'Menus, Pricing & Catering Updates', 'Website Text, Images & Basic Changes', 'Reservation, Ordering & Website Links', 'Broken Pages, Outages & Technical Issues'],
    options: [
      { label: 'Restaurant hours, holiday schedules, temporary closures and business details', ids: [1, 2, 4, 7, 26] },
      { label: 'Menus, pricing, catering information and menu availability', ids: [6, 10, 63] },
      { label: 'Website text, imagery, pop-ups and basic existing-page updates', ids: [9, 11, 14, 15] },
      { label: 'Reservations, ordering, social and website links', ids: [5, 12, 21, 61] },
      { label: 'Broken links, outages, technical access and critical pages', ids: [13, 16, 62, 17] },
    ],
  },
  {
    title: 'Social Media & Content',
    short: ['Profiles, Bios & Links', 'Publish or Correct Content', 'Manage Published Content', 'Shoot Scheduling & Plans', 'Delivery, Rush & Feedback'],
    options: [
      { label: 'Profile photos, biographies, logos, contact details and links', ids: [20, 21] },
      { label: 'Publish provided creative or correct inaccurate published content', ids: [18, 19, 24] },
      { label: 'Pin, archive, remove or manage already-published content', ids: [22, 23] },
      { label: 'Content shoot scheduling, shoot plans and substitutions', ids: [35, 36, 37, 38, 39, 43] },
      { label: 'Content delivery, rush options and general creative feedback', ids: [40, 41, 42, 44, 25] },
    ],
  },
  {
    title: 'Campaigns, Promotions & Advertising',
    short: ['Graphics & Flyer Updates', 'Holiday, Seasonal & Event Promotions', 'Catering, Rebrands & New Locations', 'Meta and Google Ads', 'Email & SMS Campaigns'],
    options: [
      { label: 'Standalone graphics, premade promotions and flyer updates', ids: [27, 28] },
      { label: 'Holiday and seasonal specials, events and entertainment promotions', ids: [3, 30, 33, 29] },
      { label: 'Catering, private events, rebrands and new-location campaigns', ids: [31, 32] },
      { label: 'Meta and Google Ads campaigns, budgets, billing and performance', ids: [45, 46, 47, 48, 49, 50] },
      { label: 'Email and SMS campaigns, lead capture and automation changes', ids: [56, 57, 58, 59, 60] },
    ],
  },
  {
    title: 'Reviews, Listings & Ordering',
    short: ['Business Listings', 'Reviews & Appeals', 'Ordering Platforms', 'Reservations & Catering Platforms', 'Local Search & Troubleshooting'],
    options: [
      { label: 'Google Business Profile, Apple Maps and other listing updates', ids: [51, 52] },
      { label: 'Review responses, review generation and appeal requests', ids: [53, 54, 55] },
      { label: 'Ordering platform pages, menus, account details and configuration', ids: [64, 65] },
      { label: 'Reservation and catering platform links or operational issues', ids: [61, 62, 63] },
      { label: 'Local search visibility and connected-platform troubleshooting', ids: [17, 68] },
    ],
  },
  {
    title: 'Reporting, Account & Additional Services',
    short: ['Reporting & Attribution Questions', 'Meetings, Strategy & Feedback', 'Holiday Planning Submissions', 'Contacts, Access & 2FA', 'Service Changes, Quotes & Referrals'],
    options: [
      { label: 'Performance reporting, historical comparisons and attribution questions', ids: [66, 67, 68] },
      { label: 'Meetings, strategy requests, general feedback and support', ids: [69, 70, 34] },
      { label: 'Holiday planning submissions, details and supporting files', ids: [8, 3, 2] },
      { label: 'Authorized contacts, login access, 2FA and account updates', ids: [71, 72, 73] },
      { label: 'Service changes, custom work quotes and preferred vendor referrals', ids: [74] },
    ],
  },
];

/** Additional Services (approved tab content + spec lists). */
export const QUOTE_ITEMS = [
  { letter: 'A', name: 'Google Ads Management' },
  { letter: 'V', name: 'Additional Video Production' },
  { letter: 'P', name: 'Full Menu Photoshoots' },
  { letter: 'D', name: 'Drone & Event Coverage' },
  { letter: 'O', name: 'Ordering Platform Optimization' },
];
export const REFERRAL_ITEMS = [
  { letter: 'B', name: 'Restaurant Consulting' },
  { letter: 'G', name: 'Print & Specialty Design' },
  { letter: 'P', name: 'PR & Traditional Advertising' },
  { letter: 'T', name: 'POS, Equipment & Technical Support' },
  { letter: 'R', name: 'Restaurant Vendors & Suppliers' },
];
export const QUOTE_FULL = ['Google Ads Management', 'Reporting Software or Custom Reporting', 'A La Carte Video Editing', 'Drone Video / Aerial Footage', 'Voiceover Videos', 'Full Menu / Custom Photoshoot', 'Event Coverage Outside Regular Shoots', 'Heavy Image Manipulation / Photoshopping', 'Third-Party Ordering Platform Facelift', 'Negative Review Appeal', 'Additional Shoot Deliverables and Upgrades', 'Weekend or Event Content Shoot'];
export const REFERRAL_FULL = ['Menu Pricing / Business Consulting', 'Market or Competitor Research', 'Printed QR Codes or Table Tents', 'Logo Design / Redesign / Animation', 'Print Flyers, Posters, Menus, Banners, Business Cards', 'Billboard Design and Placement', 'Press Outreach / Public Relations', 'Technical / A-V or Hardware Support', 'Produce, Meat, Seafood, Coffee/Tea Suppliers', 'Restaurant Equipment Repair and Maintenance', 'Oil Systems, Hood / Duct Cleaning', 'Beverage Dispensers, Ice Machines, Warewashers', 'POS / Payment Processing', 'Linen Rental', 'Restaurant Real Estate Brokerage', 'Retirement, Investment or Insurance Providers', 'Commercial Pest Control'];

export const EMERGENCY_ROUTING = [
  'Unexpected Same-Day Restaurant Closure',
  'Same-Day Entertainment Cancellation or Change',
  'Incorrect Public Information Already Live',
  'Website Outage or Critical Reservation Page Failure',
  'Critical Friday Deadline Explicitly Promised but Missed',
  'Weekend Shoot Day-Of Cancellation (Photographer Notification)',
];
