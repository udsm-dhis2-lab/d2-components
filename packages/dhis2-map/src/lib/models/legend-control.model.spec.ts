import { LegendControl } from './legend-control.model';

describe('map legend accessibility', () => {
  it('opens on hover, closes on leave, and lets a click pin or close the panel', () => {
    const control = new LegendControl([{ useBackgroundColor: true, label: 'Cases' }], 'Cases legend');
    const container = control.onAdd({});
    const button = container.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Legend');
    expect(button.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    const panel = container.querySelector('[role="group"]') as HTMLElement;
    expect(panel.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    container.dispatchEvent(new MouseEvent('mouseenter'));
    expect(panel.hidden).toBe(false);
    container.dispatchEvent(new MouseEvent('mouseleave'));
    expect(panel.hidden).toBe(true);
    container.dispatchEvent(new MouseEvent('mouseenter'));
    button.click();
    container.dispatchEvent(new MouseEvent('mouseleave'));
    expect(panel.hidden).toBe(false);
    button.click();
    expect(panel.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows multiple layer legends behind one button', () => {
    const control = new LegendControl([{ useBackgroundColor: true, label: 'First' }], 'Thematic');
    const container = control.onAdd({});
    control.addSection([{ useBackgroundColor: true, label: 'Second' }], 'Facilities');
    expect(container.querySelectorAll('button')).toHaveLength(1);
    expect(container.textContent).toContain('Thematic');
    expect(container.textContent).toContain('Facilities');
    expect(container.textContent).toContain('Second');
  });
  it('exposes a single bubble legend and no-data state as text, not HTML', () => {
    const legend = new LegendControl([{ useBackgroundColor: true, backgroundColor: '#558cc0',
      label: 'Values <script>alert(1)</script>' }], 'Bubble counts');
    const container = legend.onAdd({});
    expect(container.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Bubble counts');
    expect(container.textContent).toContain('Values <script>alert(1)</script>');
    expect(container.querySelector('script')).toBeNull();
  });
});
