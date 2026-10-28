/** Renderer-independent representation of a DHIS2 aggregate analytics result. */
export interface AnalyticalItem {
  id: string;
  name: string;
  native?: Readonly<Record<string, unknown>>;
}

export interface AnalyticalDimension {
  id: string;
  items: readonly AnalyticalItem[];
}

export type AnalyticalValue =
  | { kind: 'number'; value: number; raw: string | number }
  | { kind: 'null'; value: null; raw: string | null };

export interface AnalyticalObservation {
  coordinates: Readonly<Record<string, string>>;
  value: AnalyticalValue;
  /** Non-dimensional analytics columns, indexed by header name. */
  attributes: Readonly<Record<string, string | number | null>>;
}

export interface AnalyticalMetadata {
  names: Readonly<Record<string, string>>;
  items: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  /** Native metadata including fields not yet understood by this library. */
  native: Readonly<Record<string, unknown>>;
}

export interface AnalyticalHeader {
  name: string;
  column?: string;
  valueType?: string;
  [property: string]: unknown;
}

export interface AnalyticalDataset {
  kind: 'ANALYTICAL_DATASET';
  headers: readonly AnalyticalHeader[];
  dimensions: readonly AnalyticalDimension[];
  observations: readonly AnalyticalObservation[];
  metadata: AnalyticalMetadata;
  /** Unknown top-level native response properties for round-trip use. */
  native: Readonly<Record<string, unknown>>;
}

export interface BoundaryIssue {
  path: string;
  code: string;
  message: string;
}

export class AnalyticalBoundaryError extends TypeError {
  readonly issues: readonly BoundaryIssue[];

  constructor(issues: readonly BoundaryIssue[]) {
    super(`Invalid analytical data: ${issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
    this.name = 'AnalyticalBoundaryError';
    this.issues = issues;
  }
}

export function isAnalyticalDataset(value: unknown): value is AnalyticalDataset {
  return isRecord(value) && value['kind'] === 'ANALYTICAL_DATASET';
}

/** Checks a consumer-supplied dataset before it reaches the legacy adapter. */
export function assertAnalyticalDataset(value: unknown): asserts value is AnalyticalDataset {
  const issues: BoundaryIssue[] = [];
  if (!isAnalyticalDataset(value)) {
    throw new AnalyticalBoundaryError([{
      path: 'dataset.kind', code: 'INVALID_DATASET',
      message: 'Expected an ANALYTICAL_DATASET',
    }]);
  }
  if (!Array.isArray(value.headers)) issues.push({
    path: 'dataset.headers', code: 'INVALID_HEADERS', message: 'Expected headers',
  });
  else value.headers.forEach((header, index) => {
    if (!isRecord(header) || typeof header['name'] !== 'string') issues.push({
      path: `dataset.headers[${index}].name`, code: 'INVALID_HEADER_NAME',
      message: 'Expected a header name',
    });
  });
  if (!Array.isArray(value.dimensions)) issues.push({
    path: 'dataset.dimensions', code: 'INVALID_DIMENSIONS', message: 'Expected dimensions',
  });
  else value.dimensions.forEach((dimension, index) => {
    if (!isRecord(dimension) || typeof dimension['id'] !== 'string' ||
        !Array.isArray(dimension['items']) ||
        !dimension['items'].every((item: unknown) => isRecord(item) &&
          typeof item['id'] === 'string' && typeof item['name'] === 'string')) {
      issues.push({
        path: `dataset.dimensions[${index}]`, code: 'INVALID_DIMENSION',
        message: 'Expected an identifier and named items',
      });
    }
  });
  if (!Array.isArray(value.observations)) issues.push({
    path: 'dataset.observations', code: 'INVALID_OBSERVATIONS',
    message: 'Expected observations',
  });
  else value.observations.forEach((observation, index) => {
    if (!isRecord(observation) || !isRecord(observation['coordinates']) ||
        !isRecord(observation['attributes']) || !isRecord(observation['value'])) {
      issues.push({
        path: `dataset.observations[${index}]`, code: 'INVALID_OBSERVATION',
        message: 'Expected coordinates, attributes and value',
      });
      return;
    }
    const analyticalValue = observation['value'];
    if (analyticalValue['kind'] === 'number' &&
        (typeof analyticalValue['value'] !== 'number' ||
          !Number.isFinite(analyticalValue['value']))) {
      issues.push({
        path: `dataset.observations[${index}].value`, code: 'INVALID_VALUE',
        message: 'Expected a finite numeric value',
      });
    } else if (analyticalValue['kind'] === 'null' && analyticalValue['value'] !== null) {
      issues.push({
        path: `dataset.observations[${index}].value`, code: 'INVALID_VALUE',
        message: 'Expected a null value',
      });
    } else if (analyticalValue['kind'] !== 'number' && analyticalValue['kind'] !== 'null') {
      issues.push({
        path: `dataset.observations[${index}].value.kind`, code: 'INVALID_VALUE_KIND',
        message: 'Expected number or null',
      });
    }
  });
  if (!isRecord(value.metadata) || !isRecord(value.metadata.names) ||
      !isRecord(value.metadata.items) || !isRecord(value.metadata.native)) issues.push({
    path: 'dataset.metadata', code: 'INVALID_METADATA',
    message: 'Expected names, items and native metadata objects',
  });
  if (!isRecord(value.native)) issues.push({
    path: 'dataset.native', code: 'INVALID_NATIVE', message: 'Expected native extras object',
  });
  if (issues.length) throw new AnalyticalBoundaryError(issues);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
