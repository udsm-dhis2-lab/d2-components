import { TrackedEntityLayer } from './tracked-entity-layer';
import type { MapProviderAdapter } from '../../provider-adapter';

describe('TrackedEntityLayer safe DOM rendering', () => {
  it('keeps the direct fluent API while delegating to one D2Maps provider lifecycle', async () => {
    let loaded: (()=>void) | undefined;
    const map = {once:jest.fn((_event,callback)=>{loaded=callback;}),off:jest.fn(),
      addSource:jest.fn(),addLayer:jest.fn(),addControl:jest.fn(),removeControl:jest.fn(),
      fitBounds:jest.fn(),remove:jest.fn()};
    const provider = {createMap:jest.fn(()=>map),createNavigationControl:jest.fn(()=>({})),
      createStyleSwitcherControl:jest.fn(()=>({}))} as unknown as MapProviderAdapter;
    const tracker = new TrackedEntityLayer(provider)
      .setId('tracker-host').setBaseUrl('/dhis')
      .setConfig({id:'tracker-a',trackedEntityType:{id:'EntityType1'},config:'{"periodType":"lastUpdated"}'})
      .setSelections([{dimension:'ou',items:[{id:'OrgUnit0001'}]}])
      .setTrackedEntityInstances([{orgUnit:'OrgUnit0001',geometry:{type:'Point',coordinates:[35,-6]}}]);
    const drawing = tracker.draw();
    for (let attempt = 0; attempt < 10 && !loaded; attempt++) await Promise.resolve();
    if (!loaded) await drawing;
    expect(loaded).toBeDefined();
    loaded?.();
    await drawing;
    expect(provider.createMap).toHaveBeenCalledTimes(1);
    expect(map.addLayer).toHaveBeenCalledWith(expect.objectContaining({id:'tracker-a',type:'circle'}));
    expect(JSON.stringify(map.addSource.mock.calls)).not.toContain('OrgUnit0001');
    tracker.dispose();
    expect(map.remove).toHaveBeenCalledTimes(1);
  });
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
