import * as Highcharts from 'highcharts';
import { buildStandardChartOptions } from '@iapps/d2-charts';
import {
  analyticsFixture,
  visualizationConfigFixture,
} from '../../../testing/fixtures/visualizer.fixtures';
import { chartInstance } from '../../../testing/mocks/highcharts.mock';
import { VisualizationConfiguration } from '../../shared/models/visualization-configuration.model';
import { D2Visualizer } from '../../d2-visualizer';
import { ChartVisualizer } from './chart-visualizer';
import { drawChart } from './helpers/draw-chart.helper';
import { ChartObject, ChartXAxis, ChartYAxis } from './models';

describe('chart characterization', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="chart-host"></div>';
  });

  it('converts analytics into Highcharts categories and series', () => {
    const analytics = analyticsFixture();
    const config = new VisualizationConfiguration(
      visualizationConfigFixture('COLUMN')
    );

    const options = drawChart(analytics as never, config);

    expect(options.chart.type).toBe('COLUMN');
    expect(options.series).toHaveLength(1);
    expect(options.series[0].data).toHaveLength(1);
    expect(options.credits.enabled).toBe(false);
  });

  it('renders asynchronously and replaces its existing chart', () => {
    jest.useFakeTimers();
    const renderer = new ChartVisualizer()
      .setId('chart-host')
      .setConfig(
        new VisualizationConfiguration(visualizationConfigFixture('COLUMN'))
      )
      .setData(analyticsFixture()) as ChartVisualizer;

    renderer.draw();
    expect(Highcharts.chart).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    expect(Highcharts.chart).toHaveBeenCalledTimes(1);

    renderer.draw();
    jest.runOnlyPendingTimers();
    expect(Highcharts.chart).toHaveBeenCalledTimes(2);
  });

  it('cancels pending rendering when disposed', () => {
    jest.useFakeTimers();
    const renderer = new ChartVisualizer()
      .setId('chart-host')
      .setConfig(
        new VisualizationConfiguration(visualizationConfigFixture('COLUMN'))
      )
      .setData(analyticsFixture()) as ChartVisualizer;

    renderer.draw();
    renderer.dispose();
    jest.runOnlyPendingTimers();

    expect(Highcharts.chart).not.toHaveBeenCalled();
  });

  it('can be disposed repeatedly without destroying a chart twice', () => {
    jest.useFakeTimers();
    const renderer = new ChartVisualizer()
      .setId('chart-host')
      .setConfig(
        new VisualizationConfiguration(visualizationConfigFixture('COLUMN'))
      )
      .setData(analyticsFixture()) as ChartVisualizer;

    renderer.draw();
    jest.runOnlyPendingTimers();
    renderer.dispose();
    renderer.dispose();

    expect(chartInstance.destroy).toHaveBeenCalledTimes(1);
  });

  it('produces equivalent options through the direct module and facade', async () => {
    jest.useFakeTimers();
    const analytics = analyticsFixture();
    const rawConfig = visualizationConfigFixture('COLUMN');
    const directConfig = new VisualizationConfiguration(rawConfig);
    directConfig.config.type = 'column';
    const directOptions = buildStandardChartOptions(analytics, directConfig);
    const facade = new D2Visualizer()
      .setId('chart-host')
      .setType('COLUMN')
      .setSelections([])
      .setConfig(rawConfig)
      .setData(analytics);

    await facade.draw();
    jest.runOnlyPendingTimers();

    expect(Highcharts.chart).toHaveBeenLastCalledWith(directOptions);
  });

  it('keeps the legacy focused option builders observable', () => {
    const analytics = analyticsFixture();
    const config = {
      ...visualizationConfigFixture('COLUMN'),
      axes: [],
      xAxisType: ['pe'],
      yAxisType: ['dx'],
      zAxisType: [],
      rangeAxisMinValue: 0,
      rangeAxisMaxValue: 100,
    };

    const options = new ChartObject(analytics as never, config);

    expect(options.chart).toBeDefined();
    expect(ChartXAxis.getAxes(config, analytics.metaData as never)).toEqual([]);
    expect(ChartYAxis.getAxes(config)).toHaveLength(1);
  });
});
