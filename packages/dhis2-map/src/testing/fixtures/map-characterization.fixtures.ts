/** Sanitized catalogue-shaped payloads; not a claim that this library renders every family. */
export const mapViews = Object.freeze({
  thematic: { id: 'view-thematic', layer: 'thematic', thematicMapType: 'CHOROPLETH', method: 2,
    classes: 2, colorScale: '#eeeeee,#2266aa', noDataColor: '#cccccc',
    columns: [{ dimension: 'dx', items: [{ id: 'measure-a' }] }],
    rows: [{ dimension: 'ou', items: [{ id: 'ou-a' }, { id: 'ou-b' }] }],
    filters: [{ dimension: 'pe', items: [{ id: '202401' }] }],
    config: JSON.stringify({ noDataLegend: { color: '#cccccc' }, legendDecimalPlaces: 1 }) },
  bubble: { id: 'view-bubble', layer: 'thematic', thematicMapType: 'BUBBLE', method: 10,
    radiusLow: 5, radiusHigh: 30, colorScale: '#2266aa' },
  event: { id: 'view-event', layer: 'event', program: { id: 'program-a' },
    eventCoordinateField: 'psigeometry', eventClustering: true,
    config: JSON.stringify({ countFeaturesWithoutCoordinates: true }) },
  trackedEntity: { id: 'view-tracker', layer: 'trackedEntity', trackedEntityType: { id: 'type-a' },
    programStatus: 'ACTIVE', organisationUnitSelectionMode: 'DESCENDANTS',
    config: JSON.stringify({ periodType: 'program', relationships: null }) },
  facility: { id: 'view-facility', layer: 'facility', organisationUnitGroupSet: { id: 'group-set-a' },
    labels: true, labelTemplate: '{name}' },
  orgUnit: { id: 'view-orgunit', layer: 'orgUnit', organisationUnitColor: '#333333', labels: true },
  external: { id: 'view-external', layer: 'external',
    config: JSON.stringify({ id: 'registered-source-a', type: 'wmsLayer', url: 'https://example.invalid/maps',
      layers: 'example:layer', format: 'image/png', attribution: 'Example' }) },
  earthEngine: { id: 'view-earth', layer: 'earthEngine',
    config: JSON.stringify({ id: 'approved-source-a', band: 'band-a', aggregationType: ['mean'],
      style: { min: 0, max: 10, palette: ['#eeeeee', '#2266aa'] } }) },
});

export function legacySavedMapFixture() {
  return { id: 'map-a', name: 'Sanitized map', longitude: 35, latitude: -6, zoom: 6,
    basemap: JSON.stringify({ id: 'osmLight', opacity: 1, hidden: false }),
    mapViews: [mapViews.thematic, mapViews.facility] };
}

export function modernSavedMapFixture() {
  const { basemap: _legacy, ...rest } = legacySavedMapFixture();
  return { ...rest, basemaps: [{ id: 'osmLight', opacity: 1, hidden: false }] };
}

export function mapGeoFeaturesFixture() {
  return [
    { id: 'ou-a', na: 'Area A', ty: 1, co: '[35,-6]' },
    { id: 'ou-b', na: 'Area B', ty: 1, co: '[36,-7]' },
    { id: 'ou-no-geometry', na: 'No geometry', ty: 1, co: '[]' },
  ];
}

export function mapAnalyticsFixture() {
  return { rows: [
    { ou: { id: 'ou-a' }, value: 12 },
    { ou: { id: 'ou-b' }, value: 0 },
  ] };
}
