export type TaskPeriod = "morning" | "evening";

export interface ParsedDueDate {
  dateStr: string; // YYYY-MM-DD (local)
  timeStr: string; // HH:mm (24h)
  time12h: string; // e.g. "09:00 AM", "07:00 PM"
  hour: number | null;
  minute: number | null;
  ampm: "AM" | "PM" | null;
  hasTime: boolean;
  period: TaskPeriod | null;
}

/**
 * Formats a Date object to local YYYY-MM-DD string
 */
export function formatLocalDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Parses an ISO dueDate string into local date, time, and AM/PM components,
 * recognizing all-day markers (midnight UTC, end-of-day UTC).
 */
export function parseTaskDueDate(isoStr?: string | null): ParsedDueDate {
  if (!isoStr) {
    return { dateStr: "", timeStr: "", time12h: "", hour: null, minute: null, ampm: null, hasTime: false, period: null };
  }

  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) {
      return { dateStr: "", timeStr: "", time12h: "", hour: null, minute: null, ampm: null, hasTime: false, period: null };
    }

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const localDateStr = `${y}-${m}-${day}`;

    // All-day markers check
    const isMidnightUtc = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
    const isEndOfDayUtc = d.getUTCHours() === 23 && d.getUTCMinutes() === 59;
    const isAllDay = !isoStr.includes("T") || isMidnightUtc || isEndOfDayUtc;

    if (isAllDay) {
      const rawDatePart = isoStr.includes("T") ? isoStr.split("T")[0] : isoStr;
      return {
        dateStr: rawDatePart || localDateStr,
        timeStr: "",
        time12h: "",
        hour: null,
        minute: null,
        ampm: null,
        hasTime: false,
        period: null,
      };
    }

    const h = d.getHours();
    const min = d.getMinutes();
    const timeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const ampm: "AM" | "PM" = h < 12 ? "AM" : "PM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const time12h = `${String(displayH).padStart(2, "0")}:${String(min).padStart(2, "0")} ${ampm}`;
    const period: TaskPeriod = ampm === "AM" ? "morning" : "evening";

    return {
      dateStr: localDateStr,
      timeStr,
      time12h,
      hour: h,
      minute: min,
      ampm,
      hasTime: true,
      period,
    };
  } catch {
    return { dateStr: "", timeStr: "", time12h: "", hour: null, minute: null, ampm: null, hasTime: false, period: null };
  }
}

/**
 * Builds an ISO timestamp from local date (YYYY-MM-DD) and optional local time (HH:mm).
 */
export function buildDueDateTimeIso(dateStr: string, timeStr?: string): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;

  if (timeStr && timeStr.trim()) {
    const [h, min] = timeStr.split(":").map(Number);
    const dateObj = new Date(y, m - 1, d, h || 0, min || 0, 0);
    return dateObj.toISOString();
  }

  // All-day: store as UTC midnight
  const dateObj = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  return dateObj.toISOString();
}

/**
 * Formats minutes into human-friendly duration: e.g. "5m", "25m", "1h 15m"
 */
export function formatDurationCompact(minutes: number): string {
  if (!minutes || minutes <= 0) return "0m";
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

