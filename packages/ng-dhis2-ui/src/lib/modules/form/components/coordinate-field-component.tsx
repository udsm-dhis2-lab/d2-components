import React from 'react';
import {
  InputField,
  Field,
  Button,
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  Help,
} from '@dhis2/ui';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

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
}

interface ParsedCoordinate {
  lat: number;
  lng: number;
}

// Default focus: Zanzibar (Unguja) and nearby coastline
const DEFAULT_CENTER: LatLngExpression = [-6.1659, 39.2026];
const DEFAULT_ZOOM = 8;

function normalizeCoordinate(
  lat: number,
  lng: number
): ParsedCoordinate | null {
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  // Treat Null Island as "no coordinate"
  if (lat === 0 && lng === 0) return null;

  return { lat, lng };
}

/**
 * Accepts either:
 *  - "[lon,lat]" (JSON-style array)
 *  - "lat, lon" (string)
 */
function parseCoordinate(value?: string | null): ParsedCoordinate | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();

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
    const parts = trimmed.split(',').map((part) => part.trim());
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

// DHIS2 / react-leaflet typing workaround
const CoordinateMapContainer = MapContainer as any;

// DHIS2 InputField onChange event shape
type Dhis2InputChangeEvent = { value: string };

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
}) => {
  const parsedCoordinate = React.useMemo(() => parseCoordinate(value), [value]);

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

  React.useEffect(() => {
    const updatedCoordinate = parseCoordinate(value);
    if (updatedCoordinate) {
      setLatitudeInput(String(updatedCoordinate.lat));
      setLongitudeInput(String(updatedCoordinate.lng));
      setPendingCoordinate(updatedCoordinate);
      setMapCenterPosition([updatedCoordinate.lat, updatedCoordinate.lng]);
    } else {
      setLatitudeInput('');
      setLongitudeInput('');
      setPendingCoordinate(null);
      setMapCenterPosition(DEFAULT_CENTER);
    }
  }, [value]);

  const currentCoordinate: ParsedCoordinate | null = React.useMemo(() => {
    const lat = Number(latitudeInput);
    const lng = Number(longitudeInput);
    return normalizeCoordinate(lat, lng);
  }, [latitudeInput, longitudeInput]);

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
          'Please enter a valid coordinate within the allowed range.'
        );
        onChange(null);
        return;
      }

      setLatitudeInput(String(normalized.lat));
      setLongitudeInput(String(normalized.lng));
      setValidationMessage(null);

      const formattedValue = formatCoordinate(normalized);
      onChange(formattedValue);
    },
    [onChange]
  );

  const handleLatitudeChange = (event: Dhis2InputChangeEvent) => {
    const rawValue = event.value;
    setLatitudeInput(rawValue);

    const numericLatitude = Number(rawValue);
    if (
      rawValue !== '' &&
      (Number.isNaN(numericLatitude) ||
        numericLatitude < -90 ||
        numericLatitude > 90)
    ) {
      setValidationMessage('Latitude must be between -90 and 90.');
      return;
    }

    if (rawValue === '' || longitudeInput === '') {
      applyCoordinateChange(null);
      return;
    }

    const numericLongitude = Number(longitudeInput);
    if (
      Number.isNaN(numericLongitude) ||
      numericLongitude < -180 ||
      numericLongitude > 180
    ) {
      setValidationMessage('Longitude must be between -180 and 180.');
      return;
    }

    const updatedCoordinate = {
      lat: numericLatitude,
      lng: numericLongitude,
    };
    setPendingCoordinate(updatedCoordinate);
    applyCoordinateChange(updatedCoordinate);
  };

  const handleLongitudeChange = (event: Dhis2InputChangeEvent) => {
    const rawValue = event.value;
    setLongitudeInput(rawValue);

    const numericLongitude = Number(rawValue);
    if (
      rawValue !== '' &&
      (Number.isNaN(numericLongitude) ||
        numericLongitude < -180 ||
        numericLongitude > 180)
    ) {
      setValidationMessage('Longitude must be between -180 and 180.');
      return;
    }

    if (latitudeInput === '' || rawValue === '') {
      applyCoordinateChange(null);
      return;
    }

    const numericLatitude = Number(latitudeInput);
    if (
      Number.isNaN(numericLatitude) ||
      numericLatitude < -90 ||
      numericLatitude > 90
    ) {
      setValidationMessage('Latitude must be between -90 and 90.');
      return;
    }

    const updatedCoordinate = {
      lat: numericLatitude,
      lng: numericLongitude,
    };
    setPendingCoordinate(updatedCoordinate);
    applyCoordinateChange(updatedCoordinate);
  };

  const handleOpenMapDialog = () => {
    if (disabled) return;

    const baseCoordinate = currentCoordinate ?? pendingCoordinate ?? null;
    if (baseCoordinate) {
      setPendingCoordinate(baseCoordinate);
      setMapCenterPosition([baseCoordinate.lat, baseCoordinate.lng]);
    } else {
      setMapCenterPosition(DEFAULT_CENTER);
    }

    setIsMapDialogOpen(true);

    if (!baseCoordinate && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinate = normalizeCoordinate(
            position.coords.latitude,
            position.coords.longitude
          );
          if (coordinate) {
            setPendingCoordinate(coordinate);
            setMapCenterPosition([coordinate.lat, coordinate.lng]);
          } else {
            setMapCenterPosition(DEFAULT_CENTER);
          }
        },
        () => {
          setValidationMessage(
            (previous) =>
              previous ??
              'We could not detect your location. Please move the map and click on the correct place.'
          );
        }
      );
    }
  };

  const handleCloseMapDialog = () => {
    setIsMapDialogOpen(false);
  };

  const handleMapClick = (coordinate: ParsedCoordinate) => {
    const normalized = normalizeCoordinate(coordinate.lat, coordinate.lng);
    if (!normalized) return;

    setPendingCoordinate(normalized);
    setMapCenterPosition([normalized.lat, normalized.lng]);
  };

  const handleConfirmFromMap = () => {
    if (!pendingCoordinate) return;
    applyCoordinateChange(pendingCoordinate);
    setIsMapDialogOpen(false);
  };

  const combinedErrorMessage =
    validationMessage || (error ? validationText : null);
  const markerCoordinate = pendingCoordinate || currentCoordinate || null;

  const selectedLocationText = markerCoordinate
    ? `Selected location: Lat ${markerCoordinate.lat.toFixed(
        5
      )}, Lon ${markerCoordinate.lng.toFixed(5)}`
    : 'No location selected yet. Click on the street map to drop a marker.';

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
            gridTemplateColumns:
              'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)',
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
            disabled={disabled}
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
            disabled={disabled}
            value={longitudeInput}
            onChange={handleLongitudeChange}
            onBlur={onBlur}
            placeholder="39.279557"
          />
        </div>
      </Field>

      {isMapDialogOpen && (
        <Modal
          onClose={handleCloseMapDialog}
          position="middle"
          className="coordinate-modal"
        >
          <ModalTitle>Select location on street map</ModalTitle>
          <ModalContent>
            <div
              style={{
                width: '80vw',
                height: '70vh',
                maxWidth: '100%',
                maxHeight: '80vh',
              }}
            >
              <CoordinateMapContainer
                center={mapCenterPosition}
                zoom={markerCoordinate ? 12 : DEFAULT_ZOOM}
                style={{ width: '100%', height: '100%', borderRadius: 8 }}
                scrollWheelZoom={!disabled}
              >
                <TileLayer
                  attribution="© OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
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
            </div>

            <p style={{ marginTop: 8, fontSize: 13 }}>{selectedLocationText}</p>
            <Help>
              Use the street map to find the correct facility, building or area.
              Pan (drag), zoom in/out, then click once to place or move the
              marker. Click Use Selected Location to save the
              coordinates.
            </Help>
          </ModalContent>
          <ModalActions>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={handleCloseMapDialog} secondary>
                Cancel
              </Button>
              <Button
                primary
                onClick={handleConfirmFromMap}
                disabled={!pendingCoordinate}
              >
                Use Selected Location
              </Button>
            </div>
          </ModalActions>
        </Modal>
      )}
    </>
  );
};
