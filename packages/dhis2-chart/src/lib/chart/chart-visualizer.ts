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
import { buildStandardChartModel } from '../standard-chart.model';
import { HighchartsOptionsAdapter } from '../highcharts-options.adapter';
import { ChartDefinitionRegistry, standardChartRegistry } from '../chart-definitions';
import { AnalyticalDataset } from '../analytical-dataset';

/**
 *
 */
export class D2Charts extends BaseVisualizer implements Visualizer {
  #type: ChartType | (string & {}) = 'COLUMN';
  #chart?: ChartInstance;
  #drawTimer?: ReturnType<typeof setTimeout>;
  #drawGeneration = 0;
  readonly #highcharts: HighchartsAdapter;
  readonly #registry: ChartDefinitionRegistry;

  constructor(highcharts: HighchartsAdapter = new DefaultHighchartsAdapter(), registry: ChartDefinitionRegistry = standardChartRegistry) {
    super();
    this.#highcharts = highcharts;
    this.#registry = registry;
  }

  /**
   *
   * @param visualizationType
   * @returns
   */
  setType(type: ChartType | (string & {})) {
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

    const chartObject = new HighchartsOptionsAdapter().toOptions(
      buildStandardChartModel(this._data, this._config, this.#registry)
    );

    if (this.#drawTimer) clearTimeout(this.#drawTimer);
    const generation = ++this.#drawGeneration;
    this.#drawTimer = setTimeout(() => {
      if (generation !== this.#drawGeneration) return;
      this.#drawTimer = undefined;
      this.#chart?.destroy();
      this.#chart = this.#highcharts.create(chartObject);
    }, 20);
  }

  override dispose() {
    this.#drawGeneration++;
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
