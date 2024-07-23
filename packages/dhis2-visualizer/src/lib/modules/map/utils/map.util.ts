import * as mapboxgl from 'mapbox-gl';
import { Legend, LegendSet } from '../models/legend-set.model';
import { MapAnalytics } from '../models/map-analytic.model';
import { MapDrawablePayload } from '../models/map-drawable-payload.model';
import { MapGeoFeature } from '../models/map-geo-feature.model';
import * as _ from 'lodash';
import { D2MapEngine } from './map-engine.util';
import { MapDashboardItem } from '../models/map-dashboard-item.model';
import { MapDashboardExtensionItem } from '../models/map-dashboard-extension.model';
import { GeoFeatureSnapshot } from '../models/map-geofeature-snapshot.model';

export class MapUtil {
  private accessToken: string;
  private antialias: string;
  private attributionControl: boolean;
  private bearing: number;
  private bearingSnap: number;
  private bounds: any;
  private boxZoom: boolean;
  private center: number[];
  private clickTolerance: number;
  private collectResourceTiming: boolean;
  private container: any;
  private cooperativeGestures: boolean;
  private crossSourceCollisions: boolean;
  private customAttribution: any;
  private doubleClickZoom: boolean;
  private dragPan: boolean;
  private dragRotate: boolean;
  private fadeDuration: number;
  private failIfMajorPerformanceCaveat: boolean;
  private fitBoundsOptions: any;
  private hash: boolean;
  private interactive: boolean;
  private keyboard: boolean;
  private locale: any;
  private localFontFamily: boolean;
  private localIdeographFontFamily: string;
  private logoPosition: string;
  private maxBounds: any;
  private maxPitch: number;
  private maxTileCacheSize: any;
  private maxZoom: number;
  private minPitch: number;
  private minTileCacheSize: any;
  private minZoom: number;
  private optimizeForTerrain: boolean;
  private pitch: number;
  private pitchWithRotate: boolean;
  private preserveDrawingBuffer: boolean;
  private projection: string;
  private refreshExpiredTiles: boolean;
  private renderWorldCopies: boolean;
  private scrollZoom: boolean;
  private style: string;
  private testMode: boolean;
  private touchPitch: boolean;
  private touchZoomRotate: boolean;
  private trackResize: boolean;
  private transformRequest: any;
  private zoom: number;
  private showLegend: boolean;
  private showLabel: boolean;
  private showValue: boolean;
  private showBoundary: boolean;
  private showSummary: boolean;
  private showTitle: boolean;
  private type: string;
  private mapDashboardItem: MapDashboardItem | any;
  private mapDashboardExtensionItem: MapDashboardExtensionItem | any;
  private mapAnalytics: MapAnalytics[] | any;
  private geoFeatures: GeoFeatureSnapshot[] | any;
  private legendSets: LegendSet[] | any;

  constructor() {
    /**
     * @description
     */
    this.accessToken =
      'pk.eyJ1IjoiaWJyYWhpbXdpY2thbWEiLCJhIjoiY2txM3Y2bXJ1MTJoZjJ2cXI1ZW9pdGg2biJ9.RZjlqK5FxQkQuFrh5lZm_g';
    this.antialias = '';
    this.attributionControl = false;
    this.bearing = 0;
    this.bearingSnap = 0;
    this.bounds = null;
    this.boxZoom = true;
    this.center = [34.8888, -6.46901];
    this.clickTolerance = 3;
    this.collectResourceTiming = false;
    this.container = '';
    this.cooperativeGestures = false;
    this.crossSourceCollisions = true;
    this.customAttribution = null;
    this.doubleClickZoom = true;
    this.dragPan = true;
    this.dragRotate = true;
    this.fadeDuration = 300;
    this.failIfMajorPerformanceCaveat = false;
    this.fitBoundsOptions = null;
    this.hash = false;
    this.interactive = true;
    this.keyboard = true;
    this.locale = null;
    this.localFontFamily = false;
    this.localIdeographFontFamily = 'sans-serif';
    this.logoPosition = 'bottom-left';
    this.maxBounds = null;
    this.maxPitch = 85;
    this.maxTileCacheSize = null;
    this.maxZoom = 22;
    this.minPitch = 0;
    this.minTileCacheSize = null;
    this.minZoom = 0;
    this.optimizeForTerrain = true;
    this.pitch = 0;
    this.pitchWithRotate = true;
    this.preserveDrawingBuffer = false;
    this.projection = 'mercator';
    this.refreshExpiredTiles = true;
    this.renderWorldCopies = true;
    this.scrollZoom = true;
    this.style = 'mapbox://styles/mapbox/light-v10';
    this.testMode = false;
    this.touchPitch = true;
    this.touchZoomRotate = true;
    this.trackResize = true;
    this.transformRequest = null;
    this.zoom = 5.6;
    this.mapAnalytics = null;
    this.geoFeatures = null;
    this.legendSets = null;
    this.showLegend = false;
    this.showLabel = true;
    this.showValue = false;
    this.showBoundary = true;
    this.showSummary = true;
    this.showTitle = true;
    this.type = 'thematic';
    this.mapDashboardItem = null;
    this.mapDashboardExtensionItem = null;
  }

