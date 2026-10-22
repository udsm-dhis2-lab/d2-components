import { VisualizationTitle } from './visualization-title.model';

describe('VisualizationTitle', () => {
  it('derives current title and filter subtitle behavior', () => {
    const title = new VisualizationTitle(
      { title: 'Coverage', filters: [{ dimension: 'ou' }] },
      { metaData: { ou: ['ou-a'], names: { 'ou-a': 'Facility A' } } }
    );
    expect(title.getTitle()).toBe('Coverage');
    expect(title.getSubtitle()).toBe('Facility A');
    expect(
      new VisualizationTitle({ hideTitle: true }, {}).getSubtitle()
    ).toBeNull();
  });
});
