/** Values for DHIS2 tracker filter syntax, not URL encoding.
 * The server decodes the query parameter then parses UID:OP:VALUE, and
 * reserves ':', ',' and '/'. Escape them exactly once at the filter boundary.
 * See DHIS2 Tracker API docs: filter value escaping.
 */
export function escapeTrackerFilterValue(value: string): string {
  return value.replace(/\//g, "//").replace(/:/g, "/:").replace(/,/g, "/,");
}

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const candidate = new Date(0);
  candidate.setUTCFullYear(year, month - 1, day);
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

/** Local wall-clock time: do not accidentally convert it to UTC. */
export function isValidDateTime(value: string): boolean {
  const match =
    /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.exec(value);
  return Boolean(match && isValidCalendarDate(match[1]));
}

export function isValidFilterValue(value: string, valueType: string): boolean {
  if (!value.trim()) return false;
  switch (valueType) {
    case "DATE":
      return isValidCalendarDate(value);
    case "DATETIME":
      return isValidDateTime(value);
    case "TIME":
      return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
    case "INTEGER":
      return /^-?\d+$/.test(value);
    case "NUMBER":
      return Number.isFinite(Number(value));
    default:
      return true;
  }
}

export function calendarSelectionValue(selection: any): string {
  // DHIS2 UI versions have exposed both of these names.
  const candidate =
    selection?.dateCalendarString ?? selection?.calendarDateString ?? "";
  return isValidCalendarDate(candidate) ? candidate : "";
}

/**
 * DHIS2 tracker query filters use a date-only representation for DATETIME
 * selections in this line-list component. Keep the full selected timestamp in
 * the UI state, but never send its time part to the tracker filter endpoint.
 * Applied state is shared by the main table and export pagination requests.
 */
export function normalizeDateTimeFilterValue(
  value: string,
  valueType: string,
): string {
  return valueType === "DATETIME" && isValidDateTime(value)
    ? value.slice(0, 10)
    : value;
}
