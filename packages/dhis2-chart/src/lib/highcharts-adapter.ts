import * as Highcharts from 'highcharts';
import ExportData from 'highcharts/modules/export-data';
import Exporting from 'highcharts/modules/exporting';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartDrilldown from 'highcharts/modules/drilldown';
import OfflineExporting from 'highcharts/modules/offline-exporting';
import HighchartGauge from 'highcharts/modules/solid-gauge';

export interface ChartInstance {
  destroy(): void;
  exportChart(
    options: Record<string, unknown>,
    chartOptions: Record<string, unknown>
  ): void;
  getCSV(): string;
}

export interface HighchartsAdapter {
  create(options: Highcharts.Options): ChartInstance;
}

let initialized = false;

export function initializeHighcharts(): void {
  if (initialized) return;
  Exporting(Highcharts);
  OfflineExporting(Highcharts);
  ExportData(Highcharts);
  HighchartsMore(Highcharts);
  HighchartGauge(Highcharts);
  HighchartDrilldown(Highcharts);
  initialized = true;
}

export class DefaultHighchartsAdapter implements HighchartsAdapter {
  constructor() {
    initializeHighcharts();
  }

  create(options: Highcharts.Options): ChartInstance {
    return Highcharts.chart(options);
  }
}
