import { normalizeAnalyticalData } from './analytics-boundary';
import { detectScatterOutliers, extremeScatterLines, pairScatterMeasures, regressScatter, ScatterPoint } from './scatter-statistics';
import { buildStandardChartModel } from './standard-chart.model';
import { HighchartsOptionsAdapter } from './highcharts-options.adapter';

const source = () => ({
  headers: [{ name: 'value' }, { name: 'ou' }, { name: 'dx' }, { name: 'pe' }],
  rows: [
    ['10', 'a', 'x', '2024'], ['20', 'b', 'x', '2024'], ['2', 'a', 'y', '2024'], ['4', 'b', 'y', '2024'],
    ['30', 'c', 'x', '2024'], ['null', 'c', 'y', '2024'],
    ['90', 'd', 'x', '2023'], ['91', 'd', 'y', '2024'],
  ],
  metaData: { dimensions: { ou: ['a', 'b', 'c', 'd'], dx: ['x', 'y'], pe: ['2024', '2023'] }, names: { a: 'Alpha', b: 'Beta', c: 'Gamma', d: 'Delta', x: 'X measure', y: 'Y measure' } },
});

const cloud: ScatterPoint[] = [
  { entityId: 'a', name: 'A', x: 1, y: 1 }, { entityId: 'b', name: 'B', x: 2, y: 1 },
  { entityId: 'c', name: 'C', x: 3, y: 1 }, { entityId: 'd', name: 'D', x: 4, y: 25 },
  { entityId: 'e', name: 'E', x: 5, y: 1 }, { entityId: 'f', name: 'F', x: 6, y: 1 },
  { entityId: 'g', name: 'G', x: 7, y: 1 },
];

