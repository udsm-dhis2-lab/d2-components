import { chartInstance } from '../../testing/mocks/highcharts.mock';
import { buildStandardChartOptions } from '../standard-chart.transform';
import { D2Charts } from './chart-visualizer';

const analytics = {
  headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'ou' }, { name: 'value' }],
  rows: [['dx-a', '2024', 'ou-a', '10']],
  metaData: {
    dimensions: { dx: ['dx-a'], pe: ['2024'], ou: ['ou-a'] },
    dx: ['dx-a'],
    pe: ['2024'],
    ou: ['ou-a'],
    names: { 'dx-a': 'Data A', '2024': '2024', 'ou-a': 'Org A' },
  },
};
const configuration: any = {
  type: 'column',
  config: { type: 'column' },
  xAxisType: ['pe'],
  yAxisType: ['dx'],
  seriesType: ['ou'],
  zAxisType: [],
  sortOrder: 0,
  showData: false,
  axes: [],
};

describe('standalone chart module', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="chart-host"></div>';
    jest.useFakeTimers();
  });

  it('builds options as a pure transformation', () => {
    const before = JSON.parse(JSON.stringify(analytics));
    const options = buildStandardChartOptions(analytics, configuration);
    expect(options.chart.type).toBe('column');
    expect(options.series).toHaveLength(1);
    expect(analytics).toEqual(before);
  });

  it('renders and disposes idempotently through the adapter', () => {
    const renderer = new D2Charts()
      .setId('chart-host')
      .setConfig(configuration)
      .setData(analytics) as D2Charts;
    renderer.draw();
    jest.runOnlyPendingTimers();
    renderer.dispose();
    renderer.dispose();
    expect(chartInstance.destroy).toHaveBeenCalledTimes(1);
  });
});
