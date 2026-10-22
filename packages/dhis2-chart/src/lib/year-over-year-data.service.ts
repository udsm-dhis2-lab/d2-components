import {
  AnalyticsQuery,
  AnalyticsResponse,
  VisualizationDataSource,
} from './core';

export interface YearOverYearRequest {
  dxId: string;
  ouId: string;
  relativePeriodDate: string;
}

export interface YearOverYearBundle {
  kind: 'YEAR_OVER_YEAR_LINE';
  axis: {
    year: number;
    relativePeriodDate: string;
    periodIds: string[];
    categories: string[];
    meta: AnalyticsResponse;
  };
  series: Array<{ name: string; year: number; data: number[] }>;
  rawPerYear: unknown[];
  context: YearOverYearRequest & { years: number[] };
  warnings?: { perYearFailed: unknown[] };
}

export class YearOverYearDataService {
  readonly #dataSource: VisualizationDataSource;

  constructor(dataSource: VisualizationDataSource) {
    this.#dataSource = dataSource;
  }

  async load(request: YearOverYearRequest): Promise<YearOverYearBundle> {
    const yearsMeta = await this.#dataSource.getAnalytics(yearsQuery());
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
            weeklyQuery(request, relativePeriodDate, true)
          ),
          this.#dataSource.getAnalytics(
            weeklyQuery(request, relativePeriodDate, false)
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
    if (!successful.length)
      throw new Error('All year-over-year requests failed');

    const axisSource = successful
      .slice()
      .sort((left, right) => right.year - left.year)[0];
    const periodIds =
      (axisSource.meta.metaData?.['dimensions']?.['pe'] as string[]) ?? [];
    if (!periodIds.length)
      throw new Error('Weekly metadata returned no periods');

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
      series: buildYearOverYearSeries(successful, periodIds),
      rawPerYear: successful,
      context: { ...request, years },
      warnings: failed.length ? { perYearFailed: failed } : undefined,
    };
  }
}

export function buildYearOverYearSeries(
  years: Array<{ year: number; values: AnalyticsResponse }>,
  periodIds: string[]
): Array<{ name: string; year: number; data: number[] }> {
  return years
    .map(({ year, values }) => {
      const periodIndex = values.headers.findIndex(({ name }) => name === 'pe');
      const valueIndex = values.headers.findIndex(
        ({ name }) => name === 'value'
      );
      const byWeek = new Map<number, number>();
      values.rows.forEach((row) => {
        const week = weekNumber(row[periodIndex]);
        const value = Number(row[valueIndex]);
        if (week && Number.isFinite(value)) byWeek.set(week, value);
      });
      return {
        name: String(year),
        year,
        data: periodIds.map((id) => byWeek.get(weekNumber(id) ?? -1) ?? 0),
      };
    })
    .sort((left, right) => left.year - right.year);
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
