import { LegendControl } from './legend-control.model';

describe('map legend accessibility', () => {
  it('exposes a single bubble legend and no-data state as text, not HTML', () => {
    const legend = new LegendControl([{ useBackgroundColor: true, backgroundColor: '#558cc0',
      label: 'Values <script>alert(1)</script>' }], 'Bubble counts');
    const container = legend.onAdd({});
    expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Bubble counts');
    expect(container.textContent).toContain('Values <script>alert(1)</script>');
    expect(container.querySelector('script')).toBeNull();
  });
});
