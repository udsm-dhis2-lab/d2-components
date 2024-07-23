import { D2Visualizer } from './dhis2-visualizer';
describe('Given and instance of visualizer class', () => {
  const visualizer = new D2Visualizer();

  it('should be instantiated', () => {
    expect(visualizer).toBeInstanceOf(D2Visualizer);
  });
});
