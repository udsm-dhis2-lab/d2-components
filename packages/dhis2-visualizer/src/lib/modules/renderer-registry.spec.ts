import { VisualizationType } from '../shared/models';
import { createDefaultRendererRegistry } from './renderer-registry';

describe('renderer registry', () => {
  it('centrally identifies every supported and legacy-unsupported type', () => {
    const registry = createDefaultRendererRegistry();
    const supported: VisualizationType[] = [
      'CHART',
      'LINE',
      'COLUMN',
      'BAR',
      'DOTTED',
      'PIE',
      'STACKED_BAR',
      'STACKED_COLUMN',
      'AREA',
      'RADAR',
      'SOLIDGAUGE',
      'MAP',
      'REPORT_TABLE',
      'PIVOT_TABLE',
      'SINGLE_VALUE',
      'YEAR_OVER_YEAR_LINE',
      'CUSTOM',
      'TRACKED_ENTITY_LAYER',
    ];

    supported.forEach((type) => expect(registry.supports(type)).toBe(true));
    expect(registry.supports('DICTIONARY')).toBe(false);
    expect(registry.supports('MAPBOX')).toBe(false);
  });
});
