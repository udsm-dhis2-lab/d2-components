import { SingleValueVisualizer } from './single-value-visualizer';
import {
  buildSingleValueViewModel,
  formatSingleValue,
} from './single-value.transform';

const analyticsFixture = (overrides: Record<string, unknown> = {}) => ({
  headers: [{ name: 'dx' }, { name: 'pe' }, { name: 'ou' }, { name: 'value' }],
  rows: [['dx-a', '2024', 'ou-a', '42.5']],
  metaData: {
    dx: ['dx-a'],
    pe: ['2024'],
    ou: ['ou-a'],
    names: {
      'dx-a': 'Coverage indicator',
      '2024': '2024',
      'ou-a': 'Facility A',
    },
  },
  ...overrides,
});

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

  it('calculates and formats a view model without a DOM', () => {
    expect(
      buildSingleValueViewModel(
        analyticsFixture({
          rows: [
            ['dx-a', '2024', 'ou-a', '1000'],
            ['dx-a', '2024', 'ou-a', '0.25'],
          ],
        })
      )
    ).toMatchObject({ value: 1000.25, formattedValue: '1 000.25' });
    expect(formatSingleValue(1.239)).toBe('1.24');
  });

  it('provides an accessible name and description', () => {
    document.body.innerHTML = '<div id="single-value-host"></div>';
    new SingleValueVisualizer()
      .setId('single-value-host')
      .setData(analyticsFixture())
      .draw();
    const svg = document.querySelector('svg');
    expect(svg?.querySelector('title')?.textContent).toBe('Coverage indicator');
    expect(svg?.querySelector('desc')?.textContent).toContain(
      'Filters: 2024 - Facility A'
    );
  });
});
