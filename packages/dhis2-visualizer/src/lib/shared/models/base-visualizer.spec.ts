import { BaseVisualizer } from './base-visualizer.model';

describe('BaseVisualizer compatibility contract', () => {
  it('retains all fluent facade state setters and optional lifecycle hooks', () => {
    const visualizer = new BaseVisualizer();
    expect(visualizer.setId('host')).toBe(visualizer);
    expect(visualizer.setData({ rows: [] })).toBe(visualizer);
    expect(visualizer.setConfig({ title: 'Title' } as never)).toBe(visualizer);
    expect(visualizer.setSelections([])).toBe(visualizer);
    expect(visualizer.setTrackedEntityInstances([])).toBe(visualizer);
    expect(visualizer.setProgram({ id: 'program' })).toBe(visualizer);
    expect(visualizer.setBaseUrl('/api')).toBe(visualizer);
    expect(visualizer.download('CSV')).toBeUndefined();
    expect(visualizer.dispose()).toBeUndefined();
  });
});
