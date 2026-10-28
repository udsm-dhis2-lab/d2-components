import { HighchartsAdapter } from './highcharts-adapter';
import type * as Highcharts from 'highcharts';
import { YearOverYearLineHighchartsVisualizer } from './year-over-year-line';

describe('direct year-over-year model/adapter path', () => {
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
      series: [{ type: 'line', name: '2024', data: [3, null] }],
    });
    renderer.dispose();
    expect(chart.destroy).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
