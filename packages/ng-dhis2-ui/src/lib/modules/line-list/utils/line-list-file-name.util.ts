export interface LineListFileNameOptions {
  /** Optional name of the records being exported; defaults to 'Records'. */
  recordsLabel?: string;
  organisationUnitName?: string;
  programName?: string;
  startDate?: string;
  endDate?: string;
  /** @deprecated Preserved for existing callers; intentionally omitted from filenames. */
  programStageName?: string;
  /** @deprecated Preserved for existing callers; intentionally omitted from filenames. */
  generatedAt?: Date;
}

/**
 * Build a readable, filesystem-safe export filename from the selected query
 * scope. CSV and Excel append their own extension.
 *
 * Start with the configured record label (or 'Records'), followed by the
 * organisation unit, program, and explicitly applied date boundaries.
 * Omit program stage, generic prefixes and timestamps.
 * Long values are clipped to keep filenames portable across file systems.
 */
export function createLineListFileName({
  recordsLabel,
  organisationUnitName,
  programName,
  startDate,
  endDate,
}: LineListFileNameOptions): string {
  const sanitize = (value: string | undefined, fallback: string): string => {
    const normalized = (value || fallback).normalize('NFKC');
    // Disallow filesystem-reserved characters and ASCII controls without a
    // control-character regexp (eslint no-control-regex).
    const filenameSafeText = Array.from(normalized, (character) => {
      const codePoint = character.codePointAt(0);
      const isControl =
        codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f);
      const isReserved = '<>:"/\\|?*'.includes(character);
      return isControl || isReserved ? ' ' : character;
    }).join('');

    const cleaned = filenameSafeText
      .replace(/\s+/g, '_')
      .replace(/^[.\s_]+|[.\s_]+$/g, '')
      .slice(0, 64)
      .replace(/[.\s_]+$/g, '');
    return cleaned || fallback;
  };

  const parts = [
    sanitize(recordsLabel, 'Records'),
    sanitize(organisationUnitName, 'Organisation_Unit'),
    sanitize(programName, 'Program'),
  ];

  // Applied dates use YYYY-MM-DD. Invalid/unset boundaries are not included.
  if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    parts.push(`from_${startDate}`);
  }
  if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    parts.push(`to_${endDate}`);
  }

  return parts.join('__');
}
