import { analyticsFixture } from '../../../testing/fixtures/visualizer.fixtures';
import { SingleValueVisualizer } from './single-value-visualizer';

describe('SingleValueVisualizer', () => {
  it('renders the summed value, labels and accessible SVG description', () => {
    document.body.innerHTML = '<div id="single-value-host"></div>';

    new SingleValueVisualizer()
      .setId('single-value-host')
      .setData(analyticsFixture())
      .draw();

    const svg = document.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toContain('Value: 42.5');
    expect(svg?.textContent).toContain('Coverage indicator');
    expect(svg?.textContent).toContain('42.5');
  });

  it('renders the current diagnostic when the value header is absent', () => {
    document.body.innerHTML = '<div id="single-value-host"></div>';
    const analytics = analyticsFixture({
      headers: [{ name: 'dx', column: 'Data', valueType: 'TEXT' }],
      rows: [['dx-a']],
    });

    new SingleValueVisualizer()
      .setId('single-value-host')
      .setData(analytics)
      .draw();

    expect(document.body.textContent).toContain('Value column not found');
  });

  it('characterizes wrapping independently of DOM rendering', () => {
    const renderer = new SingleValueVisualizer();

    expect(renderer.wrapText('one two three four', 7, 2)).toEqual([
      'one two',
      'three',
    ]);
  });
});