  /**
   *
   * @returns
   */
  getAccessToken(): string {
    return this.accessToken;
  }

  /**
   *
   * @param accessToken
   * @returns
   *
   * If specified, map will use this token instead of the
   * one defined in mapboxgl.accessToken
   */
  setAccessToken(accessToken: string): MapUtil {
    this.accessToken = accessToken;
    return this;
  }

  /**
   *
   * @returns
   */
  getAntialias(): string {
    return this.antialias;
  }

  /**
   *
   * @param antialias
   * @returns
   *
   * If true , the gl context will be created with MSAA antialiasing ,
   * which can be useful for antialiasing custom layers. This is false
   * by default as a performance optimization.
   */
  setAntialias(antialias: string): MapUtil {
    this.antialias = antialias;
    return this;
  }

  /**
   *
   * @returns
   */
  getAttributionControl(): boolean {
    return this.attributionControl;
  }

  /**
   *
   * @param attributionControl
   * @returns
   *
   * If true , an AttributionControl will be added to the map.
   */
  setAttributionControl(attributionControl: boolean): MapUtil {
    this.attributionControl = attributionControl;
    return this;
  }

  /**
   *
   * @returns
   */
  getBearing(): number {
    return this.bearing;
  }

  /**
   *
   * @param bearing
   * @returns
   *
   * The initial bearing (rotation) of the map, measured in
   * degrees counter-clockwise from north. If bearing is not
   * specified in the constructor options, Mapbox GL JS will
   * look for it in the map's style object. If it is not
   * specified in the style, either, it will default to 0
   */
  setBearing(bearing: number): MapUtil {
    this.bearing = bearing;
    return this;
  }

  /**
   *
   * @returns
   */
  getBearingSnap(): number {
    return this.bearingSnap;
  }

  /**
   *
   * @param bearingSnap
   * @returns
   *
   * The threshold, measured in degrees, that determines
   * when the map's bearing will snap to north. For example,
   * with a bearingSnap of 7, if the user rotates the map
   * within 7 degrees of north, the map will automatically
   * snap to exact north.
   */
  setBearingSnap(bearingSnap: number): MapUtil {
    this.bearingSnap = bearingSnap;
    return this;
  }

  /**
   *
   * @returns
   */
  getBounds(): any {
    return this.bounds;
  }

  /**
   *
   * @param bounds
   * @returns
   *
   * The initial bounds of the map. If bounds
   * is specified, it overrides center and
   * zoom constructor options.
   */
  setBounds(bounds: any): MapUtil {
    this.bounds = bounds;
    return this;
  }

  /**
   *
   * @returns
   */
  getBoxZoom(): boolean {
    return this.boxZoom;
  }

  /**
   *
   * @param boxZoom
   * @returns
   *
   * If true , the "box zoom" interaction is
   * enabled (see BoxZoomHandler)
   */
  setBoxZoom(boxZoom: boolean): MapUtil {
    this.boxZoom = boxZoom;
    return this;
  }

  /**
   *
   * @returns
   */
  getCenter(): number[] {
    return this.center;
  }

  /**
   *
   * @param center
   * @returns
   *
   * The initial geographical centerpoint of the map.
   * If center is not specified in the constructor options,
   * Mapbox GL JS will look for it in the map's style object.
   * If it is not specified in the style, either, it will
   * default to [0, 0] Note: Mapbox GL uses longitude,
   * latitude coordinate order (as opposed to latitude,
   * longitude) to match GeoJSON.
   */
  setCenter(center: number[]): MapUtil {
    this.center = center;
    return this;
  }

  /**
   *
   * @returns
   */
  getClickTolerance(): number {
    return this.clickTolerance;
  }

  /**
   *
   * @param clickTolerance
   * @returns
   *
   * The max number of pixels a user can shift the
   * mouse pointer during a click for it to be
   * considered a valid click (as opposed to a mouse drag)
   */
  setClickTolerance(clickTolerance: number): MapUtil {
    this.clickTolerance = clickTolerance;
    return this;
  }

  /**
   *
   * @returns
   */
  getCollectResourceTiming(): boolean {
    return this.collectResourceTiming;
  }