describe('pure scatter statistics', () => {
  it('pairs by entity and context, independent of header and row order, without fabricating missing pairs', () => {
    const raw = source();
    const before = JSON.stringify(raw);
    expect(pairScatterMeasures(normalizeAnalyticalData(raw), 'x', 'y')).toEqual([
      { entityId: 'a', name: 'Alpha (pe:2024)', x: 10, y: 2 },
      { entityId: 'b', name: 'Beta (pe:2024)', x: 20, y: 4 },
    ]);
    const reversed = { ...raw, rows: [...raw.rows].reverse() };
    expect(pairScatterMeasures(normalizeAnalyticalData(reversed), 'x', 'y').sort((a, b) => a.entityId.localeCompare(b.entityId)))
      .toEqual(pairScatterMeasures(normalizeAnalyticalData(raw), 'x', 'y'));
    expect(JSON.stringify(raw)).toBe(before);
  });

  it('rejects duplicate values and multiple complete periods', () => {
    const duplicate = source();
    duplicate.rows.push(['11', 'a', 'x', '2024']);
    expect(() => pairScatterMeasures(normalizeAnalyticalData(duplicate), 'x', 'y')).toThrow(/Duplicate x/);
    const periods = source();
    periods.rows.push(['3', 'a', 'x', '2023'], ['5', 'a', 'y', '2023']);
    expect(() => pairScatterMeasures(normalizeAnalyticalData(periods), 'x', 'y')).toThrow(/one shared/);
  });

  it('fits linear, quadratic and local-linear curves without mutation', () => {
    const linear = [1, 2, 3, 4].map(x => ({ entityId: String(x), name: String(x), x, y: 2 * x + 1 }));
    const before = JSON.stringify(linear);
    expect(regressScatter(linear, 'LINEAR').predict(5)).toBeCloseTo(11);
    const quadratic = linear.map(point => ({ ...point, y: point.x ** 2 + 2 * point.x + 1 }));
    expect(regressScatter(quadratic, 'POLYNOMIAL').predict(5)).toBeCloseTo(36);
    expect(regressScatter(linear, 'LOESS').points.map(point => point.y)).toEqual(expect.arrayContaining([expect.closeTo(3), expect.closeTo(5)]));
    expect(JSON.stringify(linear)).toBe(before);
  });

  it('validates insufficient, constant and invalid statistical inputs', () => {
    expect(() => regressScatter(cloud.slice(0, 1), 'LINEAR')).toThrow(/At least 2/);
    expect(() => regressScatter(cloud.slice(0, 2), 'POLYNOMIAL')).toThrow(/At least 3/);
    expect(() => regressScatter(cloud.slice(0, 3), 'LOESS')).toThrow(/At least 4/);
    expect(() => regressScatter(cloud.map(point => ({ ...point, x: 1 })), 'LINEAR')).toThrow(/distinct x/);
    expect(() => regressScatter(cloud, 'LOESS', 0)).toThrow(/span/);
    expect(() => regressScatter(cloud.map(point => ({ ...point, x: point.x * 1e200 })), 'LINEAR')).toThrow(/finite precision/);
    expect(() => detectScatterOutliers(cloud, 'IQR', 0)).toThrow(/positive/);
    expect(() => detectScatterOutliers(cloud, 'IQR', 1.5, 501)).toThrow(/1 to 500/);
  });

  it('scores residuals, caps results and defines zero-scale behavior', () => {
    expect(detectScatterOutliers(cloud, 'IQR').flagged.map(point => point.entityId)).toEqual(['d']);
    expect(detectScatterOutliers(cloud, 'MODIFIED_Z_SCORE').flagged.map(point => point.entityId)).toEqual(['d']);
    expect(detectScatterOutliers(cloud, 'STANDARD_Z_SCORE', 2, 1).flagged.map(point => point.entityId)).toEqual(['d']);
    const constant = cloud.map(point => ({ ...point, y: 1 }));
    expect(detectScatterOutliers(constant, 'IQR').flagged).toEqual([]);
    expect(detectScatterOutliers(constant, 'STANDARD_Z_SCORE').flagged).toEqual([]);
    expect(detectScatterOutliers(constant, 'MODIFIED_Z_SCORE').flagged).toEqual([]);
    expect(extremeScatterLines(cloud, 1)).toHaveLength(4);
    expect(() => extremeScatterLines(cloud, 50)).toThrow(/between 0 and 50/);
  });
});

