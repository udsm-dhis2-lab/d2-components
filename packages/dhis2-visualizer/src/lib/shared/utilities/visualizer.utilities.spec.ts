import { VisualizerUtil } from './visualizer.utilities';

describe('VisualizerUtil compatibility', () => {
  it('retains dimension labels and number grouping used by legacy consumers', () => {
    expect(
      VisualizerUtil.getDimensionNames(['pe', 'ou'], {
        pe: ['2024'],
        ou: ['ou-a'],
        names: { '2024': '2024', 'ou-a': 'Facility A' },
      })
    ).toEqual(['2024', 'Facility A']);
    expect(VisualizerUtil.toCommaSeparated(1234.5)).toBe('1,234.5');
    expect(VisualizerUtil.toSpaceSeparated(1234.5)).toBe('1 234.5');
  });
});
