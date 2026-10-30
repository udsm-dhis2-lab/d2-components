import { Fn } from '@iapps/function-analytics';
import { buildStandardChartOptions, normalizeAnalyticalData } from '@iapps/d2-charts';
import { D2Visualizer } from './d2-visualizer';
import { ChartVisualizer } from './modules/chart/chart-visualizer';
import { CustomVisualizer } from './modules/custom/custom-visualizer';
import { MapVisualizer } from './modules/map/map-visualizer';
import { SingleValueVisualizer } from './modules/single-value/single-value-visualizer';
import { TableUtil } from './modules/table/utils/table.util';
import { TrackedEntityLayer } from './modules/map/layers/tracked-entity-layer.model';
import { D2Charts } from '@iapps/d2-charts';
import * as Highcharts from 'highcharts';
import {
  analyticsFixture,
  selectionsFixture,
  trackerFixture,
  visualizationConfigFixture,
} from '../testing/fixtures/visualizer.fixtures';
import { VisualizationType } from './shared/models/visualization-type.model';

jest.mock('@iapps/function-analytics', () => {
  const analyticsResult = {
    headers: [{ name: 'value' }],
    metaData: { dimensions: {}, items: {}, names: {}, dx: [], pe: [], ou: [] },
    rows: [['1']],
  };
  const Analytics = jest.fn().mockImplementation(() => ({
    setData: jest.fn().mockReturnThis(),
    setPeriod: jest.fn().mockReturnThis(),
    setOrgUnit: jest.fn().mockReturnThis(),
    setDimension: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue(analyticsResult),
  }));
  return { Fn: { Analytics } };
});

function configuredVisualizer(type: VisualizationType): D2Visualizer {
  return new D2Visualizer()
    .setId('visualization-host')
    .setType(type)
    .setSelections(selectionsFixture())
    .setConfig(visualizationConfigFixture(type))
    .setData(analyticsFixture());
}

