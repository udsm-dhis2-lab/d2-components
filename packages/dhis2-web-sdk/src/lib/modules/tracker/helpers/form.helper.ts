type GeoJsonPointLike = {
    type: 'Point';
    coordinates: [number, number] | [string, string] | Array<number | string>;
};

function isGeoJsonPointLike(candidate: unknown): candidate is GeoJsonPointLike {
    return (
        !!candidate &&
        typeof candidate === 'object' &&
        (candidate as any).type === 'Point' &&
        Array.isArray((candidate as any).coordinates)
    );
}

/**
 * Parses a coordinate value into a [longitude, latitude] pair of strings.
 *
 * Supported inputs:
 *  - "[39.319364,-6.069623]"   // JSON-style string
 *  - "39.319364,-6.069623"     // comma-separated
 *  - "39.319364 -6.069623"     // space-separated
 *  - { type: "Point", coordinates: [39.192299, -6.164641] } // GeoJSON Point
 *
 * Returns:
 *  - ["39.319364", "-6.069623"] when valid (lon, lat as strings)
 *  - null when input is invalid or not recognized
 *
 * Notes:
 *  - Follows GeoJSON convention: [longitude, latitude]
 *  - Valid ranges: lon ∈ [-180, 180], lat ∈ [-90, 90]
 */
export function parseCoordinates(input?: unknown | null): string[] | null {
    if (input == null) return null;

    const normalizeLonLatPair = (
        coordinateParts: Array<string | number>
    ): string[] | null => {
        if (!coordinateParts || coordinateParts.length !== 2) return null;

        const longitudeText = String(coordinateParts[0]).trim();
        const latitudeText = String(coordinateParts[1]).trim();

        if (!longitudeText || !latitudeText) return null;

        const longitude = Number(longitudeText);
        const latitude = Number(latitudeText);

        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

        const isLongitudeValid = longitude >= -180 && longitude <= 180;
        const isLatitudeValid = latitude >= -90 && latitude <= 90;

        if (!isLongitudeValid || !isLatitudeValid) return null;

        return [longitudeText, latitudeText];
    };

    // GeoJSON Point support
    if (isGeoJsonPointLike(input)) {
        const geoJsonCoordinates = input.coordinates;
        return normalizeLonLatPair(geoJsonCoordinates);
    }

    // String-based input handling
    if (typeof input !== 'string') return null;

    const trimmedInput = input.trim();
    if (!trimmedInput) return null;

    // "[lon,lat]" format
    if (trimmedInput.startsWith('[') && trimmedInput.endsWith(']')) {
        const bracketContent = trimmedInput.slice(1, -1);
        const commaSeparatedValues = bracketContent
            .split(',')
            .map((value) => value.trim());

        return normalizeLonLatPair(commaSeparatedValues);
    }

    // "lon,lat" format
    if (trimmedInput.includes(',')) {
        const commaSeparatedValues = trimmedInput
            .split(',')
            .map((value) => value.trim());

        return normalizeLonLatPair(commaSeparatedValues);
    }

    // "lon lat" format
    const spaceSeparatedValues = trimmedInput.split(/\s+/);
    return normalizeLonLatPair(spaceSeparatedValues);
}
