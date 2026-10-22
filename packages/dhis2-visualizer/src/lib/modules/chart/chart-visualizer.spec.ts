import * as Highcharts from 'highcharts';
import {
  analyticsFixture,
  visualizationConfigFixture,
} from '../../../testing/fixtures/visualizer.fixtures';
import { chartInstance } from '../../../testing/mocks/highcharts.mock';
import { VisualizationConfiguration } from '../../shared/models/visualization-configuration.model';
import { ChartVisualizer } from './chart-visualizer';
import { drawChart } from './helpers/draw-chart.helper';

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
});
