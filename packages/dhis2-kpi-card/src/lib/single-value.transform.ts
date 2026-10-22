export interface SingleValueAnalytics {
  headers?: readonly { name: string }[];
  rows?: readonly (readonly string[])[];
  metaData?: Record<string, any>;
}

export interface SingleValueViewModel {
  kind: 'value' | 'message';
  dataLabel: string;
  filterLabel: string;
  formattedValue?: string;
  value?: number;
  messageTitle?: string;
  messageSubtitle?: string;
}

export function toSpaceSeparated(value: number): string {
  const [integer, decimal] = value.toString().split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decimal ? `${grouped}.${decimal}` : grouped;
}

export function formatSingleValue(value: number): string {
  const rounded = Math.abs(value) >= 1 ? Math.round(value * 100) / 100 : value;
  return toSpaceSeparated(rounded);
}

export function getDimensionNames(
  dimensions: readonly string[],
  metaData: Record<string, any> = {}
): string[] {
  return dimensions
    .map((dimension) =>
      (metaData[dimension] || [])
        .map((item: string) => (metaData['names'] || {})[item])
        .join(',')
    )
    .filter(Boolean);
}

export function buildSingleValueViewModel(
  analytics: SingleValueAnalytics
): SingleValueViewModel {
  const headers = analytics.headers || [];
  const valueIndex = headers.findIndex(({ name }) => name === 'value');
  if (valueIndex < 0) {
    return {
      kind: 'message',
      dataLabel: '',
      filterLabel: '',
      messageTitle: 'Value column not found',
      messageSubtitle:
        'Please verify that the response contains a header named "value".',
    };
  }

  const metaData = analytics.metaData || {};
  const filterLabel = getDimensionNames(['pe', 'ou'], metaData).join(' - ');
  const rawLabel =
    metaData['names'] && metaData['dx']
      ? metaData['names'][metaData['dx'][0]] ?? ''
      : '';
  const dataLabel = rawLabel ? rawLabel.replace(/_/g, ' ') : '';
  const value = (analytics.rows || []).reduce((sum, row) => {
    const parsed = row[valueIndex] == null ? NaN : parseFloat(row[valueIndex]);
    return Number.isFinite(parsed) ? sum + parsed : sum;
  }, 0);

  return {
    kind: 'value',
    dataLabel,
    filterLabel,
    value,
    formattedValue: formatSingleValue(value),
  };
}

export function wrapText(
  text: string,
  maxChars: number,
  maxLines = 2
): string[] {
  if (!text || maxChars <= 0) return text ? [text] : [];
  const lines: string[] = [];
  let currentLine = '';
  for (const word of text.split(/\s+/)) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxChars) currentLine = candidate;
    else if (lines.length < maxLines - 1) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else break;
  }
  if (currentLine && lines.length < maxLines) lines.push(currentLine);
  return lines;
}
