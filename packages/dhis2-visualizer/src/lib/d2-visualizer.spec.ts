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

  it('dispatches SINGLE_VALUE to its renderer without retaining it', async () => {
    const draw = jest
      .spyOn(SingleValueVisualizer.prototype, 'draw')
      .mockImplementation();
    const visualizer = configuredVisualizer('SINGLE_VALUE');

    await expect(visualizer.draw()).resolves.toBe(visualizer);

    expect(draw).toHaveBeenCalledTimes(1);
    expect(visualizer.visualizer).toBeUndefined();
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

  it('dispatches CUSTOM analytics rendering without retaining the renderer', async () => {
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
    expect(visualizer.visualizer).toBeUndefined();
  });

  it('dispatches TRACKED_ENTITY_LAYER without retaining the renderer', async () => {
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
    expect(visualizer.visualizer).toBeUndefined();
  });

  it.each(['DICTIONARY', 'MAPBOX'] as VisualizationType[])(
    'currently returns without a renderer for unsupported %s',
    async (type) => {
      const visualizer = configuredVisualizer(type);

      await expect(visualizer.draw()).resolves.toBe(visualizer);

      expect(visualizer.visualizer).toBeUndefined();
    }
  );

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
});
