import { SingleValueVisualizer as DirectSingleValueVisualizer } from '@iapps/d2-kpi-cards';
import { analyticsFixture } from '../../../testing/fixtures/visualizer.fixtures';
import { SingleValueVisualizer } from './single-value-visualizer';

describe('single-value facade compatibility', () => {
  it('keeps the legacy facade path equivalent to the direct module', () => {
    expect(SingleValueVisualizer).toBe(DirectSingleValueVisualizer);
    document.body.innerHTML = '<div id="single-value-host"></div>';
    new SingleValueVisualizer()
      .setId('single-value-host')
      .setData(analyticsFixture())
      .draw();
    expect(document.querySelector('svg')?.getAttribute('role')).toBe('img');
    expect(document.body.textContent).toContain('42.5');
  });
});