  /**
   *
   * @param collectResourceTiming
   * @returns
   *
   * If true , Resource Timing API information will
   * be collected for requests made by GeoJSON and
   * Vector Tile web workers (this information is
   * normally inaccessible from the main Javascript thread).
   * Information will be returned in a resourceTiming
   * property of relevant data events
   */
  setCollectResourceTiming(collectResourceTiming: boolean): MapUtil {
    this.collectResourceTiming = collectResourceTiming;
    return this;
  }

  /**
   *
   * @returns
   */
  getContainer(): string {
    return this.container;
  }

  /**
   *
   * @param container
   * @returns
   *
   * The HTML element in which Mapbox GL JS will
   * render the map, or the element's string id .
   * The specified element must have no children.
   */
  setContainer(container: string): MapUtil {
    this.container = container;
    return this;
  }

  /**
   *
   * @returns
   */
  getCooperativeGestures(): boolean {
    return this.cooperativeGestures;
  }

  /**
   *
   * @param cooperativeGestures
   * @returns
   *
   * If true , scroll zoom will require pressing the
   * ctrl or ⌘ key while scrolling to zoom map, and
   * touch pan will require using two fingers while
   * panning to move the map. Touch pitch will require
   * three fingers to activate if enabled.
   */
  setGetCooperativeGestures(cooperativeGestures: boolean): MapUtil {
    this.cooperativeGestures = cooperativeGestures;
    return this;
  }

  /**
   *
   * @returns
   */
  getCrossSourceCollisions(): boolean {
    return this.crossSourceCollisions;
  }

  /**
   *
   * @param crossSourceCollisions
   * @returns
   *
   * If true , symbols from multiple sources can collide with
   * each other during collision detection. If false , collision
   * detection is run separately for the symbols in each source.
   */
  setCrossSourceCollisions(crossSourceCollisions: boolean): MapUtil {
    this.crossSourceCollisions = crossSourceCollisions;
    return this;
  }

  /**
   *
   * @returns
   */
  getCustomAttribution(): string {
    return this.customAttribution;
  }

  /**
   *
   * @param customAttribution
   * @returns
   *
   * String or strings to show in an AttributionControl
   * Only applicable if options.attributionControl is true
   */
  setCustomAttribution(customAttribution: string): MapUtil {
    this.customAttribution = customAttribution;
    return this;
  }

  /**
   *
   * @returns
   */
  getDoubleClickZoom(): boolean {
    return this.doubleClickZoom;
  }

  /**
   *
   * @param doubleClickZoom
   * @returns
   *
   * If true , the "double click to zoom" interaction
   * is enabled (see DoubleClickZoomHandler ).
   */
  setDoubleClickZoom(doubleClickZoom: boolean): MapUtil {
    this.doubleClickZoom = doubleClickZoom;
    return this;
  }

  /**
   *
   * @returns
   */
  getDragPan(): boolean {
    return this.dragPan;
  }

  /**
   *
   * @param dragPan
   * @returns
   *
   * If true , the "drag to pan" interaction is enabled
   * An Object value is passed as options to DragPanHandler#enable
   */
  setDragPan(dragPan: boolean): MapUtil {
    this.dragPan = dragPan;
    return this;
  }

  /**
   *
   * @returns
   */
  getDragRotate(): boolean {
    return this.dragRotate;
  }

  /**
   *
   * @param dragRotate
   * @returns
   *
   * If true , the "drag to rotate" interaction is
   * enabled (see DragRotateHandler ).
   */
  setDragRotate(dragRotate: boolean): MapUtil {
    this.dragRotate = dragRotate;
    return this;
  }

  /**
   *
   * @returns
   */
  getFadeDuration(): number {
    return this.fadeDuration;
  }

  /**
   *
   * @param fadeDuration
   * @returns
   *
   * Controls the duration of the fade-in/fade-out
   * animation for label collisions, in milliseconds.
   * This setting affects all symbol layers. This setting
   * does not affect the duration of runtime styling
   * transitions or raster tile cross-fading.
   */
  setFadeDuration(fadeDuration: number): MapUtil {
    this.fadeDuration = fadeDuration;
    return this;
  }

  /**
   *
   * @returns
   */
  getFailIfMajorPerformanceCaveat(): boolean {
    return this.failIfMajorPerformanceCaveat;
  }

  /**
   *
   * @param failIfMajorPerformanceCaveat
   * @returns
   *
   * If true , map creation will fail if the performance of Mapbox GL JS
   * would be dramatically worse than expected (a software renderer would be used).
   */
  setFailIfMajorPerformanceCaveat(
    failIfMajorPerformanceCaveat: boolean
  ): MapUtil {
    this.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat;
    return this;
  }

  /**
   *
   * @returns
   */
  getFitBoundsOptions(): string {
    return this.fitBoundsOptions;
  }

