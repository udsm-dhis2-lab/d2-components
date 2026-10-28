import * as Highcharts from 'highcharts';
import ExportData from 'highcharts/modules/export-data';
import Exporting from 'highcharts/modules/exporting';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartDrilldown from 'highcharts/modules/drilldown';
import OfflineExporting from 'highcharts/modules/offline-exporting';
import HighchartGauge from 'highcharts/modules/solid-gauge';
import { ChartModuleRequirement } from './chart-model';
import { requiredModulesForOptions } from './highcharts-options.adapter';

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

const moduleInitializers: Record<
  ChartModuleRequirement,
  (engine: typeof Highcharts) => void
> = {
  exporting: Exporting,
  'offline-exporting': OfflineExporting,
  'export-data': ExportData,
  'highcharts-more': HighchartsMore,
  'solid-gauge': HighchartGauge,
  drilldown: HighchartDrilldown,
};
const initialized = new Set<ChartModuleRequirement>();
const ALL_MODULES = Object.keys(moduleInitializers) as ChartModuleRequirement[];

/** Idempotent, requirement-driven initialization with named diagnostics. */
export function initializeHighcharts(
  required: readonly ChartModuleRequirement[] = ALL_MODULES
): void {
  for (const moduleName of required) {
    if (initialized.has(moduleName)) continue;
    const initialize = moduleInitializers[moduleName];
    if (typeof initialize !== 'function') {
      throw new Error(
        `Highcharts module ${moduleName} is unavailable; install a compatible Highcharts 11 package`
      );
    }
    try {
      initialize(Highcharts);
    } catch (error) {
      throw new Error(
        `Failed to initialize Highcharts module ${moduleName}: ${String(error)}`
      );
    }
    initialized.add(moduleName);
  }
}

export class DefaultHighchartsAdapter implements HighchartsAdapter {
  create(options: Highcharts.Options): ChartInstance {
    initializeHighcharts(requiredModulesForOptions(options));
    return Highcharts.chart(options);
  }
}
