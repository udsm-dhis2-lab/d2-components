import React from 'react';
import {
  InputField,
  Field,
  Button,
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  NoticeBox,
} from '@dhis2/ui';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  GeoJSON as LeafletGeoJSON,
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

/** ---------------- Types ---------------- */

export type CoordinateAccuracySource = 'MANUAL' | 'DEVICE' | 'UNKNOWN';

export interface CoordinatePickerGeoConfig {
  /**
   * Optional boundary area.
   * Can arrive as Polygon/MultiPolygon, Feature/FeatureCollection, or JSON string.
   */
  allowedAreaGeoJson?: GeoJSON.Polygon | GeoJSON.MultiPolygon | any | null;

  allowedAreaName?: string;
  requireWithinArea?: boolean;

  captureAccuracy?: boolean; // default true
  accuracyKmValue?: number | null;
  onAccuracyKmChange?: (km: number | null) => void;

  accuracySource?: CoordinateAccuracySource;
  onAccuracySourceChange?: (src: CoordinateAccuracySource) => void;

  maxAccuracyKm?: number; // default 50

  outsideAreaPolicyText?: string;

  onOutsideAreaSelected?: (info: {
    lat: number;
    lng: number;
    allowedAreaName?: string;
    requireWithinArea: boolean;
    accuracyKm?: number | null;
  }) => void;
}

interface CoordinatePickerFieldProps {
  label?: string;
  name: string;
  value?: string | null; // "[lon,lat]" or "lat, lon"
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  validationText?: string;
  onChange: (value: string | null) => void;
  onBlur?: () => void;

  geoConfig?: CoordinatePickerGeoConfig;
}

interface ParsedCoordinate {
  lat: number;
  lng: number;
}

/** Default focus: Zanzibar (Unguja) */
const DEFAULT_CENTER: LatLngExpression = [-6.1659, 39.2026];
const DEFAULT_ZOOM = 8;

/** ---------------- Coordinate parsing/format ---------------- */

function normalizeCoordinate(
  lat: number,
  lng: number
): ParsedCoordinate | null {
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
}

function parseCoordinate(value?: string | null): ParsedCoordinate | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let lat: number;
  let lng: number;

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const arr = JSON.parse(trimmed);
      if (!Array.isArray(arr) || arr.length < 2) return null;
      lng = Number(arr[0]);
      lat = Number(arr[1]);
    } catch {
      return null;
    }
  } else {
    const parts = trimmed.split(',').map((p) => p.trim());
    if (parts.length !== 2) return null;
    lat = Number(parts[0]);
    lng = Number(parts[1]);
  }

  return normalizeCoordinate(lat, lng);
}

function formatCoordinate(coordinate: ParsedCoordinate | null): string | null {
  if (!coordinate) return null;
  return `[${coordinate.lng.toFixed(6)},${coordinate.lat.toFixed(6)}]`;
}

/** ---------------- Geo helpers ---------------- */

type AllowedAreaInput =
  | GeoJSON.Polygon
  | GeoJSON.MultiPolygon
  | GeoJSON.Feature
  | GeoJSON.FeatureCollection
  | GeoJSON.Geometry
  | string
  | null
  | undefined;

function toNumber(v: unknown): number | null {
  const n =
    typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : Number.NaN;
  return Number.isFinite(n) ? n : null;
}

function looksLikeLatLngPair(a: number, b: number): boolean {
  return a >= -90 && a <= 90 && b >= -180 && b <= 180;
}

function looksLikeLngLatPair(a: number, b: number): boolean {
  return a >= -180 && a <= 180 && b >= -90 && b <= 90;
}

function normalizeLngLatPair(pair: unknown): [number, number] | null {
  if (!Array.isArray(pair) || pair.length < 2) return null;

  const a = toNumber(pair[0]);
  const b = toNumber(pair[1]);
  if (a == null || b == null) return null;

  // GeoJSON expected: [lng, lat]
  if (looksLikeLngLatPair(a, b)) return [a, b];

  // If provided as [lat, lng], swap
  if (looksLikeLatLngPair(a, b)) return [b, a];

  return null;
}

function ensureClosedRing(ring: number[][]): number[][] {
  if (ring.length < 3) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, [first[0], first[1]]];
}

/**
 * ✅ FIXED: supports BOTH shapes:
 *  - proper GeoJSON Polygon coords: [ [ [lng,lat], ... ] , [hole], ... ]
 *  - single-ring coords (your payload): [ [lng,lat], [lng,lat], ... ]
 */
function sanitizePolygonCoordinates(coords: any): number[][][] | null {
  if (!Array.isArray(coords) || coords.length === 0) return null;

  const isSingleRing =
    Array.isArray(coords[0]) &&
    typeof coords[0][0] === 'number' &&
    typeof coords[0][1] === 'number';

  const ringsCandidate: any[] = isSingleRing ? [coords] : coords;

  const cleanRings: number[][][] = [];

  for (const ring of ringsCandidate) {
    if (!Array.isArray(ring) || ring.length < 3) continue;

    const cleanRing: number[][] = [];
    for (const pt of ring) {
      const pair = normalizeLngLatPair(pt);
      if (pair) cleanRing.push(pair);
    }

    if (cleanRing.length < 3) continue;
    cleanRings.push(ensureClosedRing(cleanRing));
  }

  return cleanRings.length ? cleanRings : null;
}