  /**
   *
   * @param fitBoundsOptions
   * @returns
   *
   * A Map#fitBounds options object to use only when fitting
   * the initial bounds provided above.
   */
  setFitBoundsOptions(fitBoundsOptions: string): MapUtil {
    this.fitBoundsOptions = fitBoundsOptions;
    return this;
  }

  /**
   *
   * @returns
   */
  getHash(): boolean {
    return this.hash;
  }

  /**
   *
   * @param hash
   * @returns
   *
   * If true , the map's position (zoom, center latitude,
   * center longitude, bearing, and pitch) will be synced
   * with the hash fragment of the page's URL.
   * For example, http://path/to/my/page.html#2.59/39.26/53.07/-24.1/60 .
   *  An additional string may optionally be provided to indicate a
   * parameter-styled hash,
   * for example http://path/to/my/page.html#map=2.59/39.26/53.07/-24.1/60&foo=bar ,
   * where foo is a custom parameter and bar is an arbitrary hash distinct from the map hash.
   */
  setHash(hash: boolean): MapUtil {
    this.hash = hash;
    return this;
  }

  /**
   *
   * @returns
   */
  getInteractive(): boolean {
    return this.interactive;
  }

  /**
   *
   * @param interactive
   * @returns
   *
   * If false , no mouse, touch, or keyboard listeners
   * will be attached to the map, so it will not respond
   * to interaction.
   */
  setInteractive(interactive: boolean): MapUtil {
    this.interactive = interactive;
    return this;
  }

  /**
   *
   * @returns
   */
  getKeyboard(): boolean {
    return this.keyboard;
  }

  /**
   *
   * @param keyboard
   * @returns
   *
   * If true , keyboard shortcuts are enabled
   * (see KeyboardHandler ).
   */
  setKeyboard(keyboard: boolean): MapUtil {
    this.keyboard = keyboard;
    return this;
  }

  /**
   *
   * @returns
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   *
   * @param locale
   * @returns
   *
   * A patch to apply to the default localization table
   * for UI strings such as control tooltips. The locale
   * object maps namespaced UI string IDs to translated
   * strings in the target language; see src/ui/default_locale.js
   * for an example with all supported string IDs. The object may
   * specify all UI strings (thereby adding support for a new translation)
   * or only a subset of strings (thereby patching the default translation table).
   */
  setLocale(locale: string): MapUtil {
    this.locale = locale;
    return this;
  }

  /**
   *
   * @returns
   */
  getLocalFontFamily(): boolean {
    return this.localFontFamily;
  }

  /**
   *
   * @param localFontFamily
   * @returns
   *
   * Defines a CSS font-family for locally overriding generation
   * of all glyphs. Font settings from the map's style will be
   * ignored, except for font-weight keywords (light/regular/medium/bold).
   * If set, this option overrides the setting in localIdeographFontFamily.
   */
  setLocalFontFamily(localFontFamily: boolean): MapUtil {
    this.localFontFamily = localFontFamily;
    return this;
  }

  /**
   *
   * @returns
   */
  getLocalIdeographFontFamily(): string {
    return this.localIdeographFontFamily;
  }

  /**
   *
   * @param localIdeographFontFamily
   * @returns
   *
   * Defines a CSS font-family for locally overriding generation
   * of glyphs in the 'CJK Unified Ideographs', 'Hiragana',
   * 'Katakana', 'Hangul Syllables' and 'CJK Symbols and
   * Punctuation' ranges. In these ranges, font settings
   * from the map's style will be ignored, except for font-weight
   * keywords (light/regular/medium/bold). Set to false , to
   * enable font settings from the map's style for these glyph
   * ranges. Note that Mapbox Studio sets this value to false
   * by default. The purpose of this option is to avoid
   * bandwidth-intensive glyph server requests. For an example
   * of this option in use, see Use locally generated ideographs .
   */
  setLocalIdeographFontFamily(localIdeographFontFamily: string): MapUtil {
    this.localIdeographFontFamily = localIdeographFontFamily;
    return this;
  }

  /**
   *
   * @returns
   */
  getLogoPosition(): string {
    return this.logoPosition;
  }

  /**
   *
   * @param logoPosition
   * @returns
   *
   * A string representing the position of the Mapbox
   * wordmark on the map. Valid options are top-left ,
   * top-right , bottom-left , bottom-right .
   */
  setLogoPosition(logoPosition: string): MapUtil {
    this.logoPosition = logoPosition;
    return this;
  }

  /**
   *
   * @returns
   */
  getMaxBounds(): string {
    return this.maxBounds;
  }

