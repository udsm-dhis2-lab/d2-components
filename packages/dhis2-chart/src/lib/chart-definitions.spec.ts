import { ChartDefinitionRegistry, createStandardChartRegistry, AbstractChartDefinition, ChartBuildContext } from './chart-definitions';
import { ChartModel } from './chart-model';
import { buildStandardChartModel } from './standard-chart.model';
import { buildStandardChartOptions } from './standard-chart.transform';
import { HighchartsOptionsAdapter } from './highcharts-options.adapter';
import { D2Charts } from './chart/chart-visualizer';
import { chartInstance } from '../testing/mocks/highcharts.mock';

const analytics = {
  headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'ou' }, { name: 'value' }],
  rows: [['dx-a', '2024', 'ou-a', '10']],
  metaData: {
    dimensions: { dx: ['dx-a'], pe: ['2024'], ou: ['ou-a'] },
    dx: ['dx-a'], pe: ['2024'], ou: ['ou-a'],
    names: { 'dx-a': 'Data A', '2024': '2024', 'ou-a': 'Org A' },
  },
};
const config = (type: string) => ({
  type, config: { type }, xAxisType: ['pe'], yAxisType: 'dx',
  seriesType: ['ou'], zAxisType: [], sortOrder: 0, showData: false, axes: [],
});

describe('chart definition registry', () => {
  beforeEach(() => { jest.useFakeTimers(); jest.clearAllMocks(); });
  afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); });
  it('rejects unknown and duplicate entries deterministically', () => {
    const registry = createStandardChartRegistry();
    expect(() => registry.resolve('UNKNOWN')).toThrow('Unsupported chart definition: UNKNOWN');
    expect(() => registry.register(registry.resolve('COLUMN'))).toThrow('Duplicate chart definition: COLUMN');
    expect(() => registry.register({ type: 'lowercase', family: 'cartesian', build: jest.fn() }))
      .toThrow('canonical uppercase');
  });

  it('retains prototype-backed legacy configuration getters through policies', () => {
    class LegacyConfig {
      readonly config = config('stacked_column');
      get type() { return this.config.type; }
      get xAxisType() { return this.config.xAxisType; }
      get yAxisType() { return this.config.yAxisType; }
      get zAxisType() { return this.config.zAxisType; }
      get axes() { return this.config.axes; }
      get percentStackedValues() { return true; }
      get sortOrder() { return this.config.sortOrder; }
    }
    const options = buildStandardChartOptions(analytics, new LegacyConfig());
    expect(options.plotOptions.column.stacking).toBe('percent');
  });

  it.each([
    ['COLUMN', 'cartesian'], ['BAR', 'cartesian'], ['LINE', 'cartesian'],
    ['DOTTED', 'cartesian'], ['STACKED_COLUMN', 'cartesian'], ['STACKED_BAR', 'cartesian'],
    ['AREA', 'cartesian'], ['PIE', 'circular'], ['RADAR', 'polar'],
    ['SOLIDGAUGE', 'gauge'], ['GAUGE', 'gauge'],
  ])('%s delegates through the %s family without changing options', (type, family) => {
    const registry = createStandardChartRegistry();
    const definition = registry.resolve(type);
    expect(definition.family).toBe(family);
    const configuration = config(type.toLowerCase());
    const model = buildStandardChartModel(analytics, configuration, registry);
    expect(new HighchartsOptionsAdapter().toOptions(model))
      .toEqual(buildStandardChartOptions(analytics, configuration));
  });

  it('supports a controlled external definition and a facade consumer', () => {
    class ExternalDefinition extends AbstractChartDefinition<'EXTERNAL'> {
      readonly type = 'EXTERNAL' as const;
      readonly family = 'cartesian' as const;
      override build(context: ChartBuildContext): ChartModel {
        return { ...createStandardChartRegistry().resolve('COLUMN').build({
          ...context, configuration: {
            ...context.configuration,
            type: 'column', native: { ...context.configuration.native, type: 'column' },
          },
        }), visualType: 'external' };
      }
    }
    const registry = new ChartDefinitionRegistry([new ExternalDefinition()]);
    const renderer = new D2Charts(undefined, registry).setConfig(config('external')).setData(analytics) as D2Charts;
    renderer.setType('EXTERNAL').draw();
    jest.runOnlyPendingTimers();
    expect(chartInstance.destroy).not.toHaveBeenCalled();
    renderer.dispose();
  });

  it.each(['COLUMN', 'PIE', 'RADAR', 'SOLIDGAUGE'])(
    '%s cancels stale draws, replaces charts and disposes once', type => {
      const first = { destroy: jest.fn(), exportChart: jest.fn(), getCSV: jest.fn() };
      const second = { destroy: jest.fn(), exportChart: jest.fn(), getCSV: jest.fn() };
      const create = jest.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
      const renderer = new D2Charts({ create } as never)
        .setConfig(config(type.toLowerCase())).setData(analytics) as D2Charts;
      renderer.setType(type as never);
      renderer.draw();
      renderer.draw();
      jest.runOnlyPendingTimers();
      expect(create).toHaveBeenCalledTimes(1);
      renderer.draw();
      jest.runOnlyPendingTimers();
      expect(first.destroy).toHaveBeenCalledTimes(1);
      renderer.dispose();
      renderer.dispose();
      expect(second.destroy).toHaveBeenCalledTimes(1);
    }
  );
});