function sanitizeMultiPolygonCoordinates(coords: any): number[][][][] | null {
  if (!Array.isArray(coords) || coords.length === 0) return null;

  const polys: number[][][][] = [];
  for (const poly of coords) {
    const cleaned = sanitizePolygonCoordinates(poly);
    if (cleaned) polys.push(cleaned);
  }

  return polys.length ? polys : null;
}

/**
 * ✅ FIXED: strict unwrap so we only return real GeoJSON geometry objects.
 */
function unwrapToGeometry(input: AllowedAreaInput): GeoJSON.Geometry | null {
  if (!input) return null;

  if (typeof input === 'string') {
    try {
      return unwrapToGeometry(JSON.parse(input));
    } catch {
      return null;
    }
  }

  if ((input as any).type === 'FeatureCollection') {
    const fc = input as GeoJSON.FeatureCollection;
    const first = fc.features?.find((f) => !!f?.geometry);
    return first?.geometry ?? null;
  }

  if ((input as any).type === 'Feature') {
    return (input as GeoJSON.Feature).geometry ?? null;
  }

  const maybeType = (input as any).type;
  const maybeCoords = (input as any).coordinates;

  const isGeometryLike =
    (maybeType === 'Polygon' || maybeType === 'MultiPolygon') &&
    Array.isArray(maybeCoords);

  if (isGeometryLike) return input as GeoJSON.Geometry;

  return null;
}

function sanitizeAllowedArea(
  input: AllowedAreaInput
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null {
  const geom = unwrapToGeometry(input);
  if (!geom) return null;

  if (geom.type === 'Polygon') {
    const coordsRaw = (geom as any).coordinates;

    // Optional debug (safe to remove):
    // console.log('Polygon coords shape:', {
    //   isArray0: Array.isArray(coordsRaw),
    //   isArray1: Array.isArray(coordsRaw?.[0]),
    //   isArray2: Array.isArray(coordsRaw?.[0]?.[0]),
    //   sample0: coordsRaw?.[0],
    // });

    const coords = sanitizePolygonCoordinates(coordsRaw);
    if (!coords) return null;
    return { type: 'Polygon', coordinates: coords } as GeoJSON.Polygon;
  }

  if (geom.type === 'MultiPolygon') {
    const coords = sanitizeMultiPolygonCoordinates((geom as any).coordinates);
    if (!coords) return null;
    return {
      type: 'MultiPolygon',
      coordinates: coords,
    } as GeoJSON.MultiPolygon;
  }

  return null;
}

/**
 * Point-in-polygon (ray casting).
 * Works with [lng, lat] coordinates.
 */
function isPointInsideGeoJsonArea(
  point: { lat: number; lng: number },
  area: GeoJSON.Polygon | GeoJSON.MultiPolygon | null | undefined
): boolean {
  if (!area) return true;

  const pt: [number, number] = [point.lng, point.lat];

  const inRing = (ring: number[][], p: [number, number]) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0],
        yi = ring[i][1];
      const xj = ring[j][0],
        yj = ring[j][1];

      const intersect =
        yi > p[1] !== yj > p[1] &&
        p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi + 0.0) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  };

  const inPolygon = (polyCoords: number[][][]) => {
    const [outer, ...holes] = polyCoords;
    if (!outer || outer.length < 3) return false;
    if (!inRing(outer as any, pt)) return false;
    for (const hole of holes) {
      if (hole && hole.length >= 3 && inRing(hole as any, pt)) return false;
    }
    return true;
  };

  if (area.type === 'Polygon') return inPolygon(area.coordinates as any);

  for (const poly of area.coordinates as any) {
    if (inPolygon(poly)) return true;
  }
  return false;
}

function metersToKmRadius(m?: number): number | null {
  if (typeof m !== 'number' || Number.isNaN(m) || m <= 0) return null;
  return Math.max(0.01, m / 1000);
}

/** ---------------- Leaflet helpers ---------------- */

interface MapClickListenerProps {
  disabled?: boolean;
  onCoordinateSelected: (coordinate: ParsedCoordinate) => void;
}

const MapClickListener: React.FC<MapClickListenerProps> = ({
  disabled,
  onCoordinateSelected,
}) => {
  useMapEvents({
    click(event) {
      if (disabled) return;
      const { lat, lng } = event.latlng;
      onCoordinateSelected({ lat, lng });
    },
  });
  return null;
};

const RecenterOnCoordinate: React.FC<{
  coordinate: ParsedCoordinate | null;
}> = ({ coordinate }) => {
  const map = useMap();

  React.useEffect(() => {
    if (coordinate) {
      map.flyTo([coordinate.lat, coordinate.lng], map.getZoom(), {
        duration: 0.4,
      });
    }
  }, [coordinate, map]);

  return null;
};

/** Auto-fits the map to the polygon bounds when loaded */
const AutoFitToBoundary: React.FC<{ boundary: any }> = ({ boundary }) => {
  const map = useMap();

  React.useEffect(() => {
    if (boundary) {
      try {
        const layer = (window as any).L?.geoJSON?.(boundary);
        if (layer) {
          map.fitBounds(layer.getBounds(), { padding: [20, 20] });
        }
      } catch (e) {
        console.warn('Auto-fit failed:', e);
      }
    }
  }, [boundary, map]);

  return null;
};

const CoordinateMapContainer = MapContainer as any;
type Dhis2InputChangeEvent = { value: string };

/** ---------------- Component ---------------- */

