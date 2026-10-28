import {
  AnalyticsQuery,
  AnalyticsResponse,
  VisualizationDataSource,
} from './core';
import { alignYearOverYear } from './year-over-year.alignment';

export interface YearOverYearRequest {
  dxId: string;
  ouId: string;
  relativePeriodDate: string;
}

export interface YearOverYearBundle {
  kind: 'YEAR_OVER_YEAR_LINE' | 'YEAR_OVER_YEAR_COLUMN';
  axis: {
    year: number;
    relativePeriodDate: string;
    periodIds: string[];
    categories: string[];
    meta: AnalyticsResponse;
  };
  series: Array<{ name: string; year: number; data: Array<number | null> }>;
  rawPerYear: unknown[];
  context: YearOverYearRequest & { years: number[] };
  warnings?: { perYearFailed: unknown[] };
}

export class YearOverYearDataService {
  readonly #dataSource: VisualizationDataSource;

  constructor(dataSource: VisualizationDataSource) {
    this.#dataSource = dataSource;
  }

  async load(request: YearOverYearRequest, signal?: AbortSignal): Promise<YearOverYearBundle> {
    const yearsMeta = await this.#dataSource.getAnalytics(yearsQuery(), signal);
    if (signal?.aborted) throw new Error('Year-over-year request aborted');
    const years = (
      (yearsMeta.metaData?.['dimensions']?.['pe'] as string[]) ?? []
    )
      .map(Number)
      .filter(Number.isFinite)
      .sort((left, right) => left - right);
    if (!years.length)
      throw new Error('Could not resolve year-over-year years');

    const settled = await Promise.allSettled(
      years.map(async (year) => {
        const relativePeriodDate = shiftYear(request.relativePeriodDate, year);
        const [meta, values] = await Promise.all([
          this.#dataSource.getAnalytics(
            weeklyQuery(request, relativePeriodDate, true), signal
          ),
          this.#dataSource.getAnalytics(
            weeklyQuery(request, relativePeriodDate, false), signal
          ),
        ]);
        return { year, relativePeriodDate, meta, values };
      })
    );
    const successful = settled
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
    const failed = settled
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason);
    if (signal?.aborted) throw new Error('Year-over-year request aborted');
    if (!successful.length)
      throw new Error('All year-over-year requests failed');

    const axisSource = successful
      .slice()
      .sort((left, right) => right.year - left.year)[0];
    const periodIds =
      (axisSource.meta.metaData?.['dimensions']?.['pe'] as string[]) ?? [];
    if (!periodIds.length)
      throw new Error('Weekly metadata returned no periods');

    const aligned = alignYearOverYear(successful, periodIds);
    return {
      kind: 'YEAR_OVER_YEAR_LINE',
      axis: {
        year: axisSource.year,
        relativePeriodDate: axisSource.relativePeriodDate,
        periodIds,
        categories: periodIds.map(
          (id) => axisSource.meta.metaData?.items?.[id]?.name ?? weekLabel(id)
        ),
        meta: axisSource.meta,
      },
      series: aligned.series.map(series => ({ ...series, data: [...series.data] })),
      rawPerYear: successful,
      context: { ...request, years },
      warnings: failed.length ? { perYearFailed: failed } : undefined,
    };
  }
}

export function buildYearOverYearSeries(
  years: Array<{ year: number; values: AnalyticsResponse }>,
  periodIds: string[]
): Array<{ name: string; year: number; data: Array<number | null> }> {
  return alignYearOverYear(years, periodIds).series.map(series => ({ ...series, data: [...series.data] }));
}

function yearsQuery(): AnalyticsQuery {
  return {
    selections: [{ dimension: 'pe', items: ['LAST_5_YEARS', 'THIS_YEAR'] }],
    parameters: {
      skipData: true,
      skipMeta: false,
      includeMetadataDetails: true,
    },
  };
}

function weeklyQuery(
  request: YearOverYearRequest,
  relativePeriodDate: string,
  metadataOnly: boolean
): AnalyticsQuery {
  const parameters: Record<string, string | number | boolean> = {
    displayProperty: 'NAME',
    skipMeta: !metadataOnly,
    skipData: metadataOnly,
  };
  if (metadataOnly) parameters['includeMetadataDetails'] = true;
  return {
    selections: [
      { dimension: 'pe', items: ['LAST_52_WEEKS'] },
      { dimension: 'ou', items: [request.ouId] },
      { dimension: 'dx', items: [request.dxId] },
    ],
    relativePeriodDate,
    parameters,
  };
}

function shiftYear(date: string, year: number): string {
  const [, month, day] = date.split('-');
  return `${year}-${month}-${day}`;
}

function weekNumber(value: string): number | null {
  const match = /(?:^\d{4}W|^W)(\d{1,2})/.exec(String(value));
  return match ? Number(match[1]) : null;
}

function weekLabel(value: string): string {
  const week = weekNumber(value);
  return week ? `W${week}` : value;
}
