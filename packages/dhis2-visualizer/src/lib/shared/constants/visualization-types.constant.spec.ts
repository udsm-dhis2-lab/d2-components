import { VISUALIZATION_TYPES } from './visualization-types.constant';
import { VisualizationDownloadOptionUtil } from '../models/visualization-download-options.model';

describe('scatter card capabilities', () => {
  it('registers scatter as a selectable visualization with chart downloads', () => {
    const scatter = VISUALIZATION_TYPES.find(item => item.type === 'SCATTER');
    expect(scatter?.type).toBe('SCATTER');
    expect(scatter).not.toHaveProperty('hiddenInList', true);
    expect(VisualizationDownloadOptionUtil.get('SCATTER').map(option => option.format))
      .toEqual(['PNG', 'CSV']);
  });
});
