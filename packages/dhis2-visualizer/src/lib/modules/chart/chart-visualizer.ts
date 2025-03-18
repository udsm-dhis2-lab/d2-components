import * as Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import OfflineExporting from 'highcharts/modules/offline-exporting';
import ExportData from 'highcharts/modules/export-data';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartDrilldown from 'highcharts/modules/drilldown';
import HighchartGauge from 'highcharts/modules/solid-gauge';
import HighchartsGroupedCategories from 'highcharts-grouped-categories';

import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { DownloadFormat } from '../../shared/models/download-format.model';
import { VisualizationDownloader } from '../../shared/models/visualization-downloader.model';
import { VisualizationLayout } from '../../shared/models/visualization-layout.model';
import { ChartType } from '../../shared/models/visualization-type.model';
import { drawChart } from './helpers/draw-chart.helper';

HighchartsGroupedCategories(Highcharts);
Exporting(Highcharts);
OfflineExporting(Highcharts);
ExportData(Highcharts);
HighchartsMore(Highcharts);
HighchartGauge(Highcharts);
HighchartDrilldown(Highcharts);

/**
 *
 */
export class ChartVisualizer extends BaseVisualizer implements Visualizer {
  private _type: ChartType = 'COLUMN';
  private _layout: VisualizationLayout = new VisualizationLayout();
  private _chart!: Highcharts.Chart;

  /**
   *
   * @param visualizationType
   * @returns
   */
  setType(type: ChartType) {
    this._type = type;
    return this;
  }

  /**
   *
   * @param chartType
   * @returns
   */
  setChartType(chartType: string) {
    // this._chart = chartType;
    return this;
  }

  /**
   *
   */
  draw() {
    if (this._config) {
      this._config.config.type = this._type.toLowerCase();
    }

    const chartObject = drawChart(this._data, this._config);

    setTimeout(() => {
      this.dispose();
      this._chart = Highcharts.chart(chartObject);
    }, 20);
  }

  override dispose() {
    if (this._chart) {
      this._chart.destroy();
    }
  }

  /**
   *
   * @param downloadFormat
   */
  override download(downloadFormat: DownloadFormat) {
    const filename = this._config?.title || 'chart-data';
    switch (downloadFormat) {
      case 'PNG':
        this._chart.exportChart({ filename, type: 'image/png' }, {});
        break;
      case 'CSV':
        new VisualizationDownloader()
          .setFilename(this._config?.title || 'chart-data')
          .setCSV(this._chart.getCSV())
          .download();
        break;
    }
  }
}
