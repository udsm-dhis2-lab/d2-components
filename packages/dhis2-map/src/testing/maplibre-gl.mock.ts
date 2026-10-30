export class Map {
  static latestOptions: unknown;
  constructor(options: unknown) { Map.latestOptions = options; }
  addControl() { return this; }
  remove() { return this; }
}
export class NavigationControl {}
export class Marker {
  constructor(element: unknown) { void element; }
  setLngLat() { return this; }
  setPopup() { return this; }
  addTo() { return this; }
  getElement() { return document.createElement('div'); }
  togglePopup() { return this; }
}
export class Popup { setDOMContent() { return this; } }
