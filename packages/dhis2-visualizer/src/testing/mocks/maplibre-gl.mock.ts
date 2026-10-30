export const mapInstance = {
  addControl: jest.fn(),
  addLayer: jest.fn(),
  addSource: jest.fn(),
  fitBounds: jest.fn(),
  on: jest.fn(),
  remove: jest.fn(),
};

export class Map {
  constructor() {
    return mapInstance;
  }
}

export class NavigationControl {}
export class Popup {}
export class Marker {}
