import { AnalyticalBoundaryError, BoundaryIssue } from './analytical-dataset';

export type CapabilityStatus = 'supported' | 'partial' | 'rejected' | 'deferred';
export interface ChartCapability {
  readonly key: string;
  readonly status: CapabilityStatus;
  readonly evidence: 'verified-dhis2' | 'library-compatibility' | 'unverified';
  readonly types: readonly string[];
  readonly note?: string;
}

const cartesian = ['COLUMN', 'STACKED_COLUMN', 'BAR', 'STACKED_BAR', 'LINE', 'DOTTED', 'AREA', 'STACKED_AREA'];
const standard = [...cartesian, 'PIE', 'RADAR', 'GAUGE', 'SOLIDGAUGE'];
/** Machine-readable UI contract. Retained server fields are not automatically capabilities. */
export const chartCapabilities: readonly ChartCapability[] = Object.freeze([
  { key: 'axes', status: 'partial', evidence: 'verified-dhis2', types: cartesian, note: 'One domain axis; numeric range axes, labels, bounds and reference lines. COLUMN series axis indexes may imply axes when axes is empty.' },
  { key: 'inferredMultiAxis', status: 'partial', evidence: 'verified-dhis2', types: ['COLUMN'], note: 'Empty axes with per-item numeric axis indexes; side/offset parity with DHIS2 output remains unverified' },
  { key: 'series', status: 'partial', evidence: 'verified-dhis2', types: cartesian, note: 'Same-family types plus verified COLUMN/LINE mixing; COLUMN supports inferred multi-axis slots' },
  { key: 'percentStackedValues', status: 'supported', evidence: 'verified-dhis2', types: ['STACKED_COLUMN', 'STACKED_BAR', 'STACKED_AREA'] },
  { key: 'noSpaceBetweenColumns', status: 'supported', evidence: 'verified-dhis2', types: ['COLUMN', 'STACKED_COLUMN', 'BAR', 'STACKED_BAR'] },
  { key: 'showData', status: 'supported', evidence: 'verified-dhis2', types: standard },
  { key: 'seriesKey', status: 'partial', evidence: 'verified-dhis2', types: cartesian, note: 'Visibility and selected label styles' },
  { key: 'title', status: 'partial', evidence: 'verified-dhis2', types: standard, note: 'Explicit text and selected styles' },
  { key: 'subtitle', status: 'partial', evidence: 'verified-dhis2', types: standard, note: 'Explicit text and selected styles' },
  { key: 'fontStyle', status: 'partial', evidence: 'verified-dhis2', types: standard, note: 'Title, subtitle and nested axis/key styles only' },
  { key: 'colorSet', status: 'partial', evidence: 'verified-dhis2', types: standard, note: 'Installed default key only; custom palette lookup unavailable' },
  { key: 'cumulativeValues', status: 'partial', evidence: 'verified-dhis2', types: cartesian, note: 'Decimal sums; ratios and missingness require further verification' },
  { key: 'sortOrder', status: 'supported', evidence: 'verified-dhis2', types: cartesian },
  { key: 'sorting', status: 'partial', evidence: 'verified-dhis2', types: cartesian, note: 'Only category dimension ordering is rendered' },
  { key: 'hideEmptyRowItems', status: 'partial', evidence: 'verified-dhis2', types: cartesian, note: 'Observed category presence; multi-dimension semantics unverified' },
  { key: 'topLimit', status: 'rejected', evidence: 'verified-dhis2', types: [], note: 'Verified for table/report workflows, not charts' },
  { key: 'legend', status: 'deferred', evidence: 'verified-dhis2', types: [], note: 'Value-range legend needs a legend-set resource' },
  { key: 'scatter', status: 'supported', evidence: 'verified-dhis2', types: ['SCATTER'], note: 'Entity- and context-safe paired measures with numeric axes' },
  { key: 'bubble', status: 'deferred', evidence: 'unverified', types: [] },
  { key: 'outlierAnalysis', status: 'partial', evidence: 'verified-dhis2', types: ['SCATTER'], note: 'Local residual-based IQR and z-score strategies; not a diagnostic conclusion' },
]);

export function chartCapability(type: string, key: string): ChartCapability | undefined {
  const capability = chartCapabilities.find(entry => entry.key === key);
  return capability && capability.types.includes(type.toUpperCase()) ? capability : undefined;
}

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => !!value && typeof value === 'object' && !Array.isArray(value);
const issue = (path: string, message: string): BoundaryIssue => ({ path, code: 'UNSUPPORTED_CHART_OPTION', message });
const validNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value);