  /**
   *
   * @param maxBounds
   * @returns
   *
   * If set, the map will be constrained to the given bounds
   */
  setMaxBounds(maxBounds: string): MapUtil {
    this.maxBounds = maxBounds;
    return this;
  }

  /**
   *
   * @returns
   */
  getMaxPitch(): number {
    return this.maxPitch;
  }

  /**
   *
   * @param maxPitch
   * @returns
   *
   * The maximum pitch of the map (0-85)
   */
  setMaxPitch(maxPitch: number): MapUtil {
    this.maxPitch = maxPitch;
    return this;
  }

  /**
   *
   * @returns
   */
  getMaxTileCacheSize(): number {
    return this.maxTileCacheSize;
  }

  /**
   *
   * @param maxTileCacheSize
   * @returns
   *
   * The maximum number of tiles stored in the tile cache
   * for a given source. If omitted, the cache will be
   * dynamically sized based on the current viewport.
   */
  setMaxTileCacheSize(maxTileCacheSize: number): MapUtil {
    this.maxTileCacheSize = maxTileCacheSize;
    return this;
  }

  /**
   *
   * @returns
   */
  getMaxZoom(): number {
    return this.maxZoom;
  }

  /**
   *
   * @param maxZoom
   * @returns
   *
   * The maximum zoom level of the map (0-24)
   */
  setMaxZoom(maxZoom: number): MapUtil {
    this.maxZoom = maxZoom;
    return this;
  }

  /**
   *
   * @returns
   */
  getMinPitch(): number {
    return this.minPitch;
  }

  /**
   *
   * @param minPitch
   * @returns
   *
   * The minimum pitch of the map (0-85)
   */
  setMinPitch(minPitch: number): MapUtil {
    this.minPitch = minPitch;
    return this;
  }

  /**
   *
   * @returns
   */
  getMinTileCacheSize(): number {
    return this.minTileCacheSize;
  }

  /**
   *
   * @param minTileCacheSize
   * @returns
   *
   * The minimum number of tiles stored in the tile cache
   * for a given source. Larger viewports use more tiles
   * and need larger caches. Larger viewports are more
   * likely to be found on devices with more memory and
   * on pages where the map is more important. If omitted,
   * the cache will be dynamically sized based on the
   * current viewport
   */
  setMinTileCacheSize(minTileCacheSize: number): MapUtil {
    this.minTileCacheSize = minTileCacheSize;
    return this;
  }

  /**
   *
   * @returns
   */
  getMinZoom(): number {
    return this.minZoom;
  }

  /**
   *
   * @param minZoom
   * @returns
   *
   * The minimum zoom level of the map (0-24)
   */
  setMinZoom(minZoom: number): MapUtil {
    this.minZoom = minZoom;
    return this;
  }

  /**
   *
   * @returns
   */
  getOptimizeForTerrain(): boolean {
    return this.optimizeForTerrain;
  }

  /**
   *
   * @param optimizeForTerrain
   * @returns
   *
   * With terrain on, if true , the map will render for
   * performance priority, which may lead to layer reordering
   * allowing to maximize performance (layers that are draped
   * over terrain will be drawn first, including fill, line,
   * background, hillshade and raster). Otherwise, if set to
   * false , the map will always be drawn for layer order priority.
   */
  setOptimizeForTerrain(optimizeForTerrain: boolean): MapUtil {
    this.optimizeForTerrain = optimizeForTerrain;
    return this;
  }

  /**
   *
   * @returns
   */
  getPitch(): number {
    return this.pitch;
  }

  /**
   *
   * @param pitch
   * @returns
   *
   * The initial pitch (tilt) of the map, measured in degrees
   * away from the plane of the screen (0-85). If pitch is not
   * specified in the constructor options, Mapbox GL JS will look
   * for it in the map's style object. If it is not specified in
   * the style, either, it will default to 0
   */
  setPitch(pitch: number): MapUtil {
    this.pitch = pitch;
    return this;
  }

  /**
   *
   * @returns
   */
  getPitchWithRotate(): boolean {
    return this.pitchWithRotate;
  }

  /**
   *
   * @param pitchWithRotate
   * @returns
   *
   * If false , the map's pitch (tilt) control with
   * "drag to rotate" interaction will be disabled
   */
  setPitchWithRotate(pitchWithRotate: boolean): MapUtil {
    this.pitchWithRotate = pitchWithRotate;
    return this;
  }

  /**
   *
   * @returns
   */
  getPreserveDrawingBuffer(): boolean {
    return this.preserveDrawingBuffer;
  }

  /**
   *
   * @param preserveDrawingBuffer
   * @returns
   *
   * If true , the map's canvas can be exported to a PNG
   * using map.getCanvas().toDataURL() . This is false by
   *  default as a performance optimization
   */
  setPreserveDrawingBuffer(preserveDrawingBuffer: boolean): MapUtil {
    this.preserveDrawingBuffer = preserveDrawingBuffer;
    return this;
  }

