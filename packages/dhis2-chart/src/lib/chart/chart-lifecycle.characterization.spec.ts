import {
  ChartInstance,
  HighchartsAdapter,
} from '../highcharts-adapter';
import {
  chartAnalyticsFixture,
  chartConfigurationFixture,
} from '../../testing/fixtures/chart-characterization.fixtures';
import { D2Charts } from './chart-visualizer';

describe('D2Charts lifecycle characterization', () => {
  let instance: jest.Mocked<ChartInstance>;
  let adapter: jest.Mocked<HighchartsAdapter>;

  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="chart-fixture"></div>';
    instance = {
      destroy: jest.fn(),
      exportChart: jest.fn(),
      getCSV: jest.fn(() => 'name,value\nCases,10'),
    };
    adapter = {
      create: jest.fn().mockReturnValue(instance),
    } as jest.Mocked<HighchartsAdapter>;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderer() {
    return new D2Charts(adapter)
      .setId('chart-fixture')
      .setType('COLUMN')
      .setConfig(chartConfigurationFixture('column'))
      .setData(chartAnalyticsFixture()) as D2Charts;
  }

  it('retains the fluent direct-module configuration path', () => {
    const chart = new D2Charts(adapter);
    const config = chartConfigurationFixture('column');
    const analytics = chartAnalyticsFixture();

    expect(chart.setId('chart-fixture')).toBe(chart);
    expect(chart.setType('COLUMN')).toBe(chart);
    expect(chart.setConfig(config)).toBe(chart);
    expect(chart.setData(analytics)).toBe(chart);
    expect(chart.setSelections([])).toBe(chart);
  });

  it('defers creation by the current fixed 20ms timer', () => {
    const chart = renderer();

    chart.draw();
    expect(adapter.create).not.toHaveBeenCalled();
    jest.advanceTimersByTime(19);
    expect(adapter.create).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(adapter.create).toHaveBeenCalledTimes(1);
  });

  it.todo('rejects a stale pending draw after a newer draw is scheduled');

  it('destroys the active chart before replacing it', () => {
    const chart = renderer();
    chart.draw();
    jest.runOnlyPendingTimers();

    chart.draw();
    jest.runOnlyPendingTimers();

    expect(instance.destroy).toHaveBeenCalledTimes(1);
    expect(adapter.create).toHaveBeenCalledTimes(2);
  });

  it('cancels pending work and disposes idempotently', () => {
    const chart = renderer();
    chart.draw();
    chart.dispose();
    jest.runOnlyPendingTimers();
    expect(adapter.create).not.toHaveBeenCalled();

    chart.draw();
    jest.runOnlyPendingTimers();
    chart.dispose();
    chart.dispose();
    expect(instance.destroy).toHaveBeenCalledTimes(1);
  });

  it('delegates PNG export', () => {
    const chart = renderer();
    chart.draw();
    jest.runOnlyPendingTimers();

    chart.download('PNG');
    expect(instance.exportChart).toHaveBeenCalledTimes(1);
    expect(instance.exportChart).toHaveBeenCalledWith(
      {
        filename: 'Characterization chart',
        type: 'image/png',
      },
      {}
    );
  });

  it.todo('reports XLS as unsupported or produces an XLS artifact');

  it('does not recreate or explicitly reflow on a browser resize event', () => {
    const chart = renderer();
    chart.draw();
    jest.runOnlyPendingTimers();

    window.dispatchEvent(new Event('resize'));

    expect(adapter.create).toHaveBeenCalledTimes(1);
  });
});
