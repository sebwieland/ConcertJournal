import dayjs, { Dayjs } from "dayjs";

export type EventDateInput = string | number[] | string[] | null | undefined;

/**
 * Canonical date parser for API event dates.
 *
 * Tolerates every historical shape:
 * - ISO strings ("2026-09-14") — the API contract since write-dates-as-timestamps=false
 * - numeric arrays ([2026, 9, 14], 1-indexed months) — pre-fix Jackson format
 * - stringified arrays ("[2026, 9, 14]") — stale localStorage/react-query caches
 *
 * Returns null when the input is missing or unparseable; callers decide
 * fallbacks (today's date, skip entry, ...).
 */
const parseEventDate = (input: EventDateInput): Dayjs | null => {
  if (input === undefined || input === null) {
    return null;
  }

  if (Array.isArray(input)) {
    const [year, month, day] = input as number[];
    if (typeof year !== "number" || typeof month !== "number") {
      return null;
    }
    // months in the API array are 1-indexed; dayjs is 0-indexed
    const parsed = dayjs()
      .year(year)
      .month(month - 1)
      .date(day || 1);
    return parsed.isValid() ? parsed : null;
  }

  if (typeof input === "string") {
    if (input.startsWith("[") && input.endsWith("]")) {
      try {
        return parseEventDate(JSON.parse(input));
      } catch {
        return null;
      }
    }
    const parsed = dayjs(input); // dayjs core parses ISO-8601 natively
    return parsed.isValid() ? parsed : null;
  }

  return null;
};

export default parseEventDate;