  /**
   *
   * @returns
   */
  getProjection(): string {
    return this.projection;
  }

  /**
   *
   * @param projection
   * @returns
   *
   * The projection the map should be rendered in. Supported projections are:
   * Albers equal-area conic projection as albers
   * Equal Earth equal-area pseudocylindrical projection as equalEarth
   * Equirectangular (Plate Carrée/WGS84) as equirectangular
   * Lambert Conformal Conic as lambertConformalConic
   * Mercator cylindrical map projection as mercator
   * Natural Earth pseudocylindrical map projection as naturalEarth
   * Winkel Tripel azimuthal map projection as winkelTripel
   * Conic projections such as Albers and Lambert have configurable
   * center and parallels properties that allow developers to define the
   * region in which the projection has minimal distortion; see the example
   * for how to configure these properties.
   */
  setProjection(projection: string): MapUtil {
    this.projection = projection;
    return this;
  }

  /**
   *
   * @returns
   */
  getRefreshExpiredTiles(): boolean {
    return this.refreshExpiredTiles;
  }

  /**
   *
   * @param refreshExpiredTiles
   * @returns
   *
   * If false , the map won't attempt to re-request tiles
   * once they expire per their HTTP cacheControl / expires
   * headers
   */
  setRefreshExpiredTiles(refreshExpiredTiles: boolean): MapUtil {
    this.refreshExpiredTiles = refreshExpiredTiles;
    return this;
  }

  /**
   *
   * @returns
   */
  getRenderWorldCopies(): boolean {
    return this.renderWorldCopies;
  }

  /**
   *
   * @param renderWorldCopies
   * @returns
   *
   * If true , multiple copies of the world will be rendered side by side
   * beyond -180 and 180 degrees longitude. If set to false :
   * When the map is zoomed out far enough that a single representation of
   * the world does not fill the map's entire
   * container, there will be blank space beyond 180 and -180 degrees longitude.
   * Features that cross 180 and -180 degrees longitude will be cut in two
   * (with one portion on the right edge of the
   * map and the other on the left edge of the map) at every zoom level.
   */
  setRenderWorldCopies(renderWorldCopies: boolean): MapUtil {
    this.renderWorldCopies = renderWorldCopies;
    return this;
  }

  /**
   *
   * @returns
   */
  getScrollZoom(): boolean {
    return this.scrollZoom;
  }

  /**
   *
   * @param scrollZoom
   * @returns
   *
   * If true , the "scroll to zoom" interaction is enabled.
   * An Object value is passed as options to ScrollZoomHandler#enable .
   */
  setScrollZoom(scrollZoom: boolean): MapUtil {
    this.scrollZoom = scrollZoom;
    return this;
  }

  /**
   *
   * @returns
   */
  getStyle(): string {
    return this.style;
  }

  /**
   *
   * @param style
   * @returns
   *
   * The map's Mapbox style. This must be an a JSON object conforming
   * to the schema described in the Mapbox Style Specification , or a
   * URL to such JSON. Can accept a null value to allow adding a style
   *  manually.
   * To load a style from the Mapbox API, you can use a URL of the
   * form mapbox://styles/:owner/:style, where :owner is your Mapbox
   * account name and :style is the style ID. You can also use a
   * Mapbox-owned style:
   *
   * mapbox://styles/mapbox/streets-v11
   * mapbox://styles/mapbox/outdoors-v11
   * mapbox://styles/mapbox/light-v10
   * mapbox://styles/mapbox/dark-v10
   * mapbox://styles/mapbox/satellite-v9
   * mapbox://styles/mapbox/satellite-streets-v11
   * mapbox://styles/mapbox/navigation-day-v1
   * mapbox://styles/mapbox/navigation-night-v1.
   *
   * Tilesets hosted with Mapbox can be style-optimized if
   * you append ?optimize=true to the end of your style URL,
   * like mapbox://styles/mapbox/streets-v11?optimize=true.
   * Learn more about style-optimized vector tiles in our
   * API documentation.
   */
  setStyle(style: string): MapUtil {
    if (style === 'streets') {
      this.style = 'mapbox://styles/mapbox/streets-v11';
    } else if (style === 'outdoors') {
      this.style = 'mapbox://styles/mapbox/outdoors-v11';
    } else if (style === 'light') {
      this.style = 'mapbox://styles/mapbox/light-v10';
    } else if (style === 'dark') {
      this.style = 'mapbox://styles/mapbox/dark-v10';
    } else if (style === 'satellite') {
      this.style = 'mapbox://styles/mapbox/satellite-v9';
    } else if (style === 'satellite-streets') {
      this.style = 'mapbox://styles/mapbox/satellite-streets-v11';
    } else if (style === 'navigation-day') {
      this.style = 'mapbox://styles/mapbox/navigation-day-v1';
    } else if (style === 'navigation-night') {
      this.style = 'mapbox://styles/mapbox/navigation-night-v1';
    }
    return this;
  }

