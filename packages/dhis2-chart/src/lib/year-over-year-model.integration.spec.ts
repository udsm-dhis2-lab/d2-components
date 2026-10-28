import { HighchartsAdapter } from './highcharts-adapter';
import type * as Highcharts from 'highcharts';
import { YearOverYearLineHighchartsVisualizer } from './year-over-year-line';
import { D2Charts } from './chart/chart-visualizer';

describe('direct year-over-year model/adapter path', () => {
  it.each(['YEAR_OVER_YEAR_LINE', 'YEAR_OVER_YEAR_COLUMN'] as const)(
    '%s has equivalent direct and compatibility options', type => {
      jest.useFakeTimers();
      const create = jest.fn((_options: Highcharts.Options) => ({ destroy: jest.fn(), exportChart: jest.fn(), getCSV: jest.fn(() => '') }));
      const bundle = { axis: { categories: ['W01', 'W02'] }, series: [{ name: '2024', year: 2024, data: [3, null] }] };
      const config = { config: { displayName: 'Trend', showData: true } };
      const direct = new D2Charts({ create } as HighchartsAdapter)
        .setType(type).setId('yoy-host').setData(bundle).setConfig(config);
      direct.draw();
      jest.runOnlyPendingTimers();
      const directOptions = create.mock.calls[0][0];
      direct.dispose();
      if (type === 'YEAR_OVER_YEAR_LINE') {
        const compatibility = new YearOverYearLineHighchartsVisualizer({ create } as HighchartsAdapter)
          .setId('yoy-host').setData(bundle).setConfig(config);
        compatibility.draw();
        jest.runOnlyPendingTimers();
        expect(create.mock.calls[1][0]).toEqual(directOptions);
        compatibility.dispose();
      }
      expect(directOptions.chart?.type).toBe(type === 'YEAR_OVER_YEAR_LINE' ? 'line' : 'column');
      jest.useRealTimers();
    }
  );
  it('renders through the injected adapter with unchanged line presentation', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="yoy-host"></div>';
    const chart = {
      destroy: jest.fn(),
      exportChart: jest.fn(),
      getCSV: jest.fn(() => ''),
    };
    const create = jest.fn((_options: Highcharts.Options) => chart);
    const renderer = new YearOverYearLineHighchartsVisualizer({
      create,
    } as HighchartsAdapter)
      .setId('yoy-host')
      .setData({
        axis: { categories: ['W01', 'W02'] },
        series: [{ name: '2024', data: [3, null] }],
      })
      .setConfig({
        config: { displayName: 'Trend', showData: true },
      }) as YearOverYearLineHighchartsVisualizer;
    renderer.draw();
    jest.runOnlyPendingTimers();
    const options = create.mock.calls[0][0];
    expect(options).toMatchObject({
      chart: { type: 'line', animation: false },
      xAxis: { categories: ['W1', 'W2'] },
      series: [{ type: 'line', name: '2024', data: [{ y: 3 }, { y: null }] }],
    });
    renderer.dispose();
    expect(chart.destroy).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('accepts the historical unwrapped favorite configuration', () => {
    jest.useFakeTimers();
    const create = jest.fn((_options: Highcharts.Options) => ({ destroy: jest.fn(), exportChart: jest.fn(), getCSV: jest.fn(() => '') }));
    const renderer = new YearOverYearLineHighchartsVisualizer({ create } as HighchartsAdapter)
      .setId('yoy-host')
      .setConfig({ displayName: 'Historical' })
      .setData({ axis: { categories: ['W01'] }, series: [{ name: '2024', year: 2024, data: [0] }] });
    renderer.draw();
    jest.runOnlyPendingTimers();
    expect(create.mock.calls[0][0].title?.text).toBe('Historical');
    renderer.dispose();
    jest.useRealTimers();
  });

  it('keeps empty and failed YOY bundles accessible without constructing a chart', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="yoy-host"></div>';
    const create = jest.fn((_options: Highcharts.Options) => ({ destroy: jest.fn(), exportChart: jest.fn(), getCSV: jest.fn(() => '') }));
    const renderer = new D2Charts({ create } as HighchartsAdapter)
      .setId('yoy-host').setType('YEAR_OVER_YEAR_COLUMN')
      .setConfig({ config: { displayName: 'Trend' } })
      .setData({ kind: 'YEAR_OVER_YEAR_COLUMN', error: true, message: 'offline' });
    renderer.draw();
    jest.runOnlyPendingTimers();
    expect(create).not.toHaveBeenCalled();
    expect(document.querySelector('#yoy-host [role="status"]')?.textContent).toContain('No data available');
    renderer.dispose();
    jest.useRealTimers();
  });
});
