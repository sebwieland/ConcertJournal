import dayjs from "dayjs";

type EventDate = string | number[] | null | undefined;

/**
 * Parse a backend date (number[] like [2024, 5, 15], stringified array
 * like "[2024,5,15]", or ISO string like "2024-05-15") into a dayjs instance.
 *
 * Returns dayjs() (current date) for null/undefined/unparseable values.
 */
export function parseEventDate(date: EventDate): dayjs.Dayjs {
  if (date == null) {
    return dayjs();
  }

  if (Array.isArray(date)) {
    if (date.length >= 3) {
      return dayjs().year(date[0]).month(date[1] - 1).date(date[2]);
    }
    return dayjs();
  }

  if (typeof date === "string") {
    // Stringified array from backend: "[2024,5,15]"
    if (date.startsWith("[") && date.endsWith("]")) {
      try {
        const parsed = JSON.parse(date);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return dayjs().year(parsed[0]).month(parsed[1] - 1).date(parsed[2]);
        }
      } catch {
        // fall through to dayjs string parsing
      }
    }
    const d = dayjs(date);
    return d.isValid() ? d : dayjs();
  }

  return dayjs();
}

/**
 * Format a backend date for display.
 * Defaults to "DD/MM/YYYY".
 */
export function formatEventDate(
  date: EventDate,
  format: string = "DD/MM/YYYY",
): string {
  return parseEventDate(date).format(format);
}