  /**
   *
   * @returns
   */
  getTestMode(): boolean {
    return this.testMode;
  }

  /**
   *
   * @param testMode
   * @returns
   *
   * Silences errors and warnings generated due to
   * an invalid accessToken, useful when using the
   * library to write unit tests
   */
  setTestMode(testMode: boolean): MapUtil {
    this.testMode = testMode;
    return this;
  }

  /**
   *
   * @returns
   */
  getTouchPitch(): boolean {
    return this.touchPitch;
  }

  /**
   *
   * @param touchPitch
   * @returns
   *
   * If true , the "drag to pitch" interaction is enabled.
   * An Object value is passed as options to TouchPitchHandler .
   */
  setTouchPitch(touchPitch: boolean): MapUtil {
    this.touchPitch = touchPitch;
    return this;
  }

  /**
   *
   * @returns
   */
  getTouchZoomRotate(): boolean {
    return this.touchZoomRotate;
  }

  /**
   *
   * @param touchZoomRotate
   * @returns
   *
   * If true , the "pinch to rotate and zoom" interaction
   * is enabled. An Object value is passed as options to
   * TouchZoomRotateHandler#enable .
   */
  setTouchZoomRotate(touchZoomRotate: boolean): MapUtil {
    this.touchZoomRotate = touchZoomRotate;
    return this;
  }

  /**
   *
   * @returns
   */
  getTrackResize(): boolean {
    return this.trackResize;
  }

  /**
   *
   * @param trackResize
   * @returns
   *
   * If true , the map will automatically resize when
   * the browser window resizes.
   */
  setTrackResize(trackResize: boolean): MapUtil {
    this.trackResize = trackResize;
    return this;
  }

  /**
   *
   * @returns
   */
  getTransformRequest(): any {
    return this.transformRequest;
  }

  /**
   *
   * @param transformRequest
   * @returns
   *
   * A callback run before the Map makes a request for an
   * external URL. The callback can be used to modify the url,
   * set headers, or set the credentials property for cross-origin
   * requests. Expected to return a RequestParameters object with
   * a url property and optionally headers and credentials properties.
   */
  setTransformRequest(transformRequest: any): MapUtil {
    this.transformRequest = transformRequest;
    return this;
  }

  /**
   *
   * @returns
   */
  getZoom(): number {
    return this.zoom;
  }

  /**
   *
   * @param zoom
   * @returns
   *
   * The initial zoom level of the map. If zoom is not
   * specified in the constructor options, Mapbox GL JS
   * will look for it in the map's style object. If it is
   * not specified in the style, either, it will default to 0
   */
  setZoom(zoom: number): MapUtil {
    this.zoom = zoom;
    return this;
  }

  /**
   *
   * @returns
   */
  getMapAnalytics(): MapAnalytics {
    return this.mapAnalytics;
  }

  /**
   *
   * @param mapAnalytics
   * @returns
   */
  setMapAnalytics(mapAnalytics: MapAnalytics): MapUtil {
    this.mapAnalytics = mapAnalytics;
    return this;
  }

  /**
   *
   * @returns {MapAnalytics}
   */
  getGeofeature(): MapGeoFeature {
    return this.geoFeatures;
  }

  /**
   *
   * @param geoFeature
   * @returns
   */
  setGeofeature(geoFeature: MapGeoFeature): MapUtil {
    this.geoFeatures = geoFeature;
    return this;
  }

  /**
   *
   * @param legendSet
   * @returns
   */
  setLegendSet(legendSet: LegendSet[]): MapUtil {
    this.legendSets = legendSet;
    return this;
  }

  /**
   *
   */
  getLegendSet(): LegendSet[] {
    return this.legendSets;
  }

  /**
   *
   * @param showLegend
   * @returns
   */
  setShowLegend(showLegend: boolean): MapUtil {
    this.showLegend = showLegend;
    return this;
  }

  /**
   *
   * @returns
   */
  getShowLegend(): boolean {
    return this.showLegend;
  }

  /**
   *
   * @param showLabel
   * @returns
   */
  setShowLabel(showLabel: boolean): MapUtil {
    this.showLabel = showLabel;
    this.setShowValue(false);
    return this;
  }

  /**
   *
   * @returns
   */
  getShowLabel(): boolean {
    return this.showLabel;
  }

