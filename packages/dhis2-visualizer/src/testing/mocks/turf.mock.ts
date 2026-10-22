export const bbox = jest.fn(() => [0, 0, 10, 10]);
export const featureCollection = jest.fn((features: unknown[]) => ({
  type: 'FeatureCollection',
  features,
}));
export const center = jest.fn();
export const centroid = jest.fn();
