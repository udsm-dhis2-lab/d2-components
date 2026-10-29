import { Fn } from '@iapps/function-analytics';
import {
  AnalyticsQuery,
  AnalyticsResponse,
  VisualizationDataSource,
} from '../contracts/data-source.contracts';

export interface AnalyticsSelection {
  dimension: string;
  items: readonly (
    | string
    | { id?: string; dimensionItem?: string }
  )[];
}

function isAnalyticsResponse(value: unknown): value is AnalyticsResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AnalyticsResponse>;
  return (
    Array.isArray(candidate.headers) &&
    Array.isArray(candidate.rows) &&
    candidate.rows.every(Array.isArray) &&
    Boolean(candidate.metaData && typeof candidate.metaData === 'object')
  );
}

function normalizeMetadata(response: AnalyticsResponse): AnalyticsResponse {
  const metadata = response.metaData ?? {};
  const dimensions = metadata.dimensions ?? {};
  const items = metadata.items ?? {};
  const names =
    metadata.names ??
    Object.fromEntries(
      Object.entries(items).map(([id, item]) => [id, item?.name ?? id])
    );
  const hasFlattenedDimensions = Object.keys(dimensions).every((dimension) =>
    Array.isArray(metadata[dimension])
  );
  if (metadata.names && hasFlattenedDimensions) return response;
  return {
    ...response,
    metaData: {
      ...metadata,
      ...dimensions,
      names,
    },
  };
}

/**
 * Converts supported analytics transport/wrapper shapes to the one raw shape
 * consumed by aggregate renderers.
 */
export function normalizeAnalyticsResponse(value: unknown): AnalyticsResponse {
  if (isAnalyticsResponse(value)) return normalizeMetadata(value);
  if (value && typeof value === 'object') {
    const wrapper = value as {
      _data?: unknown;
      data?: unknown;
      toAnalyticsResponse?: () => unknown;
    };
    if (typeof wrapper.toAnalyticsResponse === 'function') {
      const response = wrapper.toAnalyticsResponse();
      if (isAnalyticsResponse(response)) return normalizeMetadata(response);
    }
    if (isAnalyticsResponse(wrapper._data))
      return normalizeMetadata(wrapper._data);
    if (isAnalyticsResponse(wrapper.data)) return normalizeMetadata(wrapper.data);
  }
  throw new TypeError(
    `Analytics data must contain headers, array rows and metadata (received ${
      value && typeof value === 'object'
        ? Object.keys(value as object).join(', ') || 'an empty object'
        : typeof value
    })`
  );
}

/** Default adapter for the historical function-analytics client. */
export class FunctionAnalyticsDataSource implements VisualizationDataSource {
  async getAnalytics(query: AnalyticsQuery): Promise<AnalyticsResponse> {
    const client = new Fn.Analytics();
    for (const selection of query.selections) {
      const value = selection.items.join(';');
      switch (selection.dimension) {
        case 'dx':
          client.setData(value);
          break;
        case 'pe':
          client.setPeriod(value);
          break;
        case 'ou':
          client.setOrgUnit(value);
          break;
        default:
          client.setDimension(selection.dimension, value);
      }
    }
    if (query.filters?.length) {
      client.setParameters({
        filter: Object.fromEntries(query.filters.map(selection => [selection.dimension, selection.items.join(';')])),
      });
    }
    return normalizeAnalyticsResponse(await client.get());
  }
}

/**
 * Shared aggregate-data boundary used by the compatibility facade. It owns
 * selection conversion and response normalization, but no renderer lifecycle.
 * Direct renderer consumers may use this class and pass its result to setData.
 */
export class D2AnalyticsFacade {
  #dataSource: VisualizationDataSource;
  #selections: AnalyticsSelection[] = [];
  #suppliedData?: AnalyticsResponse;

  constructor(dataSource: VisualizationDataSource = new FunctionAnalyticsDataSource()) {
    this.#dataSource = dataSource;
  }

  setDataSource(dataSource: VisualizationDataSource): this {
    this.#dataSource = dataSource;
    return this;
  }

  setSelections(selections: readonly AnalyticsSelection[]): this {
    this.#selections = selections.map((selection) => ({
      ...selection,
      items: selection.items.map((item) =>
        typeof item === 'string' ? item : { ...item }
      ),
    }));
    return this;
  }

  setData(data: unknown): this {
    this.#suppliedData = normalizeAnalyticsResponse(data);
    return this;
  }

  clearData(): this {
    this.#suppliedData = undefined;
    return this;
  }

  async getData(signal?: AbortSignal, filterDimensions: readonly string[] = []): Promise<AnalyticsResponse> {
    if (this.#suppliedData) return this.#suppliedData;
    const selections = this.#selections.map((selection) => ({
      dimension: selection.dimension,
      items: selection.items
        .map((item) =>
          typeof item === 'string' ? item : item.dimensionItem || item.id
        )
        .filter((item): item is string => Boolean(item)),
    }));
    const filtered = new Set(filterDimensions);
    return normalizeAnalyticsResponse(await this.#dataSource.getAnalytics({
      selections: selections.filter(selection => !filtered.has(selection.dimension)),
      ...(filtered.size ? { filters: selections.filter(selection => filtered.has(selection.dimension)) } : {}),
    }, signal));
  }
}
