import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

class ResizeObserverMock implements ResizeObserver {
  constructor(public callback: ResizeObserverCallback) {}

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: ResizeObserverMock,
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  document.body.innerHTML = '';
  delete (window as Window & { d2Web?: unknown }).d2Web;
});
