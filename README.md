# RMG OS Client Marketing Portal (Demo Build)

Mobile-first React + TypeScript app that reproduces the seven approved RMG OS PDF designs. All data is illustrative.

Live demo: https://claude.ai/artifact/G5X8k2soucM8zhgUE9BfAf

## Run locally
    npm install
    npm run dev      # http://localhost:5173
    npm run build    # single-file build in dist/index.html

## Structure
- `src/pages/` one file per portal page (Home, Performance, Content, Requests, Reports, Brand, Account) plus `Admin.tsx` (internal RMG demo)
- `src/components/` shared primitives (header, tabs, badges, modals, file input) and demo controls
- `src/data/catalog.ts` the 74 request types, 10 categories, 25 grouped choices, quote/referral lists, emergency routing
- `src/data/seed.ts` sample client records (Playa Taqueria, Columbia Inn, Sol Cantina onboarding)
- `src/lib/time.ts` America/New_York office hours, holiday closures, business-day math
- `src/lib/derive.ts` shoot state from records + configurable cutoff, delivery due dates, ad and connection states
- `src/integrations/adapters.ts` adapter layer for Meta/Google Ads, GA4, GSC, PSI, Drive, Monday.com, Slack, OpenTable, ordering, social (all demo, none connected)
- `src/store.tsx` single app state, saved to the browser's localStorage

## Working
- All 7 pages with approved tabs; Performance tabs keep full single-line labels (2x2 grid on phones)
- Home: live open/closed from ET clock with holiday skipping; emergency caption + Click Here only when closed; full hours expander; Scheduled/Pending/Overdue shoot states; meeting empty state vs booked; Action Needed vs all clear; ad states incl. payment issue
- Content: shoot actions, conditional delivery (independent photo/video, hides when both delivered), business-day due dates, rush requests routed for review (no charge), 4-step prep checklist, Jan–Oct library, latest month expanded, Top Creative toggles, disabled undelivered folders
- Requests: Current Requests (open statuses only), history with search/filters, request detail + respond when Waiting on Client, 5-group accordion mapped to all 74 types, searchable 10-category directory with turnaround and scope labels, structured form with conditional fields, attachments, review step and receipt, holiday, meeting, feedback, quote/referral forms
- Reports: 4 period cards switching all metrics, View Report, history + archive filter, verified win drill-down, NPS 0–10 with preview, one per month
- Brand Snapshot: full Columbia Inn content across 3 tabs, expandable messaging/hashtags, feedback link, not-published state for other clients
- Account: overview with 3 groups (3/4/2 destinations), business info change requests (reviewable, never live edits), contacts, services with expandable detail, policy pages, documents, notification toggles with save state, password recovery, account access
- Admin: request inbox status changes (completed moves to client history), holiday tracker with reminder suppression, shoot confirm/cutoff/plan sharing, delivery statuses, rush approve/decline, ad status, NPS with low-score alert, onboarding checklist gating CSR Activate Client, audit trail
- Multi-client separation via the client switcher

## Simulated
- Slack, photographer messaging, Google Drive folders, published-post links, provider billing pages, secure document viewer, password reset email, Monday.com task IDs, Search Console connect, Agentic audit run
- Download PDF and Print Shoot Plan (the artifact frame blocks downloads and printing)
- Attachments keep file names only; nothing is uploaded
- Submissions write to browser storage after a short simulated API delay

## Not yet implemented
- Real authentication, roles and server-side permission checks
- Live integrations (adapters return demo data only)
- Email/SMS delivery
