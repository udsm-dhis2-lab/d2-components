/** Numeric axis slots are positional in Highcharts; preserve DHIS2 indexes. */
export function inferredRangeAxisIndexes(
  series: readonly { readonly axis?: number }[]
): readonly number[] {
  const maximum = Math.max(0, ...series.map(item => item.axis ?? 0));
  return Array.from({ length: maximum + 1 }, (_, index) => index);
}

/** Inferred axes alternate sides; further axes move outward to avoid overlap. */
export function inferredRangeAxisPlacement(index: number): { opposite: boolean; offset: number } {
  return { opposite: index % 2 === 1, offset: Math.floor(index / 2) * 48 };
}

/** Keep missing/null observations separate from numeric zero on inferred axes. */
export function alignInferredAxisValues<T extends { readonly id: string; readonly data: readonly { readonly id: string; readonly y: unknown }[] }>(
  analytics: { readonly headers: readonly { readonly name: string }[]; readonly rows: readonly (readonly unknown[])[] },
  series: readonly T[],
  categoryDimensions: readonly string[],
  seriesDimension: string
): T[] {
  const valueIndex = analytics.headers.findIndex(header => header.name === 'value');
  const seriesIndex = analytics.headers.findIndex(header => header.name === seriesDimension);
  const categoryIndexes = categoryDimensions.map(dimension => analytics.headers.findIndex(header => header.name === dimension));
  if (valueIndex < 0 || seriesIndex < 0 || categoryIndexes.some(index => index < 0)) return [...series];
  const cells = new Map<string, number | null>();
  analytics.rows.forEach((row, rowIndex) => {
    const key = `${row[seriesIndex]}\u0000${categoryIndexes.map(index => row[index]).join('_')}`;
    const raw = row[valueIndex];
    const value = raw === null || raw === undefined || raw === '' || raw === 'null' ? null : Number(raw);
    if (value !== null && !Number.isFinite(value)) {
      throw new Error(`analytics.rows[${rowIndex}][${valueIndex}]: Expected a finite numeric value`);
    }
    const previous = cells.get(key);
    cells.set(key, value === null ? previous ?? null : (previous ?? 0) + value);
  });
  return series.map(item => ({ ...item,
    data: item.data.map(point => ({ ...point,
      y: cells.get(`${item.id}\u0000${point.id}`) ?? null,
    })),
  } as T));
}
