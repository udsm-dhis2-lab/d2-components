import { TableUtil as DirectTableUtil } from '@iapps/d2-pivots';
import { TableUtil } from './utils/table.util';

describe('table facade compatibility', () => {
  it('keeps the legacy facade path equivalent to the direct module', () => {
    expect(TableUtil).toBe(DirectTableUtil);
    const renderer = new TableUtil();
    const analytics = { rows: [['1']] };
    const config = { id: 'table-host' };
    expect(renderer.setTableAnalytics(analytics as never)).toBe(renderer);
    expect(renderer.setTableConfiguration(config as never)).toBe(renderer);
    expect(renderer.getTableAnalytics()).toBe(analytics);
    expect(renderer.getTableConfiguration()).toBe(config);
  });
});
