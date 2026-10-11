// Office hours, holidays and business-day math, all evaluated in America/New_York.

export const RMG_TZ = 'America/New_York';
export const OFFICE_OPEN_HOUR = 9;
export const OFFICE_CLOSE_HOUR = 17;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

/** RMG office closures (admin-editable in production). ISO dates, NY local. */
export const OFFICE_CLOSURES: { date: string; label: string }[] = [
  { date: '2026-01-01', label: "New Year's Day" },
  { date: '2026-05-25', label: 'Memorial Day' },
  { date: '2026-07-03', label: 'Independence Day (observed)' },
  { date: '2026-09-07', label: 'Labor Day' },
  { date: '2026-11-26', label: 'Thanksgiving Day' },
  { date: '2026-11-27', label: 'Day After Thanksgiving' },
  { date: '2026-12-24', label: 'Christmas Eve' },
  { date: '2026-12-25', label: 'Christmas Day' },
  { date: '2027-01-01', label: "New Year's Day" },
];

export interface NYParts { y: number; m: number; d: number; hour: number; minute: number; weekday: number; iso: string }

export function nyParts(date: Date): NYParts {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: RMG_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  });
  const p: Record<string, string> = {};
  for (const part of f.formatToParts(date)) p[part.type] = part.value;
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  const y = +p.year, m = +p.month, d = +p.day;
  return { y, m, d, hour: +p.hour % 24, minute: +p.minute, weekday: wd, iso: `${p.year}-${p.month}-${p.day}` };
}

/** Calendar helpers on plain ISO dates (no timezone drift). */
export function isoToUTC(iso: string): Date { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
export function utcToIso(dt: Date): string { return dt.toISOString().slice(0, 10); }
export function addDaysIso(iso: string, n: number): string { const dt = isoToUTC(iso); dt.setUTCDate(dt.getUTCDate() + n); return utcToIso(dt); }
export function weekdayIso(iso: string): number { return isoToUTC(iso).getUTCDay(); }
export function closureFor(iso: string) { return OFFICE_CLOSURES.find((c) => c.date === iso); }
export function isBusinessDay(iso: string): boolean { const wd = weekdayIso(iso); return wd !== 0 && wd !== 6 && !closureFor(iso); }

/** Add N RMG business days after a start date (start day not counted). */
export function addBusinessDays(iso: string, n: number): string {
  let cur = iso; let left = n;
  while (left > 0) { cur = addDaysIso(cur, 1); if (isBusinessDay(cur)) left--; }
  return cur;
}

export function fmtLong(iso: string): string { const dt = isoToUTC(iso); return `${DAY_NAMES[dt.getUTCDay()]}, ${MONTHS_SHORT[dt.getUTCMonth()]} ${dt.getUTCDate()}`; }
export function fmtMonthDay(iso: string): string { const dt = isoToUTC(iso); return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`; }
export function fmtShort(iso: string): string { const dt = isoToUTC(iso); return `${MONTHS_SHORT[dt.getUTCMonth()]} ${dt.getUTCDate()}`; }
export function fmtFull(iso: string): string { const dt = isoToUTC(iso); return `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`; }
export function monthName(m: number) { return MONTHS[m - 1]; }
export function fmtHour(h: number): string { const ap = h >= 12 ? 'PM' : 'AM'; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:00 ${ap}`; }

export type OfficeOverride = 'auto' | 'open' | 'closed';

export interface OfficeStatus {
  open: boolean;
  todayLabel: string; // "Today: Closed" or "Today: 9:00 AM - 5:00 PM"
  nextOpening: string; // "Opens Monday at 9:00 AM"
  closureNote?: string;
  simulated: boolean;
}

export function officeStatus(now: Date, override: OfficeOverride): OfficeStatus {
  const p = nyParts(now);
  const closure = closureFor(p.iso);
  const todayBiz = isBusinessDay(p.iso);
  const minutes = p.hour * 60 + p.minute;
  let open = todayBiz && minutes >= OFFICE_OPEN_HOUR * 60 && minutes < OFFICE_CLOSE_HOUR * 60;
  const simulated = override !== 'auto';
  if (override === 'open') open = true;
  if (override === 'closed') open = false;

  const todayHours = `${fmtHour(OFFICE_OPEN_HOUR)} - ${fmtHour(OFFICE_CLOSE_HOUR)}`;
  const todayLabel = todayBiz ? `Today: ${todayHours}` : `Today: Closed${closure ? ` (${closure.label})` : ''}`;

  // Next opening: today if before 9 on a business day, else the next business day.
  let nextIso = p.iso;
  let sameDay = todayBiz && minutes < OFFICE_OPEN_HOUR * 60;
  if (!sameDay) { nextIso = addDaysIso(p.iso, 1); while (!isBusinessDay(nextIso)) nextIso = addDaysIso(nextIso, 1); }
  const wd = weekdayIso(nextIso);
  const dayWord = sameDay ? 'today' : DAY_NAMES[wd];
  const nextOpening = `Opens ${dayWord} at ${fmtHour(OFFICE_OPEN_HOUR)}`;
  return { open, todayLabel: open && !todayBiz ? `Today: ${todayHours}` : todayLabel, nextOpening, closureNote: closure?.label, simulated };
}

export function greeting(now: Date): string {
  const h = nyParts(now).hour;
  if (h < 12) return 'Good morning!';
  if (h < 17) return 'Good afternoon!';
  return 'Good evening!';
}

export function weeklyHours(): { day: string; hours: string }[] {
  return DAY_NAMES.slice(1).concat(DAY_NAMES[0]).map((day, i) => ({ day, hours: i < 5 ? `${fmtHour(OFFICE_OPEN_HOUR)} - ${fmtHour(OFFICE_CLOSE_HOUR)}` : 'Closed' }));
}

export function upcomingClosures(now: Date, count = 4) {
  const iso = nyParts(now).iso;
  return OFFICE_CLOSURES.filter((c) => c.date >= iso).slice(0, count);
}

export function todayIso(now: Date = new Date()): string { return nyParts(now).iso; }
export function nowStamp(): string { return new Date().toISOString(); }
export function fmtStamp(ts: string): string {
  const d = new Date(ts);
  return new Intl.DateTimeFormat('en-US', { timeZone: RMG_TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
}