/** Validates only options whose rendering semantics are implemented here. */
export function validateChartCapabilities(type: string, input: unknown): void {
  if (!record(input)) return;
  const raw = record(input['config']) ? input['config'] as RecordValue : input;
  const effective: RecordValue = { ...input, ...raw };
  if (input['xAxisType'] !== undefined) effective['xAxisType'] = input['xAxisType'];
  const options = effective;
  const issues: BoundaryIssue[] = [];
  const axes = options['axes'];
  if (axes !== undefined && !Array.isArray(axes)) issues.push(issue('configuration.axes', 'axes must be an array'));
  if (Array.isArray(axes)) {
    const seen = new Set<string>();
    axes.forEach((axis, position) => {
      const path = `configuration.axes[${position}]`;
      if (!record(axis) || !['DOMAIN', 'RANGE'].includes(String(axis['type']))) {
        issues.push(issue(path, 'Expected DOMAIN or RANGE axis')); return;
      }
      const index = axis['index'] ?? 0;
      if (!Number.isInteger(index) || Number(index) < 0) issues.push(issue(`${path}.index`, 'Axis index must be a nonnegative integer'));
      const id = `${axis['type']}:${index}`;
      if (axis['index'] !== undefined && seen.has(id)) issues.push(issue(path, `Duplicate ${id} axis`));
      if (axis['index'] !== undefined) seen.add(id);
      if (axis['type'] === 'DOMAIN' && Number(index) !== 0) issues.push(issue(`${path}.index`, 'Only one domain axis is supported'));
      for (const key of ['minValue', 'maxValue']) if (axis[key] !== undefined && !validNumber(axis[key])) issues.push(issue(`${path}.${key}`, 'Expected a finite number'));
      if (validNumber(axis['minValue']) && validNumber(axis['maxValue']) && Number(axis['minValue']) >= Number(axis['maxValue'])) issues.push(issue(path, 'maxValue must exceed minValue'));
      if (axis['steps'] !== undefined && (!Number.isInteger(axis['steps']) || Number(axis['steps']) < 1)) issues.push(issue(`${path}.steps`, 'Expected a positive integer'));
      for (const key of ['baseLine', 'targetLine']) {
        const line = axis[key];
        if (line !== undefined && (!record(line) || !validNumber(line['value']))) issues.push(issue(`${path}.${key}.value`, 'Reference line requires a finite value'));
      }
    });
    if (axes.length && !chartCapability(type, 'axes')) issues.push(issue('configuration.axes', `${type} does not support modern axes`));
  }
  const series = options['series'];
  if (series !== undefined && !Array.isArray(series)) issues.push(issue('configuration.series', 'series must be an array'));
  if (Array.isArray(series) && series.length) {
    if (!chartCapability(type, 'series')) issues.push(issue('configuration.series', `${type} does not support per-item series`));
    const range = Array.isArray(axes) ? axes.filter(axis => record(axis) && axis['type'] === 'RANGE') : [];
    const seenDimensions = new Set<string>();
    series.forEach((item, index) => {
      const path = `configuration.series[${index}]`;
      if (!record(item) || typeof item['dimensionItem'] !== 'string' || !item['dimensionItem']) { issues.push(issue(path, 'Series requires dimensionItem')); return; }
      if (seenDimensions.has(item['dimensionItem'])) issues.push(issue(`${path}.dimensionItem`, 'Duplicate series dimensionItem'));
      seenDimensions.add(item['dimensionItem']);
      if (item['type'] !== undefined) {
        const seriesType = String(item['type']).toUpperCase();
        const baseType = type.replace('STACKED_', '');
        const compatible = seriesType === baseType ||
          (['COLUMN', 'LINE'].includes(baseType) && ['COLUMN', 'LINE'].includes(seriesType)) ||
          (type === 'DOTTED' && seriesType === 'LINE');
        if (!compatible) issues.push(issue(`${path}.type`, `${seriesType} is not a verified per-series type for ${type}; only same-family or COLUMN/LINE mixing is supported`));
      }
      if (item['axis'] !== undefined && (!Number.isInteger(item['axis']) || Number(item['axis']) < 0 || (range.length > 0 && !range.some(axis => (axis['index'] ?? 0) === item['axis'])) || (range.length === 0 && Number(item['axis']) > 0 && type !== 'COLUMN'))) issues.push(issue(`${path}.axis`, 'Series axis must reference an existing RANGE axis index; only COLUMN may infer axes from an empty axes array'));
    });
  }
  for (const key of ['percentStackedValues', 'noSpaceBetweenColumns', 'cumulativeValues']) {
    if (options[key] === true && !chartCapability(type, key)) issues.push(issue(`configuration.${key}`, `${key} is not supported for ${type}`));
  }
  if (options['topLimit'] !== undefined && options['topLimit'] !== 0 && options['topLimit'] !== '0') issues.push(issue('configuration.topLimit', 'topLimit is verified for table/report workflows, not charts'));
  if (options['colorSet'] !== undefined && !['COLOR_SET_DEFAULT', 'DEFAULT'].includes(String(options['colorSet']))) issues.push(issue('configuration.colorSet', 'Only the installed default color set is available'));
  if (options['sorting'] !== undefined) {
    const sorting = options['sorting'];
    const category = Array.isArray(options['xAxisType']) ? options['xAxisType'][0] : undefined;
    if (!Array.isArray(sorting) || sorting.some(rule => !record(rule) || rule['dimension'] !== category || !['ASC', 'DESC'].includes(String(rule['direction'])))) issues.push(issue('configuration.sorting', 'Only ASC/DESC sorting of the category dimension is supported'));
    if (!chartCapability(type, 'sorting')) issues.push(issue('configuration.sorting', `${type} does not support category sorting`));
  }
  if (options['hideEmptyRowItems'] !== undefined && !['NONE', 'BEFORE_FIRST', 'AFTER_LAST', 'BEFORE_FIRST_AFTER_LAST', 'ALL'].includes(String(options['hideEmptyRowItems']))) issues.push(issue('configuration.hideEmptyRowItems', 'Unknown empty-item strategy'));
  if (options['hideEmptyRowItems'] !== undefined && options['hideEmptyRowItems'] !== 'NONE' && !chartCapability(type, 'hideEmptyRowItems')) issues.push(issue('configuration.hideEmptyRowItems', `${type} does not support empty category filtering`));
  if (issues.length) throw new AnalyticalBoundaryError(issues);
}