export const CoordinatePickerField: React.FC<CoordinatePickerFieldProps> = ({
  label,
  name,
  value,
  required,
  disabled,
  error,
  validationText,
  onChange,
  onBlur,
  geoConfig,
}) => {
  const parsedCoordinate = React.useMemo(() => parseCoordinate(value), [value]);

  const rawAllowedArea = geoConfig?.allowedAreaGeoJson ?? null;

  // ✅ never pass raw geojson to Leaflet
  const safeAllowedAreaGeoJson = React.useMemo(
    () => sanitizeAllowedArea(rawAllowedArea as AllowedAreaInput),
    [rawAllowedArea]
  );

  const allowedAreaName = geoConfig?.allowedAreaName;
  const requireWithinArea = geoConfig?.requireWithinArea ?? false;

  const captureAccuracy = geoConfig?.captureAccuracy ?? true;
  const accuracyKmValue = geoConfig?.accuracyKmValue ?? null;
  const onAccuracyKmChange = geoConfig?.onAccuracyKmChange;
  const accuracySource = geoConfig?.accuracySource ?? 'UNKNOWN';
  const onAccuracySourceChange = geoConfig?.onAccuracySourceChange;
  const maxAccuracyKm = geoConfig?.maxAccuracyKm ?? 50;

  const outsideAreaPolicyText = geoConfig?.outsideAreaPolicyText;
  const onOutsideAreaSelected = geoConfig?.onOutsideAreaSelected;

  const [latitudeInput, setLatitudeInput] = React.useState<string>(
    parsedCoordinate ? String(parsedCoordinate.lat) : ''
  );
  const [longitudeInput, setLongitudeInput] = React.useState<string>(
    parsedCoordinate ? String(parsedCoordinate.lng) : ''
  );

  const [validationMessage, setValidationMessage] = React.useState<
    string | null
  >(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = React.useState(false);

  const [pendingCoordinate, setPendingCoordinate] =
    React.useState<ParsedCoordinate | null>(parsedCoordinate ?? null);

  const [mapCenterPosition, setMapCenterPosition] =
    React.useState<LatLngExpression>(
      parsedCoordinate
        ? [parsedCoordinate.lat, parsedCoordinate.lng]
        : DEFAULT_CENTER
    );

  const [outsideAreaAcknowledged, setOutsideAreaAcknowledged] =
    React.useState(false);

  React.useEffect(() => {
    const updated = parseCoordinate(value);
    if (updated) {
      setLatitudeInput(String(updated.lat));
      setLongitudeInput(String(updated.lng));
      setPendingCoordinate(updated);
      setMapCenterPosition([updated.lat, updated.lng]);
    } else {
      setLatitudeInput('');
      setLongitudeInput('');
      setPendingCoordinate(null);
      setMapCenterPosition(DEFAULT_CENTER);
    }
    setOutsideAreaAcknowledged(false);
  }, [value]);

  const currentCoordinate: ParsedCoordinate | null = React.useMemo(() => {
    const lat = Number(latitudeInput);
    const lng = Number(longitudeInput);
    return normalizeCoordinate(lat, lng);
  }, [latitudeInput, longitudeInput]);

  const markerCoordinate = pendingCoordinate || currentCoordinate || null;

  const allowedAreaDisplayName =
    allowedAreaName ?? 'the required boundary area';

  const policyText =
    outsideAreaPolicyText ??
    `The selected point is outside ${allowedAreaDisplayName}. 
Saving an out-of-area location can lead to incorrect case assignment, wrong administrative-unit reporting, and unreliable spatial analysis (maps, coverage, response targeting). 
Only proceed if you are certain this is intentional and acceptable according to your reporting guidelines.`;

  const isOutsideAllowedArea = React.useMemo(() => {
    if (!markerCoordinate) return false;
    if (!safeAllowedAreaGeoJson) return false;
    return !isPointInsideGeoJsonArea(markerCoordinate, safeAllowedAreaGeoJson);
  }, [markerCoordinate, safeAllowedAreaGeoJson]);

  const applyCoordinateChange = React.useCallback(
    (coordinate: ParsedCoordinate | null) => {
      if (!coordinate) {
        setLatitudeInput('');
        setLongitudeInput('');
        setValidationMessage(null);
        onChange(null);
        return;
      }

      const normalized = normalizeCoordinate(coordinate.lat, coordinate.lng);
      if (!normalized) {
        setValidationMessage(
          'Please enter a valid coordinate within the allowed latitude/longitude range.'
        );
        onChange(null);
        return;
      }

      setLatitudeInput(String(normalized.lat));
      setLongitudeInput(String(normalized.lng));
      setValidationMessage(null);

      onChange(formatCoordinate(normalized));
    },
    [onChange]
  );

  const validateLat = (raw: string): string | null => {
    if (raw === '') return null;
    const n = Number(raw);
    if (Number.isNaN(n)) return 'Latitude must be a number.';
    if (n < -90 || n > 90) return 'Latitude must be between -90 and 90.';
    return null;
  };

  const validateLng = (raw: string): string | null => {
    if (raw === '') return null;
    const n = Number(raw);
    if (Number.isNaN(n)) return 'Longitude must be a number.';
    if (n < -180 || n > 180) return 'Longitude must be between -180 and 180.';
    return null;
  };

  const handleLatitudeChange = (event: Dhis2InputChangeEvent) => {
    const raw = event.value;
    setLatitudeInput(raw);
    setOutsideAreaAcknowledged(false);

    const latErr = validateLat(raw);
    if (latErr) {
      setValidationMessage(latErr);
      return;
    }

    if (raw === '' || longitudeInput === '') {
      applyCoordinateChange(null);
      return;
    }

    const lngErr = validateLng(longitudeInput);
    if (lngErr) {
      setValidationMessage(lngErr);
      return;
    }

    const updated = { lat: Number(raw), lng: Number(longitudeInput) };
    setPendingCoordinate(updated);
    applyCoordinateChange(updated);
  };

  const handleLongitudeChange = (event: Dhis2InputChangeEvent) => {
    const raw = event.value;
    setLongitudeInput(raw);
    setOutsideAreaAcknowledged(false);

    const lngErr = validateLng(raw);
    if (lngErr) {
      setValidationMessage(lngErr);
      return;
    }

    if (latitudeInput === '' || raw === '') {
      applyCoordinateChange(null);
      return;
    }

    const latErr = validateLat(latitudeInput);
    if (latErr) {
      setValidationMessage(latErr);
      return;
    }

    const updated = { lat: Number(latitudeInput), lng: Number(raw) };
    setPendingCoordinate(updated);
    applyCoordinateChange(updated);
  };

  const handleAccuracyChange = (event: Dhis2InputChangeEvent) => {
    const raw = event.value.trim();
    if (!onAccuracyKmChange) return;

    if (raw === '') {
      onAccuracyKmChange(null);
      onAccuracySourceChange?.('MANUAL');
      return;
    }

    const n = Number(raw);
    if (Number.isNaN(n) || n <= 0) {
      setValidationMessage('Accuracy radius must be a positive number (KM).');
      return;
    }

    if (n > maxAccuracyKm) {
      setValidationMessage(
        `Accuracy radius should not exceed ${maxAccuracyKm} km.`
      );
      return;
    }

    setValidationMessage(null);
    onAccuracyKmChange(n);
    onAccuracySourceChange?.('MANUAL');
  };

  const handleOpenMapDialog = () => {
    if (disabled) return;

    const base = currentCoordinate ?? pendingCoordinate ?? null;
    if (base) {
      setPendingCoordinate(base);
      setMapCenterPosition([base.lat, base.lng]);
    } else {
      setMapCenterPosition(DEFAULT_CENTER);
    }

    setIsMapDialogOpen(true);
    setOutsideAreaAcknowledged(false);

    if (!base && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinate = normalizeCoordinate(
            position.coords.latitude,
            position.coords.longitude
          );

          const km = metersToKmRadius(position.coords.accuracy);
          if (captureAccuracy && km != null && onAccuracyKmChange) {
            const boundedKm = Math.min(km, maxAccuracyKm);
            onAccuracyKmChange(boundedKm);
            onAccuracySourceChange?.('DEVICE');
          }

          if (coordinate) {
            setPendingCoordinate(coordinate);
            setMapCenterPosition([coordinate.lat, coordinate.lng]);
          } else {
            setMapCenterPosition(DEFAULT_CENTER);
          }
        },
        () => {
          setValidationMessage(
            (prev) =>
              prev ??
              'We could not detect your location. Please move the map and click on the correct place.'
          );
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    }
  };

  const handleCloseMapDialog = () => {
    setIsMapDialogOpen(false);
    setOutsideAreaAcknowledged(false);
  };

  const handleMapClick = (coordinate: ParsedCoordinate) => {
    const normalized = normalizeCoordinate(coordinate.lat, coordinate.lng);
    if (!normalized) return;

    setPendingCoordinate(normalized);
    setMapCenterPosition([normalized.lat, normalized.lng]);
    setOutsideAreaAcknowledged(false);
  };

  const canConfirm =
    !!pendingCoordinate &&
    (!isOutsideAllowedArea || outsideAreaAcknowledged) &&
    (!requireWithinArea || !isOutsideAllowedArea);

  const handleConfirmFromMap = () => {
    if (!pendingCoordinate) return;

    const boundary = safeAllowedAreaGeoJson;
    const outside = boundary
      ? !isPointInsideGeoJsonArea(pendingCoordinate, boundary)
      : false;

    if (outside) {
      onOutsideAreaSelected?.({
        lat: pendingCoordinate.lat,
        lng: pendingCoordinate.lng,
        allowedAreaName,
        requireWithinArea,
        accuracyKm: accuracyKmValue,
      });

      if (requireWithinArea) {
        setValidationMessage(
          `Selected point is outside ${allowedAreaDisplayName}. Please pick a location within the boundary.`
        );
        return;
      }

      if (!outsideAreaAcknowledged) {
        setOutsideAreaAcknowledged(true);
        return;
      }
    }

    applyCoordinateChange(pendingCoordinate);
    setIsMapDialogOpen(false);
    setOutsideAreaAcknowledged(false);
  };

  const combinedErrorMessage =
    validationMessage || (error ? validationText : null);

  const selectedLocationText = markerCoordinate
    ? `Selected location: Lat ${markerCoordinate.lat.toFixed(
        5
      )}, Lon ${markerCoordinate.lng.toFixed(5)}`
    : 'No location selected yet. Click on the street map to drop a marker.';

  const outsideNoticeTitle = requireWithinArea
    ? `Location outside allowed area (not permitted)`
    : `Location outside allowed area (review required)`;

  // Optional debug logs (keep outside JSX)
  console.log('rawAllowedArea:', rawAllowedArea);
  console.log('safeAllowedAreaGeoJson:', safeAllowedAreaGeoJson);

  return (
    <>
      <Field
        label={label}
        name={name}
        required={required}
        error={Boolean(combinedErrorMessage)}
        validationText={combinedErrorMessage ?? undefined}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: captureAccuracy
              ? 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)'
              : 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Button
              name={`${name}-open-map`}
              disabled={disabled}
              onClick={handleOpenMapDialog}
              secondary
            >
              {currentCoordinate
                ? 'Update location on map'
                : 'Pick location on map'}
            </Button>
          </div>

          <InputField
            label="Latitude (°)"
            name={`${name}-lat`}
            type="number"
            step="0.000001"
            // disabled={disabled}
            disabled={true}
            value={latitudeInput}
            onChange={handleLatitudeChange}
            onBlur={onBlur}
            placeholder="-6.814527"
          />

          <InputField
            label="Longitude (°)"
            name={`${name}-lng`}
            type="number"
            step="0.000001"
            // disabled={disabled}
            disabled={true}
            value={longitudeInput}
            onChange={handleLongitudeChange}
            onBlur={onBlur}
            placeholder="39.279557"
          />

          {captureAccuracy && (
            <InputField
              label="Accuracy radius (km)"
              name={`${name}-accuracy-km`}
              type="number"
              step="0.1"
              min="0"
              // disabled={disabled}
              disabled={true}
              value={accuracyKmValue == null ? '' : String(accuracyKmValue)}
              onChange={handleAccuracyChange}
              onBlur={onBlur}
              placeholder="e.g. 0.1"
              // helpText={
              //   accuracySource === 'DEVICE'
              //     ? 'Derived from your device GPS accuracy (approx). Adjust if needed.'
              //     : 'How approximate is this location? Example: 0.1 km = 100 meters.'
              // }
            />
          )}
        </div>
      </Field>

      {isMapDialogOpen && (
        // <Modal
        //   onClose={handleCloseMapDialog}
        //   position="middle"
        //   className="coordinate-modal"
        // >
        //   <ModalTitle>Select location on street map</ModalTitle>
        //   <ModalContent>
        //     <div
        //       style={{
        //         display: 'flex',
        //         flexDirection: 'row',
        //         flexWrap: 'wrap',
        //         width: '100%',
        //         height: '70vh',
        //         gap: 16,
        //         overflow: 'hidden',
        //       }}
        //     >
        //       {/* ------------------ MAP AREA (flex: 3) ------------------ */}
        //       <div
        //         style={{
        //           flex: '3 1 60%',
        //           borderRadius: 8,
        //           overflow: 'hidden',
        //           boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        //           minWidth: '320px',
        //         }}
        //       >
        //         <CoordinateMapContainer
        //           center={mapCenterPosition}
        //           zoom={markerCoordinate ? 12 : DEFAULT_ZOOM}
        //           style={{ width: '100%', height: '100%' }}
        //           scrollWheelZoom={!disabled}
        //         >
        //           <TileLayer
        //             attribution="© OpenStreetMap contributors"
        //             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        //           />

        //           {safeAllowedAreaGeoJson && (
        //             <>
        //               <LeafletGeoJSON
        //                 data={safeAllowedAreaGeoJson as any}
        //                 style={(feature: any) => {
        //                   const isMulti =
        //                     feature?.geometry?.type === 'MultiPolygon' ||
        //                     safeAllowedAreaGeoJson.type === 'MultiPolygon';

        //                   // Consistent DHIS2-like palette
        //                   const strokeColor = isMulti ? '#E67E22' : '#1976D2';
        //                   const fillColor = isMulti ? '#FAD7A0' : '#BBDEFB';

        //                   return {
        //                     color: strokeColor,
        //                     weight: 2,
        //                     opacity: 0.9,
        //                     fillColor,
        //                     fillOpacity: 0.3,
        //                     dashArray: '4 4',
        //                   };
        //                 }}
        //               />
        //               <AutoFitToBoundary boundary={safeAllowedAreaGeoJson} />
        //             </>
        //           )}

        //           <RecenterOnCoordinate coordinate={markerCoordinate} />

        //           {markerCoordinate && (
        //             <Marker
        //               position={[markerCoordinate.lat, markerCoordinate.lng]}
        //             />
        //           )}

        //           <MapClickListener
        //             disabled={disabled}
        //             onCoordinateSelected={handleMapClick}
        //           />
        //         </CoordinateMapContainer>
        //       </div>

        //       {/* ------------------ INFO PANEL (flex: 1) ------------------ */}
        //       <div
        //         style={{
        //           flex: '1 1 30%',
        //           display: 'flex',
        //           flexDirection: 'column',
        //           gap: 12,
        //           minWidth: '280px',
        //           overflowY: 'auto',
        //           maxHeight: '70vh',
        //         }}
        //       >
        //         {markerCoordinate && (
        //           <>
        //             {safeAllowedAreaGeoJson ? (
        //               isOutsideAllowedArea ? (
        //                 requireWithinArea ? (
        //                   // 🟥 ERROR: Outside & not permitted
        //                   <NoticeBox
        //                     error
        //                     title="Outside Allowed Area (Not Permitted)"
        //                   >
        //                     <p>
        //                       The selected location is outside{' '}
        //                       <b>{allowedAreaDisplayName}</b>. You must pick a
        //                       point <b>within</b> the boundary to continue.
        //                     </p>
        //                   </NoticeBox>
        //                 ) : (
        //                   // 🟧 WARNING: Outside but allowed
        //                   <NoticeBox title="Outside Allowed Area (Review Required)">
        //                     <p>
        //                       The selected point is outside{' '}
        //                       <b>{allowedAreaDisplayName}</b>. Click{' '}
        //                       <b>Use Selected Location</b> again to confirm this
        //                       is intentional.
        //                     </p>
        //                     <p>
        //                       Saving out-of-boundary data may cause reporting
        //                       inconsistencies.
        //                     </p>
        //                   </NoticeBox>
        //                 )
        //               ) : (
        //                 // 🟩 VALID: Inside allowed area
        //                 <NoticeBox valid title="Valid Location within Boundary">
        //                   <p>
        //                     <strong>Selected Location:</strong>
        //                     <br />
        //                     Lat {markerCoordinate.lat.toFixed(5)}, Lon{' '}
        //                     {markerCoordinate.lng.toFixed(5)}
        //                   </p>
        //                   {captureAccuracy && (
        //                     <p>
        //                       <strong>Accuracy Info:</strong>
        //                       <br />
        //                       Radius: {accuracyKmValue ?? 'N/A'} km (
        //                       {accuracySource === 'DEVICE'
        //                         ? 'device-derived'
        //                         : accuracySource === 'MANUAL'
        //                         ? 'manual'
        //                         : 'unknown'}
        //                       )<br />
        //                       Max allowed: {maxAccuracyKm} km
        //                     </p>
        //                   )}
        //                   <p>
        //                     Pan or zoom to find the correct point. Click once to
        //                     drop the marker. Ensure it's within{' '}
        //                     {allowedAreaDisplayName}.
        //                   </p>
        //                 </NoticeBox>
        //               )
        //             ) : (
        //               // ℹ️ INFO: When no boundary provided
        //               <NoticeBox title="Selected Location">
        //                 <p>
        //                   <strong>Selected Location:</strong>
        //                   <br />
        //                   Lat {markerCoordinate.lat.toFixed(5)}, Lon{' '}
        //                   {markerCoordinate.lng.toFixed(5)}
        //                 </p>
        //                 {captureAccuracy && (
        //                   <p>
        //                     <strong>Accuracy Info:</strong>
        //                     <br />
        //                     Radius: {accuracyKmValue ?? 'N/A'} km (
        //                     {accuracySource === 'DEVICE'
        //                       ? 'device-derived'
        //                       : accuracySource === 'MANUAL'
        //                       ? 'manual'
        //                       : 'unknown'}
        //                     )<br />
        //                     Max allowed: {maxAccuracyKm} km
        //                   </p>
        //                 )}
        //                 <p>
        //                   Pan or zoom to find the correct point. Click once to
        //                   drop the marker.
        //                 </p>
        //               </NoticeBox>
        //             )}
        //           </>
        //         )}
        //       </div>
        //     </div>
        //   </ModalContent>

        //   <ModalActions>
        //     <div style={{ display: 'flex', gap: 12 }}>
        //       <Button onClick={handleCloseMapDialog} secondary>
        //         Cancel
        //       </Button>

        //       <Button
        //         primary
        //         onClick={handleConfirmFromMap}
        //         disabled={!pendingCoordinate || disabled || !canConfirm}
        //       >
        //         {requireWithinArea && isOutsideAllowedArea
        //           ? 'Pick a point inside boundary'
        //           : !requireWithinArea &&
        //             isOutsideAllowedArea &&
        //             !outsideAreaAcknowledged
        //           ? 'Review & Acknowledge'
        //           : 'Use Selected Location'}
        //       </Button>
        //     </div>
        //   </ModalActions>
        // </Modal>

        // <Modal
        //   onClose={handleCloseMapDialog}
        //   position="middle"
        //   className="coordinate-modal"
        // >
        //   <ModalTitle>
        //     <div
        //       style={{
        //         display: 'flex',
        //         justifyContent: 'space-between',
        //         alignItems: 'center',
        //         padding: '0 8px',
        //       }}
        //     >
        //       <span style={{ fontWeight: 600, fontSize: 16 }}>
        //         🗺️ Select Location on Street Map
        //       </span>
        //       <span style={{ fontSize: 12, color: '#555' }}>
        //         Click or tap on the map to choose coordinates
        //       </span>
        //     </div>
        //   </ModalTitle>

        //   <ModalContent>
        //     <div
        //       style={{
        //         display: 'flex',
        //         flexDirection: 'row',
        //         flexWrap: 'wrap',
        //         width: '100%',
        //         height: '70vh',
        //         gap: 16,
        //         overflow: 'hidden',
        //       }}
        //     >
        //       {/* ------------------ MAP AREA ------------------ */}
        //       <div
        //         style={{
        //           flex: '3 1 60%',
        //           borderRadius: 8,
        //           overflow: 'hidden',
        //           boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        //           minWidth: '320px',
        //         }}
        //       >
        //         <CoordinateMapContainer
        //           center={mapCenterPosition}
        //           zoom={markerCoordinate ? 12 : DEFAULT_ZOOM}
        //           style={{ width: '100%', height: '100%' }}
        //           scrollWheelZoom={!disabled}
        //         >
        //           <TileLayer
        //             attribution="© OpenStreetMap contributors"
        //             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        //           />

        //           {safeAllowedAreaGeoJson && (
        //             <>
        //               <LeafletGeoJSON
        //                 data={safeAllowedAreaGeoJson as any}
        //                 style={(feature: any) => {
        //                   const isMulti =
        //                     feature?.geometry?.type === 'MultiPolygon' ||
        //                     safeAllowedAreaGeoJson.type === 'MultiPolygon';

        //                   const strokeColor = isMulti ? '#E67E22' : '#1976D2';
        //                   const fillColor = isMulti ? '#FAD7A0' : '#BBDEFB';

        //                   return {
        //                     color: strokeColor,
        //                     weight: 2,
        //                     opacity: 0.9,
        //                     fillColor,
        //                     fillOpacity: 0.3,
        //                     dashArray: '4 4',
        //                   };
        //                 }}
        //               />
        //               <AutoFitToBoundary boundary={safeAllowedAreaGeoJson} />
        //             </>
        //           )}

        //           <RecenterOnCoordinate coordinate={markerCoordinate} />

        //           {markerCoordinate && (
        //             <Marker
        //               position={[markerCoordinate.lat, markerCoordinate.lng]}
        //             />
        //           )}

        //           <MapClickListener
        //             disabled={disabled}
        //             onCoordinateSelected={handleMapClick}
        //           />
        //         </CoordinateMapContainer>
        //       </div>

        //       {/* ------------------ SIDE INFO PANEL ------------------ */}
        //       <div
        //         style={{
        //           flex: '1 1 30%',
        //           display: 'flex',
        //           flexDirection: 'column',
        //           gap: 12,
        //           minWidth: '280px',
        //           overflowY: 'auto',
        //           maxHeight: '70vh',
        //         }}
        //       >
        //         {/* 🟦 Top Info Box (always visible) */}
        //         <NoticeBox title="Selected Location Info">
        //           {markerCoordinate ? (
        //             <div
        //               style={{
        //                 display: 'flex',
        //                 flexDirection: 'column',
        //                 gap: 6,
        //               }}
        //             >
        //               <div>
        //                 <strong>Selected Location:</strong>
        //                 <br />
        //                 Lat {markerCoordinate.lat.toFixed(5)}, Lon{' '}
        //                 {markerCoordinate.lng.toFixed(5)}
        //               </div>
        //               {captureAccuracy && (
        //                 <div>
        //                   <strong>Accuracy Info:</strong>
        //                   <br />
        //                   Radius: {accuracyKmValue ?? 'N/A'} km (
        //                   {accuracySource === 'DEVICE'
        //                     ? 'device-derived'
        //                     : accuracySource === 'MANUAL'
        //                     ? 'manual'
        //                     : 'unknown'}
        //                   )<br />
        //                   Max allowed: {maxAccuracyKm} km
        //                 </div>
        //               )}
        //             </div>
        //           ) : (
        //             <p>
        //               No location selected yet. Click on the map to drop a
        //               marker.
        //             </p>
        //           )}
        //         </NoticeBox>

        //         {/* ✅ Valid or ❌ Error */}
        //         {markerCoordinate &&
        //           safeAllowedAreaGeoJson &&
        //           (isOutsideAllowedArea ? (
        //             <NoticeBox
        //               error
        //               title="Outside Allowed Area (Not Permitted)"
        //             >
        //               <p>
        //                 The selected location is <strong>outside</strong> the
        //                 required boundary (<b>{allowedAreaDisplayName}</b>).
        //               </p>
        //               <p>
        //                 Please pick a point <b>within</b> the Shehia boundary.
        //               </p>
        //             </NoticeBox>
        //           ) : (
        //             <NoticeBox valid title="Valid Location within Boundary">
        //               <p>
        //                 ✅ You have successfully selected a valid location
        //                 inside {allowedAreaDisplayName}.
        //               </p>
        //             </NoticeBox>
        //           ))}

        //         {/* 🟦 Bottom Instructions (always visible) */}
        //         <NoticeBox title="Instructions">
        //           <p style={{ marginBottom: 0, lineHeight: 1.5 }}>
        //             Pan or zoom to find the correct point. Click once to drop
        //             the marker. Ensure it's within <b>Shehia boundary</b>.
        //           </p>
        //         </NoticeBox>
        //       </div>
        //     </div>
        //   </ModalContent>

        //   <ModalActions>
        //     <div
        //       style={{
        //         display: 'flex',
        //         justifyContent: 'space-between',
        //         alignItems: 'center',
        //         width: '100%',
        //       }}
        //     >
        //       <div style={{ fontSize: 13, color: '#666' }}>
        //         <span>💡 Tip:</span> You can click again to reposition your
        //         marker.
        //       </div>

        //       <div style={{ display: 'flex', gap: 12 }}>
        //         <Button onClick={handleCloseMapDialog} secondary>
        //           Cancel
        //         </Button>

        //         <Button
        //           primary
        //           onClick={handleConfirmFromMap}
        //           disabled={!pendingCoordinate || disabled || !canConfirm}
        //         >
        //           {requireWithinArea && isOutsideAllowedArea
        //             ? 'Pick a point inside boundary'
        //             : !requireWithinArea &&
        //               isOutsideAllowedArea &&
        //               !outsideAreaAcknowledged
        //             ? 'Review & Acknowledge'
        //             : 'Use Selected Location'}
        //         </Button>
        //       </div>
        //     </div>
        //   </ModalActions>
        // </Modal>

        <Modal
          onClose={handleCloseMapDialog}
          position="middle"
          className="coordinate-modal"
          style={{
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {/* -------- HEADER -------- */}
          <ModalTitle>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.25rem 0.5rem',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🗺️ Select Location on Map
              </span>
              <span style={{ fontSize: 12, color: '#666' }}>
                Click or tap on the map to choose coordinates
              </span>
            </div>
          </ModalTitle>

          {/* -------- MAIN CONTENT -------- */}
          <ModalContent>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: '72vh',
                overflow: 'hidden',
                gap: 16,
              }}
            >
              {/* -------- MAP AREA (75%) -------- */}
              <div
                style={{
                  flex: '0 0 75%',
                  position: 'relative',
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <CoordinateMapContainer
                  center={mapCenterPosition}
                  zoom={markerCoordinate ? 12 : DEFAULT_ZOOM}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={!disabled}
                >
                  <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* 🟦 Required Area (Improved Focus Styling) */}
                  {safeAllowedAreaGeoJson && (
                    <>
                      <LeafletGeoJSON
                        data={safeAllowedAreaGeoJson as any}
                        style={(feature: any) => {
                          const isMulti =
                            feature?.geometry?.type === 'MultiPolygon' ||
                            safeAllowedAreaGeoJson.type === 'MultiPolygon';

                          const strokeColor = isMulti ? '#F39C12' : '#1565C0';
                          const fillColor = isMulti ? '#FDEBD0' : '#E3F2FD';

                          return {
                            color: strokeColor,
                            weight: 3,
                            opacity: 0.95,
                            fillColor,
                            fillOpacity: 0.35,
                            dashArray: '6 4',
                            lineJoin: 'round',
                            lineCap: 'round',
                          };
                        }}
                      />
                      <AutoFitToBoundary boundary={safeAllowedAreaGeoJson} />
                    </>
                  )}

                  <RecenterOnCoordinate coordinate={markerCoordinate} />

                  {markerCoordinate && (
                    <Marker
                      position={[markerCoordinate.lat, markerCoordinate.lng]}
                    />
                  )}

                  <MapClickListener
                    disabled={disabled}
                    onCoordinateSelected={handleMapClick}
                  />
                </CoordinateMapContainer>

                {/* 🟩 Floating Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: !markerCoordinate
                      ? '#0288D1'
                      : isOutsideAllowedArea
                      ? '#C62828'
                      : '#2E7D32',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    transition: 'background 0.3s ease',
                    zIndex: 999,
                    letterSpacing: 0.3,
                  }}
                >
                  {!markerCoordinate
                    ? 'No location selected'
                    : isOutsideAllowedArea
                    ? 'Outside boundary'
                    : 'Valid location'}
                </div>
              </div>

              {/* -------- INFO PANEL (25%) -------- */}
              <div
                style={{
                  flex: '0 0 25%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  overflowY: 'auto',
                  borderLeft: '1px solid #e0e0e0',
                  padding: '0 12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    paddingTop: 2,
                    paddingRight: 6,
                  }}
                >
                  {/* 🟦 Top Info NoticeBox */}
                  <NoticeBox title="Selected Location Info">
                    {markerCoordinate ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div>
                          <strong>Selected Location:</strong>
                          <br />
                          Lat {markerCoordinate.lat.toFixed(5)}, Lon{' '}
                          {markerCoordinate.lng.toFixed(5)}
                        </div>
                        {captureAccuracy && (
                          <div>
                            <strong>Accuracy Info:</strong>
                            <br />
                            Radius: {accuracyKmValue ?? 'N/A'} km (
                            {accuracySource === 'DEVICE'
                              ? 'device-derived'
                              : accuracySource === 'MANUAL'
                              ? 'manual'
                              : 'unknown'}
                            )
                            <br />
                            Max allowed: {maxAccuracyKm} km
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>
                        No location selected yet. Click on the map to drop a
                        marker.
                      </p>
                    )}
                  </NoticeBox>

                  {/* 🟩 Valid / 🟥 Error */}
                  {markerCoordinate &&
                    safeAllowedAreaGeoJson &&
                    (isOutsideAllowedArea ? (
                      <NoticeBox
                        error
                        title="Outside Allowed Area (Not Permitted)"
                      >
                        <p>
                          The selected location is <strong>outside</strong> the
                          required boundary (<b>{allowedAreaDisplayName}</b>).
                        </p>
                        <p>
                          Please pick a point <b>within</b> the Shehia boundary.
                        </p>
                      </NoticeBox>
                    ) : (
                      <NoticeBox valid title="Valid Location within Boundary">
                        <p>
                          ✅ You have successfully selected a valid location
                          inside {allowedAreaDisplayName}.
                        </p>
                      </NoticeBox>
                    ))}
                </div>

                {/* 🟦 Bottom Instructions NoticeBox */}
                <div style={{ paddingBottom: 8 }}>
                  <NoticeBox title="Instructions">
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                      Pan or zoom to find the correct point. Click once to drop
                      the marker. Ensure it's within <b>Shehia boundary</b>.
                    </p>
                  </NoticeBox>
                </div>
              </div>
            </div>
          </ModalContent>

          {/* -------- ACTIONS (CLEANED) -------- */}
          <ModalActions>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '100%',
                gap: 12,
              }}
            >
              <Button onClick={handleCloseMapDialog} secondary>
                Cancel
              </Button>
              <Button
                primary
                onClick={handleConfirmFromMap}
                disabled={!pendingCoordinate || disabled || !canConfirm}
              >
                {requireWithinArea && isOutsideAllowedArea
                  ? 'Pick a point inside boundary'
                  : !requireWithinArea &&
                    isOutsideAllowedArea &&
                    !outsideAreaAcknowledged
                  ? 'Review & Acknowledge'
                  : 'Use Selected Location'}
              </Button>
            </div>
          </ModalActions>
        </Modal>
      )}
    </>
  );
};