describe('scatter model and engine boundary', () => {
  it('renders a DHIS2 saved SCATTER favorite with ordered dx columns and no axis assignments', () => {
    const favorite = {
      id: 'EF4os1mklwE', type: 'SCATTER', displayName: 'ANC: 1st vs 4th visits (scatter plot)',
      regressionType: 'NONE', series: [], axes: [],
      columns: [{ dimension: 'dx', items: [{ id: 'fbfJHSPpUQD', name: 'ANC 1st visit' }, { id: 'hfdmMSPBgLG', name: 'ANC 4th or more visits' }] }],
      rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }, { id: 'LEVEL-2' }] }],
      filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
    };
    const analytics = {
      headers: [{ name: 'value' }, { name: 'ou' }, { name: 'dx' }],
      rows: [['100', 'district-a', 'fbfJHSPpUQD'], ['40', 'district-a', 'hfdmMSPBgLG'],
        ['0', 'district-b', 'fbfJHSPpUQD'], ['20', 'district-b', 'hfdmMSPBgLG']],
      metaData: { dimensions: { ou: ['district-a', 'district-b'], dx: ['fbfJHSPpUQD', 'hfdmMSPBgLG'], pe: ['202510', '202511'], co: ['category-a'] },
        names: { 'district-a': 'District A', 'district-b': 'District B', fbfJHSPpUQD: 'ANC 1st visit', hfdmMSPBgLG: 'ANC 4th or more visits' } },
    };
    const model = buildStandardChartModel(analytics, favorite);
    const options = new HighchartsOptionsAdapter().toOptions(model);
    expect(model.series[0].points).toHaveLength(2);
    expect((options.series?.[0] as any).data).toEqual([
      expect.objectContaining({ x: 40, y: 100, name: 'District A' }),
      expect.objectContaining({ x: 20, y: 0, name: 'District B' }),
    ]);
    expect((options.xAxis as any).title.text).toBe('ANC 4th or more visits');
    expect((options.yAxis as any)[0].title.text).toBe('ANC 1st visit');
    expect(options.title?.text).toBeNull();
    expect(options.subtitle).toMatchObject({ text: 'Last 12 months', align: 'center', style: { fontSize: '11px' } });
    expect(options.exporting?.buttons?.contextButton?.enabled).toBe(false);
  });

  it('keeps base points and statistical overlays separate, then serializes typed coordinates', () => {
    const analytics = source();
    analytics.rows.find(row => row[1] === 'c' && row[2] === 'y')![0] = '6';
    const model = buildStandardChartModel(analytics, {
      type: 'SCATTER', renderId: 'scatter-host', xMeasureId: 'x', yMeasureId: 'y', regressionType: 'LINEAR',
      outlierAnalysis: { enabled: true, outlierMethod: 'IQR', extremeLines: { enabled: true, value: 1 } },
    });
    expect(model.series).toHaveLength(1);
    expect(model.series[0].kind).toBe('scatter');
    expect(model.series[0].points).toHaveLength(3);
    expect(model.overlays?.map(overlay => overlay.kind)).toEqual(['regression', 'outliers', 'extreme-line', 'extreme-line', 'extreme-line', 'extreme-line']);
    const options = new HighchartsOptionsAdapter().toOptions(model);
    expect(options.chart?.type).toBe('scatter');
    expect((options.series?.[0] as any).data[0]).toMatchObject({ x: 10, y: 2, name: 'Alpha (pe:2024)' });
    expect(options.series).toHaveLength(3);
    expect((options.xAxis as any).plotLines).toHaveLength(2);
  });

  it('accepts a normalized direct consumer and rejects ambiguous measure assignments', () => {
    const dataset = normalizeAnalyticalData(source());
    const model = buildStandardChartModel(dataset, { type: 'SCATTER', xMeasureId: 'x', yMeasureId: 'y' });
    expect(model.series[0].points).toHaveLength(2);
    expect(() => buildStandardChartModel(dataset, { type: 'SCATTER', series: [{ axis: 0, dimensionItem: 'y' }] })).toThrow(/Specify xMeasureId/);
    expect(() => buildStandardChartModel(dataset, { type: 'SCATTER', xMeasureId: 'x', yMeasureId: 'x' })).toThrow(/distinct/);
    expect(() => buildStandardChartModel(dataset, { type: 'SCATTER', xMeasureId: 'x', yMeasureId: 'y', outlierAnalysis: { enabled: true, maxResults: 10 } })).toThrow(/reserved for OUTLIER_TABLE/);
  });

  it('honors explicit scatter axes and subtitle presentation overrides', () => {
    const favorite = {
      type: 'SCATTER', xMeasureId: 'x', yMeasureId: 'y',
      columns: [{ dimension: 'dx', items: [{ id: 'y' }, { id: 'x' }] }],
      filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
      subtitle: 'District comparison', fontStyle: { visualizationSubtitle: { textColor: '#123456', fontSize: 13, italic: true } },
    };
    const options = new HighchartsOptionsAdapter().toOptions(buildStandardChartModel(source(), favorite));
    expect((options.series?.[0] as any).data[0]).toMatchObject({ x: 10, y: 2 });
    expect(options.subtitle).toMatchObject({ text: 'District comparison', style: { color: '#123456', fontSize: '13px', fontStyle: 'italic' } });
    expect(new HighchartsOptionsAdapter().toOptions(buildStandardChartModel(source(), { ...favorite, hideSubtitle: true })).subtitle)
      .toMatchObject({ text: null });
  });
});
