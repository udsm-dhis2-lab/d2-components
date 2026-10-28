import type { AnalyticsResponse } from './core';

export type YearOverYearPeriodType = 'WEEK' | 'MONTH' | 'QUARTER';
export type Week53Policy = 'include' | 'omit';
export interface YearPeriod { readonly year: number; readonly index: number; readonly type: YearOverYearPeriodType }
export interface YearValues { readonly year: number; readonly values: AnalyticsResponse }
export interface AlignedYearOverYear {
  readonly type: YearOverYearPeriodType;
  readonly periods: readonly number[];
  readonly categories: readonly string[];
  readonly series: readonly { readonly name: string; readonly year: number; readonly data: readonly (number | null)[] }[];
}

/** Parse only the DHIS2 period identifiers we can align unambiguously. */
export function parseYearPeriod(id: string): YearPeriod {
  const match = /^(\d{4})(W(\d{1,2})|(\d{2})|Q([1-4]))$/.exec(id);
  if (!match) throw new Error(`Unsupported year-over-year period: ${id}`);
  const year = Number(match[1]);
  const type: YearOverYearPeriodType = match[3] ? 'WEEK' : match[4] ? 'MONTH' : 'QUARTER';
  const index = Number(match[3] || match[4] || match[5]);
  if ((type === 'WEEK' && index > 53) || (type === 'MONTH' && (index < 1 || index > 12))) {
    throw new Error(`Invalid year-over-year period: ${id}`);
  }
  return { year, type, index };
}

/** Alignment precedes sorting, cumulative calculations and empty-item filtering.
 * Those operations, if requested, run on the aligned matrix; null gaps are never
 * silently converted into observations. Week 53 is included by default when
 * any year's metadata declares it; incomplete years retain null cells.
 */
export function alignYearOverYear(
  years: readonly YearValues[], periodIds: readonly string[],
  options: { week53?: Week53Policy } = {}
): AlignedYearOverYear {
  if (!periodIds.length) throw new Error('Year-over-year metadata returned no periods');
  const parsed = periodIds.map(parseYearPeriod);
  const type = parsed[0].type;
  if (parsed.some(period => period.type !== type)) throw new Error('Mixed year-over-year period types');
  const periods = [...new Set(parsed.map(period => period.index))]
    .filter(index => type !== 'WEEK' || index !== 53 || options.week53 !== 'omit');
  const series = years.map(({ year, values }) => {
    const periodIndex = values.headers.findIndex(header => header.name === 'pe');
    const valueIndex = values.headers.findIndex(header => header.name === 'value');
    if (periodIndex < 0 || valueIndex < 0) throw new Error('Year-over-year analytics requires pe and value headers');
    const byPeriod = new Map<number, number | null>();
    for (const row of values.rows) {
      const period = parseYearPeriod(row[periodIndex]);
      if (period.type !== type || period.year !== year) throw new Error('Year-over-year period does not match its series');
      const raw = row[valueIndex];
      const value = raw === '' || raw == null ? null : Number(raw);
      if (value !== null && !Number.isFinite(value)) throw new Error(`Invalid year-over-year value: ${raw}`);
      byPeriod.set(period.index, value);
    }
    return { name: String(year), year, data: periods.map(index => byPeriod.get(index) ?? null) };
  }).sort((left, right) => left.year - right.year);
  return { type, periods, categories: periods.map(index => `${type === 'WEEK' ? 'W' : type === 'QUARTER' ? 'Q' : ''}${type === 'MONTH' ? String(index).padStart(2, '0') : index}`), series };
}
