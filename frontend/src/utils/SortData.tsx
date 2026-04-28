import { parseEventDate } from "./dateUtils";

/**
 * General utility function to sort data by various criteria
 */
export const sortData = (
  data: any[],
  sortCriteria: string,
  sortOrder: "asc" | "desc",
) => {
  if (!data || data.length === 0) {
    return [];
  }

  return [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortCriteria) {
      case "date":
        const date1 = parseEventDate(a.date);
        const date2 = parseEventDate(b.date);

        comparison = date1.diff(date2);
        break;

      case "bandName":
        comparison = (a.bandName || "").localeCompare(b.bandName || "");
        break;

      case "place":
        comparison = (a.place || "").localeCompare(b.place || "");
        break;

      case "rating":
        comparison = (a.rating || 0) - (b.rating || 0);
        break;

      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
};
