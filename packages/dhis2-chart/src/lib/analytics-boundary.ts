import {
  AnalyticalBoundaryError,
  AnalyticalDataset,
  AnalyticalDimension,
  AnalyticalHeader,
  AnalyticalObservation,
  AnalyticalValue,
  BoundaryIssue,
  isRecord,
} from './analytical-dataset';

type Cell = string | number | null;

function asCells(value: unknown): value is readonly Cell[] {
  return Array.isArray(value) && value.every(
    (cell) => cell === null || typeof cell === 'string' || typeof cell === 'number'
  );
}

function parseValue(value: Cell): AnalyticalValue | undefined {
  if (value === null || value === '' || value === 'null') {
    return { kind: 'null', value: null, raw: value };
  }
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number)
    ? { kind: 'number', value: number, raw: value }
    : undefined;
}

/** Validates and normalizes an aggregate response without DOM or chart-engine imports. */
export function normalizeAnalyticalData(input: unknown): AnalyticalDataset {
  const issues: BoundaryIssue[] = [];
  if (!isRecord(input)) {
    throw new AnalyticalBoundaryError([{
      path: '$', code: 'INVALID_RESPONSE', message: 'Expected an analytics response object',
    }]);
  }

  const rawHeaders = input['headers'];
  const rawRows = input['rows'];
  const rawMetadata = input['metaData'];
  if (!Array.isArray(rawHeaders)) issues.push({
    path: 'headers', code: 'INVALID_HEADERS', message: 'Expected an array of named headers',
  });
  if (!Array.isArray(rawRows)) issues.push({
    path: 'rows', code: 'INVALID_ROWS', message: 'Expected an array of rows',
  });
  if (!isRecord(rawMetadata)) issues.push({
    path: 'metaData', code: 'INVALID_METADATA', message: 'Expected a metadata object',
  });
  if (issues.length) throw new AnalyticalBoundaryError(issues);

  const headers = (rawHeaders as unknown[]).map((header, index) => {
    if (!isRecord(header) || typeof header['name'] !== 'string' || !header['name']) {
      issues.push({
        path: `headers[${index}].name`, code: 'INVALID_HEADER_NAME',
        message: 'Expected a nonempty header name',
      });
      return undefined;
    }
    return { ...header } as AnalyticalHeader;
  });
  const namesSeen = new Set<string>();
  headers.forEach((header, index) => {
    if (!header) return;
    if (namesSeen.has(header.name)) issues.push({
      path: `headers[${index}].name`, code: 'DUPLICATE_HEADER',
      message: `Header ${header.name} occurs more than once`,
    });
    namesSeen.add(header.name);
  });
  if (!namesSeen.has('value')) issues.push({
    path: 'headers', code: 'MISSING_VALUE_HEADER', message: 'Expected a value header',
  });

  const metadata = rawMetadata as Record<string, unknown>;
  const rawDimensions = metadata['dimensions'];
  if (rawDimensions !== undefined && !isRecord(rawDimensions)) issues.push({
    path: 'metaData.dimensions', code: 'INVALID_DIMENSIONS',
    message: 'Expected a dimension-to-item map',
  });
  const dimensionMap = isRecord(rawDimensions) ? rawDimensions : {};
  const rawNames = isRecord(metadata['names']) ? metadata['names'] : {};
  const rawItems = isRecord(metadata['items']) ? metadata['items'] : {};
  const resolvedDimensionMap: Record<string, unknown> = { ...dimensionMap };
  for (const header of headers) {
    if (header && header.name !== 'value' &&
        resolvedDimensionMap[header.name] === undefined &&
        Array.isArray(metadata[header.name])) {
      resolvedDimensionMap[header.name] = metadata[header.name];
    }
  }
  const dimensions: AnalyticalDimension[] = [];
  for (const [id, rawIds] of Object.entries(resolvedDimensionMap)) {
    if (!Array.isArray(rawIds) || !rawIds.every((item) => typeof item === 'string')) {
      issues.push({
        path: `metaData.dimensions.${id}`, code: 'INVALID_DIMENSION_ITEMS',
        message: 'Expected an array of item identifiers',
      });
      continue;
    }
    dimensions.push({
      id,
      items: rawIds.map((itemId: string) => {
        const native = isRecord(rawItems[itemId]) ? { ...rawItems[itemId] } : undefined;
        const name = rawNames[itemId] ?? native?.['name'] ?? itemId;
        return { id: itemId, name: String(name), native };
      }),
    });
  }

  const validHeaders = headers.filter((header): header is AnalyticalHeader => Boolean(header));
  const valueIndex = validHeaders.findIndex((header) => header.name === 'value');
  const observations: AnalyticalObservation[] = [];
  (rawRows as unknown[]).forEach((rawRow, rowIndex) => {
    if (!asCells(rawRow)) {
      issues.push({
        path: `rows[${rowIndex}]`, code: 'INVALID_ROW',
        message: 'Expected an array of string, number or null cells',
      });
      return;
    }
    if (rawRow.length !== validHeaders.length) {
      issues.push({
        path: `rows[${rowIndex}]`, code: 'ROW_WIDTH',
        message: `Expected ${validHeaders.length} cells, received ${rawRow.length}`,
      });
      return;
    }
    if (valueIndex < 0) return;
    const value = parseValue(rawRow[valueIndex]);
    if (!value) {
      issues.push({
        path: `rows[${rowIndex}][${valueIndex}]`, code: 'INVALID_VALUE',
        message: 'Expected a finite number, null or empty value',
      });
      return;
    }
    const coordinates: Record<string, string> = {};
    for (const dimension of dimensions) {
      const index = validHeaders.findIndex((header) => header.name === dimension.id);
      // Filter dimensions can be present in metadata without a row column.
      if (index < 0) continue;
      const cell = rawRow[index];
      if (typeof cell !== 'string' || !cell) {
        issues.push({
          path: `rows[${rowIndex}][${index}]`, code: 'INVALID_COORDINATE',
          message: `Expected a nonempty ${dimension.id} identifier`,
        });
      } else {
        coordinates[dimension.id] = cell;
      }
    }
    const attributes: Record<string, Cell> = {};
    validHeaders.forEach((header, index) => {
      if (header.name !== 'value' && !dimensions.some((dimension) => dimension.id === header.name)) {
        attributes[header.name] = rawRow[index];
      }
    });
    observations.push({ coordinates, value, attributes });
  });
  if (issues.length) throw new AnalyticalBoundaryError(issues);

  const names: Record<string, string> = {};
  for (const [id, value] of Object.entries(rawNames)) {
    if (typeof value === 'string') names[id] = value;
  }
  for (const [id, value] of Object.entries(rawItems)) {
    if (isRecord(value) && typeof value['name'] === 'string') {
      names[id] ??= value['name'];
    }
  }
  for (const dimension of dimensions) {
    for (const item of dimension.items) names[item.id] ??= item.name;
  }
  const items: Record<string, Readonly<Record<string, unknown>>> = {};
  for (const [id, value] of Object.entries(rawItems)) {
    if (isRecord(value)) items[id] = { ...value };
  }
  const native = { ...input };
  delete native['headers'];
  delete native['rows'];
  delete native['metaData'];
  return {
    kind: 'ANALYTICAL_DATASET',
    headers: validHeaders,
    dimensions,
    observations,
    metadata: { names, items, native: { ...metadata } },
    native,
  };
}