describe('D2Visualizer compatibility facade', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="visualization-host"></div>';
  });

  it('keeps a saved multi-axis COLUMN/LINE chart in the existing facade renderer', async () => {
    jest.useFakeTimers();
    const favorite = {
      id: 'visualization-host', type: 'COLUMN', displayName: 'Visits and coverage', axes: [],
      columns: [{ dimension: 'dx', items: [{ id: 'coverage', name: 'Coverage' }, { id: 'visits', name: 'Visits' }] }],
      rows: [{ dimension: 'pe', items: [{ id: '202401', name: 'January 2024' }] }],
      filters: [{ dimension: 'ou', items: [{ id: 'ou-a', name: 'Facility A' }] }],
      series: [{ dimensionItem: 'coverage', axis: 0 }, { dimensionItem: 'visits', axis: 1, type: 'LINE' }],
    };
    const analytics = {
      headers: [{ name: 'value' }, { name: 'dx' }, { name: 'pe' }, { name: 'ou' }],
      rows: [['75', 'coverage', '202401', 'ou-a'], ['120', 'visits', '202401', 'ou-a']],
      metaData: { dimensions: { dx: ['coverage', 'visits'], pe: ['202401'], ou: ['ou-a'] },
        dx: ['coverage', 'visits'], pe: ['202401'], ou: ['ou-a'],
        names: { coverage: 'Coverage', visits: 'Visits', '202401': 'January 2024', 'ou-a': 'Facility A' } },
    };
    const visualizer = new D2Visualizer().setId('visualization-host').setType('COLUMN')
      .setConfig(favorite).setData(analytics);
    await visualizer.draw();
    jest.runOnlyPendingTimers();
    expect(visualizer.visualizer).toBeInstanceOf(D2Charts);
    const options = (Highcharts.chart as jest.Mock).mock.lastCall?.[0];
    expect(options.yAxis).toHaveLength(2);
    expect(options.series.map((series: { type: string; yAxis: number }) => [series.type, series.yAxis]))
      .toEqual([['column', 0], ['line', 1]]);
    expect(options.series.map((series: { data: { y: number }[] }) => series.data[0].y)).toEqual([75, 120]);
    await visualizer.dispose();
    jest.useRealTimers();
  });

  it('delegates a paired SCATTER request to the chart module', async () => {
    jest.useFakeTimers();
    const analytics = {
      headers: [{ name: 'ou' }, { name: 'dx' }, { name: 'pe' }, { name: 'value' }],
      rows: [['a', 'x', '2024', '1'], ['b', 'x', '2024', '2'], ['a', 'y', '2024', '3'], ['b', 'y', '2024', '4']],
      metaData: { dimensions: { ou: ['a', 'b'], dx: ['x', 'y'], pe: ['2024'] }, names: { a: 'Alpha', b: 'Beta', x: 'X', y: 'Y' } },
    };
    const visualizer = new D2Visualizer().setId('visualization-host').setType('SCATTER')
      .setConfig({ id: 'visualization-host', type: 'SCATTER', xMeasureId: 'x', yMeasureId: 'y' })
      .setData(analytics);
    await visualizer.draw();
    jest.runOnlyPendingTimers();
    expect(visualizer.visualizer).toBeInstanceOf(D2Charts);
    expect((Highcharts.chart as jest.Mock).mock.lastCall?.[0].series[0].type).toBe('scatter');
    await visualizer.dispose();
    jest.useRealTimers();
  });

  it('renders a saved DHIS2 SCATTER favorite without explicit axis assignments', async () => {
    jest.useFakeTimers();
    const favorite = {
      id: 'visualization-host', type: 'SCATTER', displayName: 'ANC: 1st vs 4th visits (scatter plot)',
      regressionType: 'NONE', series: [], axes: [],
      columns: [{ dimension: 'dx', items: [{ id: 'fbfJHSPpUQD', name: 'ANC 1st visit' }, { id: 'hfdmMSPBgLG', name: 'ANC 4th or more visits' }] }],
      rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }, { id: 'LEVEL-2' }] }],
      filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
    };
    const analytics = {
      headers: [{ name: 'dx' }, { name: 'value' }, { name: 'ou' }],
      rows: [['fbfJHSPpUQD', '100', 'district-a'], ['hfdmMSPBgLG', '40', 'district-a']],
      metaData: { dimensions: { dx: ['fbfJHSPpUQD', 'hfdmMSPBgLG'], ou: ['district-a'] },
        names: { fbfJHSPpUQD: 'ANC 1st visit', hfdmMSPBgLG: 'ANC 4th or more visits', 'district-a': 'District A' } },
    };
    const visualizer = new D2Visualizer().setId('visualization-host').setType('SCATTER').setConfig(favorite).setData(analytics);
    await visualizer.draw();
    jest.runOnlyPendingTimers();
    expect((Highcharts.chart as jest.Mock).mock.lastCall?.[0].series[0].data[0]).toMatchObject({ x: 40, y: 100 });
    expect((Highcharts.chart as jest.Mock).mock.lastCall?.[0].title.text).toBeNull();
    expect((Highcharts.chart as jest.Mock).mock.lastCall?.[0].subtitle).toMatchObject({ text: 'Last 12 months' });
    await visualizer.dispose();
    jest.useRealTimers();
  });

  it('queries a saved SCATTER period as an aggregate filter before rendering', async () => {
    jest.useFakeTimers();
    const favorite = {
      id: 'visualization-host', type: 'SCATTER', regressionType: 'NONE', series: [],
      columns: [{ dimension: 'dx', items: [{ id: 'fbfJHSPpUQD' }, { id: 'hfdmMSPBgLG' }] }],
      rows: [{ dimension: 'ou', items: [{ id: 'ImspTQPwCqd' }, { id: 'LEVEL-2' }] }],
      filters: [{ dimension: 'pe', items: [{ id: 'LAST_12_MONTHS' }] }],
    };
    const analytics = {
      headers: [{ name: 'dx' }, { name: 'ou' }, { name: 'value' }],
      rows: [['fbfJHSPpUQD', 'district-a', '4000'], ['hfdmMSPBgLG', 'district-a', '10000']],
      metaData: { dimensions: { dx: ['fbfJHSPpUQD', 'hfdmMSPBgLG'], ou: ['district-a'] }, names: { 'district-a': 'District A' } },
    };
    const getAnalytics = jest.fn().mockResolvedValue(analytics);
    const visualizer = new D2Visualizer().setId('visualization-host').setType('SCATTER')
      .setConfig(favorite).setDataSource({ getAnalytics });
    await visualizer.draw();
    jest.runOnlyPendingTimers();
    expect(getAnalytics).toHaveBeenCalledWith({
      selections: [
        { dimension: 'ou', items: ['ImspTQPwCqd', 'LEVEL-2'] },
        { dimension: 'dx', items: ['fbfJHSPpUQD', 'hfdmMSPBgLG'] },
      ],
      filters: [{ dimension: 'pe', items: ['LAST_12_MONTHS'] }],
    }, undefined);
    expect((Highcharts.chart as jest.Mock).mock.lastCall?.[0].series[0].data[0]).toMatchObject({ x: 10000, y: 4000 });
    await visualizer.dispose();
    jest.useRealTimers();
  });

  it('keeps fluent configuration setters chainable and observable', () => {
    const visualizer = new D2Visualizer();
    const selections = selectionsFixture();
    const analytics = analyticsFixture();

    expect(visualizer.setId('visualization-host')).toBe(visualizer);
    expect(visualizer.setType('COLUMN')).toBe(visualizer);
    expect(visualizer.setSelections(selections)).toBe(visualizer);
    expect(visualizer.setConfig(visualizationConfigFixture())).toBe(visualizer);
    expect(visualizer.setData(analytics)).toBe(visualizer);
    expect(visualizer.setBaseUrl('/dhis')).toBe(visualizer);
    expect(
      visualizer.setMapProviderConfig({ style: 'mock://provider-style' })
    ).toBe(visualizer);
    expect(
      visualizer.setMapDataSource({
        loadGeoFeatures: jest.fn(),
        loadAnalytics: jest.fn(),
      })
    ).toBe(visualizer);

    expect(visualizer.id).toBe('visualization-host');
    expect(visualizer.visualizationType).toBe('COLUMN');
    expect(visualizer.dataSelections).toBe(selections);
    expect(visualizer.dataAnalytics).toBe(analytics);
    expect(visualizer.baseUrl).toBe('/dhis');
  });

  it.each([
    'CHART',
    'LINE',
    'COLUMN',
    'BAR',
    'DOTTED',
    'PIE',
    'STACKED_BAR',
    'STACKED_COLUMN',
    'AREA',
    'STACKED_AREA',
    'RADAR',
    'SOLIDGAUGE',
  ] as VisualizationType[])(
    'dispatches %s to ChartVisualizer',
    async (type) => {
      const draw = jest
        .spyOn(ChartVisualizer.prototype, 'draw')
        .mockImplementation();
      const visualizer = configuredVisualizer(type);

      await expect(visualizer.draw()).resolves.toBe(visualizer);

      expect(visualizer.visualizer).toBeInstanceOf(ChartVisualizer);
      expect(draw).toHaveBeenCalledTimes(1);
      expect(
        (visualizer.visualizer as unknown as { _data: unknown })._data
      ).toBe(visualizer.dataAnalytics);
    }
  );

  it.each(['REPORT_TABLE', 'PIVOT_TABLE'] as VisualizationType[])(
    'dispatches %s to TableUtil',
    async (type) => {
      const draw = jest.spyOn(TableUtil.prototype, 'draw').mockImplementation();
      const visualizer = configuredVisualizer(type);

      await expect(visualizer.draw()).resolves.toBe(visualizer);

      expect(visualizer.visualizer).toBeInstanceOf(TableUtil);
      expect(draw).toHaveBeenCalledTimes(1);
      expect((visualizer.visualizer as TableUtil).getTableAnalytics()).toBe(
        visualizer.dataAnalytics
      );
    }
  );

  it('dispatches MAP to MapVisualizer with the configured base URL', async () => {
    const draw = jest
      .spyOn(MapVisualizer.prototype, 'draw')
      .mockResolvedValue(undefined);
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('MAP')
      .setSelections(selectionsFixture())
      .setBaseUrl('/dhis')
      .setConfig(visualizationConfigFixture('MAP', { mapViews: [] }));

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(visualizer.visualizer).toBeInstanceOf(MapVisualizer);
    expect(draw).toHaveBeenCalledTimes(1);
    expect(
      (visualizer.visualizer as unknown as { _baseUrl: string })._baseUrl
    ).toBe('/dhis');
  });

  it('characterizes saved mapView order through the MAP facade without rendering unsupported families', async () => {
    jest.spyOn(MapVisualizer.prototype, 'draw').mockResolvedValue(undefined);
    const mapViews = [
      { id: 'thematic-a', layer: 'thematic', thematicMapType: 'CHOROPLETH' },
      { id: 'facility-b', layer: 'facility' },
    ];
    const visualizer = new D2Visualizer().setId('visualization-host').setType('MAP')
      .setConfig(visualizationConfigFixture('MAP', { mapViews }));
    await visualizer.draw();
    const renderer = visualizer.visualizer as MapVisualizer;
    expect(renderer).toBeInstanceOf(MapVisualizer);
    expect(renderer.layers.map(layer => [layer.id, layer.layer])).toEqual([
      ['thematic-a', 'thematic'], ['facility-b', 'facility'],
    ]);
    await visualizer.dispose();
  });

  it('feeds a thematic facade layer through the same zero-safe direct MapLayer path', async () => {
    jest.spyOn(MapVisualizer.prototype, 'draw').mockResolvedValue(undefined);
    const source = {
      loadGeoFeatures: jest.fn().mockResolvedValue([{ id: 'ou-a', na: 'Area A', ty: 2,
        co: '[[[35,-6],[36,-6],[36,-7],[35,-7],[35,-6]]]' }]),
      loadAnalytics: jest.fn().mockResolvedValue({ rows: [{ ou: { id: 'ou-a' }, value: 0 }] }),
    };
    const visualizer = new D2Visualizer().setId('visualization-host').setType('MAP')
      .setMapDataSource(source)
      .setConfig(visualizationConfigFixture('MAP', { mapViews: [{ id: 'thematic-a',
        layer: 'thematic', thematicMapType: 'CHOROPLETH', method: 2, classes: 1,
        colorScale: '#2266aa', config: '{"noDataLegend":{"color":"#eeeeee"}}' }] }));
    await visualizer.draw();
    const renderer = visualizer.visualizer as MapVisualizer;
    await renderer.layers[0].loadFeatures();
    expect(renderer.layers[0].featureCollection.features[0].properties)
      .toMatchObject({ value: 0, valueState: 'zero', color: '#2266aa' });
    expect(source.loadAnalytics).toHaveBeenCalledTimes(1);
    await visualizer.dispose();
  });

  it('dispatches SINGLE_VALUE and retains it as the active renderer', async () => {
    const draw = jest
      .spyOn(SingleValueVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = configuredVisualizer('SINGLE_VALUE');

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(draw).toHaveBeenCalledTimes(1);
    expect(visualizer.visualizer).toBeInstanceOf(SingleValueVisualizer);
  });

  it.each(['YEAR_OVER_YEAR_LINE', 'YEAR_OVER_YEAR_COLUMN'] as VisualizationType[])(
    'dispatches %s through D2Charts', async type => {
    const draw = jest
      .spyOn(D2Charts.prototype, 'draw')
      .mockImplementation();
    const visualizer = configuredVisualizer(type);

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(visualizer.visualizer).toBeInstanceOf(
      D2Charts
    );
    expect(draw).toHaveBeenCalledTimes(1);
  });

  it.each(['YEAR_OVER_YEAR_LINE', 'YEAR_OVER_YEAR_COLUMN'] as VisualizationType[])(
    'keeps direct and facade %s Highcharts options equivalent', async type => {
      jest.restoreAllMocks();
      jest.useFakeTimers();
      (Highcharts.chart as jest.Mock).mockClear();
      const bundle = {
        axis: { categories: ['W01', 'W02'] },
        series: [{ name: '2024', year: 2024, data: [0, null] }],
      };
      const visualizer = new D2Visualizer()
        .setId('visualization-host').setType(type)
        .setConfig(visualizationConfigFixture(type))
        .setData(bundle);
      const direct = new D2Charts().setId('visualization-host')
        .setConfig(visualizer.config).setData(bundle).setType(type);
      direct.draw();
      jest.runOnlyPendingTimers();
      const directOptions = (Highcharts.chart as jest.Mock).mock.calls[0][0];
      await visualizer.draw();
      jest.runOnlyPendingTimers();
      expect((Highcharts.chart as jest.Mock).mock.calls[1][0]).toEqual(directOptions);
      direct.dispose();
      await visualizer.dispose();
      jest.useRealTimers();
    }
  );

  it('dispatches CUSTOM analytics rendering and retains the renderer', async () => {
    const draw = jest
      .spyOn(CustomVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('CUSTOM')
      .setSelections(selectionsFixture())
      .setConfig(
        visualizationConfigFixture('CUSTOM', {
          template: { html: '<p>{{dx:dx-a}}</p>', cssStyles: '' },
        })
      )
      .setData(analyticsFixture());

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(draw).toHaveBeenCalledTimes(1);
    expect(visualizer.visualizer).toBeInstanceOf(CustomVisualizer);
  });

  it('dispatches TRACKED_ENTITY_LAYER and retains the renderer', async () => {
    const draw = jest
      .spyOn(TrackedEntityLayer.prototype, 'draw')
      .mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('TRACKED_ENTITY_LAYER')
      .setSelections([{ dimension: 'tea', domain: 'TRACKER', items: [] }])
      .setConfig(visualizationConfigFixture('TRACKED_ENTITY_LAYER'))
      .setTrackedEntityInstances(trackerFixture())
      .setProgram({ id: 'program-a' });

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(draw).toHaveBeenCalledTimes(1);
    expect(visualizer.visualizer).toBeInstanceOf(TrackedEntityLayer);
  });

  it.each(['DICTIONARY', 'MAPBOX'] as VisualizationType[])(
    'currently returns without a renderer for unsupported %s',
    async (type) => {
      const visualizer = configuredVisualizer(type);

      await expect(visualizer.draw()).resolves.toBe(visualizer);

      expect(visualizer.visualizer).toBeUndefined();
    }
  );

  it('can strictly reject unsupported types without changing the legacy default', async () => {
    const visualizer = new D2Visualizer({ unsupportedTypeBehavior: 'throw' })
      .setId('visualization-host')
      .setType('DICTIONARY')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('DICTIONARY'))
      .setData(analyticsFixture());

    await expect(visualizer.draw()).rejects.toThrow(
      'Unsupported visualization type: DICTIONARY'
    );
  });

  it('fetches analytics when supplied analytics are absent', async () => {
    const draw = jest
      .spyOn(ChartVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('COLUMN')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('COLUMN'));

    await visualizer.draw();

    expect(Fn.Analytics).toHaveBeenCalledTimes(1);
    expect(draw).toHaveBeenCalledTimes(1);
  });

  it('keeps facade chart options equivalent to the direct normalized-data path', async () => {
    jest.spyOn(ChartVisualizer.prototype, 'draw').mockImplementation();
    const visualizer = configuredVisualizer('COLUMN');
    await visualizer.draw();
    const renderer = visualizer.visualizer as unknown as {
      _data: unknown;
      _config: unknown;
    };

    expect(buildStandardChartOptions(
      normalizeAnalyticalData(renderer._data), renderer._config
    )).toEqual(buildStandardChartOptions(renderer._data, renderer._config));
  });

  it('unwraps the real function-analytics result shape before renderer dispatch', async () => {
    const analytics = analyticsFixture();
    const networkAnalytics = {
      headers: analytics.headers,
      rows: analytics.rows,
      metaData: {
        dimensions: analytics.metaData.dimensions,
        items: analytics.metaData.items,
      },
    };
    const wrapped = {
      _data: networkAnalytics,
      get rows() {
        return networkAnalytics.rows.map((row) => ({ row }));
      },
    };
    (Fn.Analytics as jest.Mock).mockImplementationOnce(() =>
      analyticsClient(jest.fn().mockResolvedValue(wrapped))
    );
    jest.spyOn(ChartVisualizer.prototype, 'draw').mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('COLUMN')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('COLUMN'));

    await visualizer.draw();

    const rendererData = (
      visualizer.visualizer as unknown as {
        _data: {
          rows: string[][];
          metaData: { dx: string[]; names: Record<string, string> };
        };
      }
    )._data;
    expect(rendererData.rows[0][3]).toBe('40');
    expect(rendererData.metaData.dx).toEqual(['dx-a']);
    expect(rendererData.metaData.names['dx-a']).toBe('Coverage_indicator');
  });

  it('clears stale supplied data when render changes to a fetched request', async () => {
    const fresh = analyticsFixture({ rows: [['dx-a', '2024', 'ou-a', '84']] });
    (Fn.Analytics as jest.Mock).mockImplementationOnce(() =>
      analyticsClient(jest.fn().mockResolvedValue({ _data: fresh }))
    );
    jest.spyOn(ChartVisualizer.prototype, 'draw').mockImplementation();
    const visualizer = configuredVisualizer('COLUMN');

    await visualizer.render({
      type: 'COLUMN',
      target: { id: 'visualization-host' },
      configuration: visualizationConfigFixture('COLUMN'),
      selections: selectionsFixture(),
    });

    expect((visualizer.visualizer as unknown as { _data: unknown })._data).toBe(
      fresh
    );
  });

  it('delegates downloads to the retained renderer', async () => {
    jest.spyOn(ChartVisualizer.prototype, 'draw').mockImplementation();
    const download = jest
      .spyOn(ChartVisualizer.prototype, 'download')
      .mockImplementation();
    const visualizer = configuredVisualizer('COLUMN');
    await visualizer.draw();

    visualizer.download('CSV');

    expect(download).toHaveBeenCalledWith('CSV');
  });

  it('delegates downloads for renderers that were previously not retained', async () => {
    jest.spyOn(CustomVisualizer.prototype, 'draw').mockImplementation();
    const download = jest
      .spyOn(CustomVisualizer.prototype, 'download')
      .mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('CUSTOM')
      .setSelections(selectionsFixture())
      .setConfig(
        visualizationConfigFixture('CUSTOM', {
          template: { html: '<p>{{dx:dx-a}}</p>', cssStyles: '' },
        })
      )
      .setData(analyticsFixture());
    await visualizer.draw();

    visualizer.download('PNG');

    expect(download).toHaveBeenCalledWith('PNG');
  });

  it('uses a fresh renderer for a repeated draw and keeps the latest instance', async () => {
    const draw = jest
      .spyOn(ChartVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = configuredVisualizer('COLUMN');

    await visualizer.draw();
    const firstRenderer = visualizer.visualizer;
    await visualizer.draw();

    expect(draw).toHaveBeenCalledTimes(2);
    expect(visualizer.visualizer).not.toBe(firstRenderer);
  });

  it('disposes the active renderer before replacing it', async () => {
    jest.spyOn(ChartVisualizer.prototype, 'draw').mockImplementation();
    const dispose = jest
      .spyOn(ChartVisualizer.prototype, 'dispose')
      .mockImplementation();
    const visualizer = configuredVisualizer('COLUMN');

    await visualizer.draw();
    const firstRenderer = visualizer.visualizer;
    await visualizer.draw();

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(dispose.mock.instances[0]).toBe(firstRenderer);
  });

  it('delegates disposal and clears the active renderer', async () => {
    jest.spyOn(ChartVisualizer.prototype, 'draw').mockImplementation();
    const dispose = jest
      .spyOn(ChartVisualizer.prototype, 'dispose')
      .mockImplementation();
    const visualizer = configuredVisualizer('COLUMN');
    await visualizer.draw();
    const activeRenderer = visualizer.visualizer;

    await visualizer.dispose();

    expect(dispose).toHaveBeenCalledTimes(1);
    expect(dispose.mock.instances[0]).toBe(activeRenderer);
    expect(visualizer.visualizer).toBeUndefined();
  });

  it('rejects stale analytics work when a newer draw resolves first', async () => {
    let resolveFirst!: (value: unknown) => void;
    let resolveSecond!: (value: unknown) => void;
    const firstData = new Promise((resolve) => (resolveFirst = resolve));
    const secondData = new Promise((resolve) => (resolveSecond = resolve));
    const get = jest
      .fn()
      .mockReturnValueOnce(firstData)
      .mockReturnValueOnce(secondData);
    (Fn.Analytics as jest.Mock)
      .mockImplementationOnce(() => analyticsClient(get))
      .mockImplementationOnce(() => analyticsClient(get));
    const draw = jest
      .spyOn(ChartVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('COLUMN')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('COLUMN'));

    const olderDraw = visualizer.draw();
    const newerDraw = visualizer.draw();
    const newestData = analyticsFixture();
    resolveSecond(newestData);
    await newerDraw;
    resolveFirst(analyticsFixture());
    await olderDraw;

    expect(draw).toHaveBeenCalledTimes(1);
    expect((visualizer.visualizer as unknown as { _data: unknown })._data).toBe(
      newestData
    );
  });

  it('does not activate a stale year-over-year draw after a newer request', async () => {
    let resolveOlder!: (value: any) => void;
    const older = new Promise<any>(resolve => { resolveOlder = resolve; });
    const response = (dimensions: Record<string, string[]>, rows: string[][] = []) => ({
      headers: [{ name: 'pe' }, { name: 'value' }], rows,
      metaData: { dimensions, items: { '2024W1': { name: 'W1' } } },
    });
    const getAnalytics = jest.fn()
      .mockReturnValueOnce(older)
      .mockResolvedValueOnce(response({ pe: ['2024'] }))
      .mockResolvedValueOnce(response({ pe: ['2024W1'] }))
      .mockResolvedValueOnce(response({}, [['2024W1', '7']]));
    const draw = jest.spyOn(D2Charts.prototype, 'draw').mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('YEAR_OVER_YEAR_COLUMN')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('YEAR_OVER_YEAR_COLUMN'))
      .setDataSource({ getAnalytics });
    const olderDraw = visualizer.draw();
    const newerDraw = visualizer.draw();
    await newerDraw;
    resolveOlder(response({ pe: ['2023'] }));
    await olderDraw;
    expect(draw).toHaveBeenCalledTimes(1);
    expect((visualizer.visualizer as unknown as { _data: { series: Array<{ year: number }> } })._data.series[0].year).toBe(2024);
  });

  it('does not let an older renderer completion replace the latest renderer', async () => {
    let resolveOlderDraw!: () => void;
    const olderDrawCompletion = new Promise<void>(
      (resolve) => (resolveOlderDraw = resolve)
    );
    const draw = jest
      .spyOn(MapVisualizer.prototype, 'draw')
      .mockReturnValueOnce(olderDrawCompletion)
      .mockResolvedValueOnce(undefined);
    const dispose = jest
      .spyOn(MapVisualizer.prototype, 'dispose')
      .mockImplementation();
    const visualizer = new D2Visualizer()
      .setId('visualization-host')
      .setType('MAP')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('MAP', { mapViews: [] }));

    const olderDraw = visualizer.draw();
    const olderRenderer = visualizer.visualizer;
    const newerDraw = visualizer.draw();
    await newerDraw;
    const latestRenderer = visualizer.visualizer;
    resolveOlderDraw();
    await olderDraw;

    expect(draw).toHaveBeenCalledTimes(2);
    expect(latestRenderer).not.toBe(olderRenderer);
    expect(visualizer.visualizer).toBe(latestRenderer);
    expect(dispose.mock.instances).toContain(olderRenderer);
  });
});

function analyticsClient(get: jest.Mock) {
  return {
    setData: jest.fn().mockReturnThis(),
    setPeriod: jest.fn().mockReturnThis(),
    setOrgUnit: jest.fn().mockReturnThis(),
    setDimension: jest.fn().mockReturnThis(),
    get,
  };
}
