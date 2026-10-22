import {
  AnalyticsQuery,
  AnalyticsResponse,
  VisualizationDataSource,
  VisualizationRenderer,
  VisualizationRequest,
} from '.';

class TestRenderer implements VisualizationRenderer {
  render(_request: VisualizationRequest): void {
    return undefined;
  }
  dispose(): void {
    return undefined;
  }
}

class TestDataSource implements VisualizationDataSource {
  async getAnalytics(_query: AnalyticsQuery): Promise<AnalyticsResponse> {
    return { headers: [], rows: [], metaData: {} };
  }
}

describe('shared extraction contracts', () => {
  it('support renderer implementations without importing a concrete renderer', () => {
    const renderer: VisualizationRenderer = new TestRenderer();
    const request: VisualizationRequest = {
      type: 'COLUMN',
      target: { id: 'host' },
      configuration: {},
    };

    expect(renderer.render(request)).toBeUndefined();
    expect(renderer.dispose()).toBeUndefined();
  });

  it('support deterministic analytics data sources', async () => {
    const source: VisualizationDataSource = new TestDataSource();

    await expect(source.getAnalytics({ selections: [] })).resolves.toEqual({
      headers: [],
      rows: [],
      metaData: {},
    });
  });
});
