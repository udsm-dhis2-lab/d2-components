import { Fn } from '@iapps/function-analytics';
import { D2Visualizer } from './d2-visualizer';
import { ChartVisualizer } from './modules/chart/chart-visualizer';
import { CustomVisualizer } from './modules/custom/custom-visualizer';
import { MapVisualizer } from './modules/map/map-visualizer';
import { SingleValueVisualizer } from './modules/single-value/single-value-visualizer';
import { TableUtil } from './modules/table/utils/table.util';
import { TrackedEntityLayer } from './modules/map/layers/tracked-entity-layer.model';
import { YearOverYearLineHighchartsVisualizer } from './modules/year-over-year-line/year-over-year-line';
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

  it('dispatches SINGLE_VALUE and retains it as the active renderer', async () => {
    const draw = jest
      .spyOn(SingleValueVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = configuredVisualizer('SINGLE_VALUE');

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(draw).toHaveBeenCalledTimes(1);
    expect(visualizer.visualizer).toBeInstanceOf(SingleValueVisualizer);
  });

  it('dispatches YEAR_OVER_YEAR_LINE to its Highcharts renderer', async () => {
    const draw = jest
      .spyOn(YearOverYearLineHighchartsVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = configuredVisualizer('YEAR_OVER_YEAR_LINE');

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(visualizer.visualizer).toBeInstanceOf(
      YearOverYearLineHighchartsVisualizer
    );
    expect(draw).toHaveBeenCalledTimes(1);
  });

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
