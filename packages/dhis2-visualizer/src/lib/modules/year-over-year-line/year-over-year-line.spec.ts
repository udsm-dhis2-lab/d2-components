import { D2Visualizer } from '../../d2-visualizer';
import * as Highcharts from 'highcharts';
import {
  selectionsFixture,
  visualizationConfigFixture,
} from '../../../testing/fixtures/visualizer.fixtures';
import { VisualizationConfiguration } from '../../shared/models';
import { YearOverYearLineHighchartsVisualizer } from './year-over-year-line';
import { VisualizationDataSource } from '@iapps/d2-charts';

interface D2TestWindow extends Window {
  d2Web: {
    httpInstance: { get: jest.Mock };
  };
}

describe('year-over-year analytics characterization', () => {
  it('cancels pending chart creation when disposed', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="visualization-host"></div>';
    const renderer = new YearOverYearLineHighchartsVisualizer()
      .setId('visualization-host')
      .setConfig(
        new VisualizationConfiguration(
          visualizationConfigFixture('YEAR_OVER_YEAR_LINE')
        )
      )
      .setData({
        axis: { categories: ['W1'] },
        series: [{ name: '2024', data: [1] }],
      }) as YearOverYearLineHighchartsVisualizer;

    renderer.draw();
    renderer.dispose();
    jest.runOnlyPendingTimers();

    expect(Highcharts.chart).not.toHaveBeenCalled();
  });

  it('aligns each year to the latest weekly metadata axis', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({
        data: { metaData: { dimensions: { pe: ['2023', '2024'] } } },
      })
      .mockResolvedValueOnce({
        data: {
          metaData: {
            dimensions: { pe: ['2023W1', '2023W2'] },
            items: {
              '2023W1': { name: 'Week 1 2023' },
              '2023W2': { name: 'Week 2 2023' },
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          headers: [{ name: 'pe' }, { name: 'value' }],
          rows: [
            ['2023W1', '10'],
            ['2023W2', '20'],
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          metaData: {
            dimensions: { pe: ['2024W1', '2024W2'] },
            items: {
              '2024W1': { name: 'Week 1 2024' },
              '2024W2': { name: 'Week 2 2024' },
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          headers: [{ name: 'pe' }, { name: 'value' }],
          rows: [['2024W1', '30']],
        },
      });
    (window as unknown as D2TestWindow).d2Web = { httpInstance: { get } };
    const visualizer = new D2Visualizer()
      .setType('YEAR_OVER_YEAR_LINE')
      .setSelections(selectionsFixture())
      .setConfig(
        visualizationConfigFixture('YEAR_OVER_YEAR_LINE', {
          relativePeriodDate: '2024-06-01',
        })
      );

    const result = await (
      visualizer as unknown as {
        _getDataYearOverYearLine(): Promise<{
          _data: {
            axis: { categories: string[] };
            series: Array<{ name: string; data: number[] }>;
          };
        }>;
      }
    )._getDataYearOverYearLine();

    expect(get).toHaveBeenCalledTimes(5);
    expect(result._data.axis.categories).toEqual([
      'Week 1 2024',
      'Week 2 2024',
    ]);
    expect(result._data.series).toEqual([
      { name: '2023', year: 2023, data: [10, 20] },
      { name: '2024', year: 2024, data: [30, 0] },
    ]);
  });

  it('returns the current structured error when every per-year request fails', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({
        data: { metaData: { dimensions: { pe: ['2024'] } } },
      })
      .mockRejectedValue(new Error('offline'));
    (window as unknown as D2TestWindow).d2Web = { httpInstance: { get } };
    const visualizer = new D2Visualizer()
      .setType('YEAR_OVER_YEAR_LINE')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('YEAR_OVER_YEAR_LINE'));

    const result = await (
      visualizer as unknown as {
        _getDataYearOverYearLine(): Promise<{
          _data: { error: boolean; message: string };
        }>;
      }
    )._getDataYearOverYearLine();

    expect(result._data.error).toBe(true);
    expect(result._data.message).toContain(
      'All per-year analytics calls failed'
    );
  });

  it('uses an explicitly supplied shared data source', async () => {
    const getAnalytics = jest
      .fn()
      .mockResolvedValueOnce({
        headers: [],
        rows: [],
        metaData: { dimensions: { pe: ['2024'] } },
      })
      .mockResolvedValueOnce({
        headers: [],
        rows: [],
        metaData: {
          dimensions: { pe: ['2024W1'] },
          items: { '2024W1': { name: 'Week 1' } },
        },
      })
      .mockResolvedValueOnce({
        headers: [{ name: 'pe' }, { name: 'value' }],
        rows: [['2024W1', '9']],
        metaData: {},
      });
    const source = { getAnalytics } as VisualizationDataSource;
    const visualizer = new D2Visualizer()
      .setType('YEAR_OVER_YEAR_LINE')
      .setSelections(selectionsFixture())
      .setConfig(visualizationConfigFixture('YEAR_OVER_YEAR_LINE'));

    expect(visualizer.setDataSource(source)).toBe(visualizer);
    const result = await (
      visualizer as unknown as {
        _getDataYearOverYearLine(): Promise<{ _data: { series: unknown[] } }>;
      }
    )._getDataYearOverYearLine();

    expect(getAnalytics).toHaveBeenCalledTimes(3);
    expect(result._data.series).toEqual([
      { name: '2024', year: 2024, data: [9] },
    ]);
  });

  it('preserves the missing-data error without issuing requests', async () => {
    const getAnalytics = jest.fn();
    const visualizer = new D2Visualizer()
      .setType('YEAR_OVER_YEAR_LINE')
      .setSelections([])
      .setConfig(
        visualizationConfigFixture('YEAR_OVER_YEAR_LINE', {
          filters: [],
          rows: [],
        })
      )
      .setDataSource({ getAnalytics } as VisualizationDataSource);

    const result = await (
      visualizer as unknown as {
        _getDataYearOverYearLine(): Promise<{
          _data: { error: boolean; message: string };
        }>;
      }
    )._getDataYearOverYearLine();

    expect(result._data.error).toBe(true);
    expect(result._data.message).toContain('Missing dx');
    expect(getAnalytics).not.toHaveBeenCalled();
  });
});