/** Reconstructs the legacy analytics shape for the current chart helper. */
export function toLegacyAnalytics(dataset: AnalyticalDataset): Record<string, unknown> {
  const dimensionMap = Object.fromEntries(
    dataset.dimensions.map((dimension) => [dimension.id, dimension.items.map((item) => item.id)])
  );
  const rawMetadata = dataset.metadata.native;
  const metaData = {
    ...rawMetadata,
    dimensions: { ...(isRecord(rawMetadata['dimensions']) ? rawMetadata['dimensions'] : {}), ...dimensionMap },
    ...dimensionMap,
    items: { ...(isRecord(rawMetadata['items']) ? rawMetadata['items'] : {}), ...dataset.metadata.items },
    names: { ...(isRecord(rawMetadata['names']) ? rawMetadata['names'] : {}), ...dataset.metadata.names },
  };
  const rows = dataset.observations.map((observation) =>
    dataset.headers.map((header) => {
      if (header.name === 'value') return observation.value.raw === null ? '' : String(observation.value.raw);
      const coordinate = observation.coordinates[header.name];
      if (coordinate !== undefined) return coordinate;
      const attribute = observation.attributes[header.name];
      return attribute === null || attribute === undefined ? '' : String(attribute);
    })
  );
  return { ...dataset.native, headers: dataset.headers.map((header) => ({ ...header })), rows, metaData };
}