  /**
   *
   * @param showValue
   * @returns
   */
  setShowValue(showValue: boolean): MapUtil {
    this.showValue = showValue;
    return this;
  }

  /**
   *
   * @returns
   */
  getShowValue(): boolean {
    return this.showValue;
  }

  /**
   *
   * @param showBoundary
   * @returns
   */
  setShowBoundary(showBoundary: boolean): MapUtil {
    this.showBoundary = showBoundary;
    return this;
  }

  /**
   *
   * @returns
   */
  getShowBoundary(): boolean {
    return this.showBoundary;
  }

  /**
   *
   * @param showMapSummary
   * @returns
   */
  setShowMapSummary(showMapSummary: boolean): MapUtil {
    this.showSummary = showMapSummary;
    return this;
  }

  /**
   *
   * @returns
   */
  getShowMapSummary(): boolean {
    return this.showSummary;
  }

  /**
   *
   */

  /**
   *
   * @param showMapTitle
   * @returns
   */
  setShowMapTitle(showMapTitle: boolean): MapUtil {
    this.showTitle = showMapTitle;
    return this;
  }

  /**
   *
   * @returns
   */
  getShowMapTitle(): boolean {
    return this.showTitle;
  }

  /**
   *
   * @param type
   * @returns
   */
  setMapType(type: string): MapUtil {
    this.type = type;
    return this;
  }

  /**
   *
   * @returns
   */
  getType(): string {
    return this.type;
  }

  /**
   *
   * @returns
   */
  getLegendSetContainerId(): string {
    return `${this.container}-legend`;
  }

  /**
   *
   */
  getInfoContainerId(): string {
    return `${this.container}-info`;
  }

  /**
   *
   * @returns
   */
  getMapTitleContainerId(): string {
    return `${this.container}-map-title`;
  }

  /**
   *
   * @param mapDrawableItems
   * @returns
   */
  setMapDashboardItem(mapDrawableItem: MapDashboardItem): MapUtil {
    this.mapDashboardItem = mapDrawableItem;
    return this;
  }

  /**
   *
   * @returns
   */
  getMapDownloadItem(): MapDashboardItem {
    return this.mapDashboardItem;
  }

  /**
   *
   * @param mapDashboardExtensionItem
   * @returns
   */
  setMapDashboardExtensionItem(
    mapDashboardExtensionItem: MapDashboardExtensionItem
  ): MapUtil {
    this.mapDashboardExtensionItem = mapDashboardExtensionItem;
    return this;
  }

  /**
   *
   * @returns
   */
  getMapDashboardExtensionItem(): MapDashboardExtensionItem {
    return this.mapDashboardExtensionItem;
  }

  /**
   *
   */
  draw(): void {
    try {
      // Map Instance
      const map = new mapboxgl.Map(this as unknown as mapboxgl.MapboxOptions);

      // Map Controls Instance
      const navigationControl = new mapboxgl.NavigationControl();

      // Add Navigation Control In Map Instance
      map.addControl(navigationControl);

      //   Get Map Source UIdentifier
      const mapContainerSourceId: string = this.getContainer();

      // Remove Legend Set On Map Start
      const legendSetContainerId = this.getLegendSetContainerId();
      const legendDOMElement = document.getElementById(legendSetContainerId);
      const showMapLegend: boolean = this.getShowLegend();

      if (legendDOMElement && showMapLegend) {
        legendDOMElement.style.display = 'none';
      }

      // On Map Load
      map.on('load', () => {
        /**
         * d2 Map Engine Class
         */
        const d2MapEngine = new D2MapEngine();

        // Get Drawable Map Payload
        const mapDrawablePayloads: MapDrawablePayload[] =
          d2MapEngine.getMapDrawablePayload(
            this.type,
            this,
            this.geoFeatures,
            this.mapAnalytics,
            this.mapDashboardItem,
            this.mapDashboardExtensionItem
          );

        if (mapDrawablePayloads && mapDrawablePayloads.length) {
          for (const mapDrawablePayload of mapDrawablePayloads) {
            if (mapDrawablePayload && mapDrawablePayload.mapType === 'BUBBLE') {
              // Bubble MapBox Map Drawable Item
              d2MapEngine.drawBubbleThematicLayer(
                this,
                d2MapEngine,
                map,
                mapDrawablePayload,
                mapContainerSourceId
              );
            } else {
              // Thematic MapBox Map Drawable Item
              d2MapEngine.drawNormalThematicLayer(
                this,
                d2MapEngine,
                map,
                mapContainerSourceId,
                mapDrawablePayload,
                legendSetContainerId,
                this.getMapTitleContainerId(),
                this.mapAnalytics
              );
            }
          }
        }
      });

      // Implement some methods
    } catch (error) {
      console.error(error);
    }
  }
}
