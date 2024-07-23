import * as Highcharts from 'highcharts';
import {
  BaseVisualizer,
  Visualizer,
} from '../../shared/models/base-visualizer.model';
import { DownloadFormat } from '../../shared/models/download-format.model';
import { VisualizationDownloader } from '../../shared/models/visualization-downloader.model';
import { VisualizationLayout } from '../../shared/models/visualization-layout.model';
import {
  ChartType,
  VisualizationType,
} from '../../shared/models/visualization-type.model';
import { drawChart } from './helpers/draw-chart.helper';

declare const require: any;
const HighchartsGroupedCategories = require('highcharts-grouped-categories')(
    Highcharts
  ),
  HighchartsExporting = require('highcharts/modules/exporting')(Highcharts),
  OfflineHighchartExporting =
    require('highcharts/modules/offline-exporting.js')(Highcharts),
  HighchartsExportData = require('highcharts/modules/export-data')(Highcharts),
  HighchartsMore = require('highcharts/highcharts-more.js')(Highcharts),
  HighchartGauge = require('highcharts/modules/solid-gauge.js')(Highcharts),
  HighchartDrilldown = require('highcharts/modules/drilldown.js')(Highcharts);

/**
 *
 */
export class ChartVisualizer extends BaseVisualizer implements Visualizer {
  private _type: ChartType = 'COLUMN';
  private _layout: VisualizationLayout = new VisualizationLayout();
  private _chart: any;

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
      this._chart = Highcharts.chart(chartObject);
    }, 20);
  }

  /**
   *
   * @param downloadFormat
   */
  override download(downloadFormat: DownloadFormat) {
    const filename = this._config?.title || 'chart-data';
    switch (downloadFormat) {
      case 'PNG':
        this._chart.exportChart({ filename, type: 'image/png' });
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
