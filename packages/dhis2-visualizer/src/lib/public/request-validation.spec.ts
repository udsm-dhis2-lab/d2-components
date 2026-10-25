import { D2Visualizer } from '../d2-visualizer';
import {
  validateVisualizationRequest,
  VisualizationRequestValidationError,
} from './request-validation';

describe('visualization request boundary', () => {
  it('returns a discriminated supported request', () => {
    const request = validateVisualizationRequest({
      type: 'PIVOT_TABLE',
      target: { id: 'table-host' },
      configuration: {},
      selections: [{ dimension: 'dx', items: [] }],
    });
    expect(request.type).toBe('PIVOT_TABLE');
  });

  it.each([
    [{}, 'UNSUPPORTED_VISUALIZATION'],
    [{ type: 'MAPBOX', target: { id: 'x' }, configuration: {} }, 'UNSUPPORTED_VISUALIZATION'],
    [{ type: 'MAP', target: { id: '' }, configuration: {} }, 'INVALID_TARGET'],
    [{ type: 'MAP', target: { id: 'x' }, configuration: null }, 'INVALID_CONFIGURATION'],
    [{ type: 'MAP', target: { id: 'x' }, configuration: {}, selections: [{}] }, 'INVALID_SELECTIONS'],
    [{ type: 'TRACKED_ENTITY_LAYER', target: { id: 'x' }, configuration: {} }, 'MISSING_TRACKER_DATA'],
  ])('rejects malformed input with a typed error', (input, code) => {
    expect(() => validateVisualizationRequest(input)).toThrow(
      expect.objectContaining({ code })
    );
  });

  it('rejects before data-source or DOM side effects', async () => {
    const getAnalytics = jest.fn();
    document.body.innerHTML = '<div id="existing">unchanged</div>';
    const visualizer = new D2Visualizer().setDataSource({ getAnalytics });

    await expect(
      visualizer.render({
        type: 'MAP',
        target: { id: '' },
        configuration: {},
      })
    ).rejects.toBeInstanceOf(VisualizationRequestValidationError);
    expect(getAnalytics).not.toHaveBeenCalled();
    expect(document.body.innerHTML).toContain('unchanged');
  });
});
