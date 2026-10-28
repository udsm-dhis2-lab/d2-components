import {
  BaseVisualizer,
  ChartType,
  downloadCsv,
  DownloadFormat,
  Visualizer,
} from '../core';
import {
  DefaultHighchartsAdapter,
  HighchartsAdapter,
  ChartInstance,
} from '../highcharts-adapter';
import { buildStandardChartOptions } from '../standard-chart.transform';
import { AnalyticalDataset } from '../analytical-dataset';

/**
 *
 */
export class D2Charts extends BaseVisualizer implements Visualizer {
  #type: ChartType = 'COLUMN';
  #chart?: ChartInstance;
  #drawTimer?: ReturnType<typeof setTimeout>;
  readonly #highcharts: HighchartsAdapter;

  constructor(highcharts: HighchartsAdapter = new DefaultHighchartsAdapter()) {
    super();
    this.#highcharts = highcharts;
  }

  /**
   *
   * @param visualizationType
   * @returns
   */
  setType(type: ChartType) {
    this.#type = type;
    return this;
  }

  /** Supply already normalized analytics without an HTTP client. */
  setAnalyticalDataset(dataset: AnalyticalDataset): this {
    this._data = dataset;
    return this;
  }

  /**
   *
   */
  draw() {
    if (this._config) {
      this._config.config.type = this.#type.toLowerCase();
    }

    const chartObject = buildStandardChartOptions(this._data, this._config);

    this.#drawTimer = setTimeout(() => {
      this.#drawTimer = undefined;
      this.dispose();
      this.#chart = this.#highcharts.create(chartObject);
    }, 20);
  }

  override dispose() {
    if (this.#drawTimer) {
      clearTimeout(this.#drawTimer);
      this.#drawTimer = undefined;
    }
    const chart = this.#chart;
    this.#chart = undefined;
    chart?.destroy();
  }

  /**
   *
   * @param downloadFormat
   */
  override download(downloadFormat: DownloadFormat) {
    const filename = this._config?.title || 'chart-data';
    switch (downloadFormat) {
      case 'PNG':
        this.#chart?.exportChart({ filename, type: 'image/png' }, {});
        break;
      case 'CSV':
        if (!this.#chart) return;
        downloadCsv(filename, this.#chart.getCSV());
        break;
    }
  }
}

/** @deprecated Use D2Charts. */
export { D2Charts as ChartVisualizer };
