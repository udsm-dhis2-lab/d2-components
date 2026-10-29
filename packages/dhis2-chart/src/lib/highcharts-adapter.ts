import * as Highcharts from 'highcharts';
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

function runModule(module: unknown, engine: typeof Highcharts): void {
  const initializer = module && typeof module === 'object' && 'default' in module
    ? (module as { default: unknown }).default : module;
  if (typeof initializer !== 'function') throw new TypeError('Highcharts module has no initializer');
  initializer(engine);
}

const moduleInitializers: Record<
  ChartModuleRequirement,
  (engine: typeof Highcharts) => void
> = {
  exporting: engine => runModule(require('highcharts/modules/exporting'), engine),
  'offline-exporting': engine => runModule(require('highcharts/modules/offline-exporting'), engine),
  'export-data': engine => runModule(require('highcharts/modules/export-data'), engine),
  'highcharts-more': engine => runModule(require('highcharts/highcharts-more'), engine),
  'solid-gauge': engine => runModule(require('highcharts/modules/solid-gauge'), engine),
  drilldown: engine => runModule(require('highcharts/modules/drilldown'), engine),
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
    // The optional exporting modules are loaded above; their declarations are
    // deliberately not imported at runtime by this entry point.
    return Highcharts.chart(options) as unknown as ChartInstance;
  }
}
