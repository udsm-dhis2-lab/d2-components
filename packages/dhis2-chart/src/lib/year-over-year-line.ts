import { D2Charts } from './chart/chart-visualizer';
import { ChartDefinitionRegistry, standardChartRegistry } from './chart-definitions';
import { DefaultHighchartsAdapter, HighchartsAdapter } from './highcharts-adapter';

/** @deprecated Use D2Charts.setType('YEAR_OVER_YEAR_LINE').
 * This import is a compatibility wrapper; it has no separate rendering pipeline.
 */
export class YearOverYearLineHighchartsVisualizer extends D2Charts {
  constructor(highcharts: HighchartsAdapter = new DefaultHighchartsAdapter(), registry: ChartDefinitionRegistry = standardChartRegistry) {
    super(highcharts, registry);
    this.setType('YEAR_OVER_YEAR_LINE');
  }
}
