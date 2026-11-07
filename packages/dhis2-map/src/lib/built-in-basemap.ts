/** Open, credential-free built-ins from the DHIS2 Maps basemap catalogue. */
export function builtInBasemapStyle(id: string | undefined, opacity = 1):
  string | Record<string, unknown> | undefined {
  switch (id ?? 'osmLight') {
    case 'osmLight':
      return 'https://tiles.openfreemap.org/styles/positron';
    case 'osmDark':
      return 'https://tiles.openfreemap.org/styles/dark';
    case 'osmFiord':
      return 'https://tiles.openfreemap.org/styles/fiord';
    case 'openStreetMap':
      return {version:8,sources:{basemap:{type:'raster',
        tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,
        attribution:'© OpenStreetMap contributors'}},
      layers:[{id:'basemap',type:'raster',source:'basemap',
        paint:{'raster-opacity':opacity}}]};
    default:
      return undefined;
  }
}
