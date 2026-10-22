const blockedFetch = jest.fn(() =>
  Promise.reject(
    new Error('Unexpected real network request in visualizer test')
  )
);

Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  writable: true,
  value: blockedFetch,
});

Object.defineProperty(globalThis.URL, 'createObjectURL', {
  configurable: true,
  writable: true,
  value: jest.fn(() => 'blob:test-download'),
});

Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
  configurable: true,
  writable: true,
  value: jest.fn(),
});

afterEach(() => {
  expect(blockedFetch).not.toHaveBeenCalled();
  document.body.replaceChildren();
  jest.clearAllMocks();
  jest.useRealTimers();
});
