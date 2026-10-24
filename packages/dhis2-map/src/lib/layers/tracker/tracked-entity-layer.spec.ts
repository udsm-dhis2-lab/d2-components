import { TrackedEntityLayer } from './tracked-entity-layer';

describe('TrackedEntityLayer safe DOM rendering', () => {
  it('renders popup values as text instead of executable markup', () => {
    const attack = '<img src=x onerror=alert(1)>';
    const layer = new TrackedEntityLayer().setProgram({ name: attack });
    const popup = layer.getPopupContent({
      properties: {
        reportAttributes: [{ label: attack, value: attack }],
        attributes: [],
      },
    });

    expect(popup.querySelector('img')).toBeNull();
    expect(popup.textContent).toContain(attack);
  });
});
