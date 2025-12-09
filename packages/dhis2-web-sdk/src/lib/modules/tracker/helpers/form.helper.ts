/**
 * Parses a coordinate value into a [longitude, latitude] pair of strings.
 *
 * Supported string inputs:
 *  - "[39.319364,-6.069623]"   // JSON-style
 *  - "39.319364,-6.069623"     // comma-separated
 *  - "39.319364 -6.069623"     // space-separated
 *
 * Returns:
 *  - ["39.319364", "-6.069623"] when valid (lon, lat as strings)
 *  - null when input is invalid or not recognized
 *
 * Notes:
 *  - Follows GeoJSON convention: [longitude, latitude]
 *  - Valid ranges: lon ∈ [-180, 180], lat ∈ [-90, 90]
 */
export function parseCoordinates(value?: string | null): string[] | null {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const validateAndNormalizePair = (parts: string[]): string[] | null => {
        if (parts.length !== 2) return null;

        const lonText = parts[0].trim();
        const latText = parts[1].trim();

        if (!lonText || !latText) return null;

        const lonNum = Number(lonText);
        const latNum = Number(latText);

        if (!Number.isFinite(lonNum) || !Number.isFinite(latNum)) {
            return null;
        }

        const isLonValid = lonNum >= -180 && lonNum <= 180;
        const isLatValid = latNum >= -90 && latNum <= 90;

        if (!isLonValid || !isLatValid) {
            return null;
        }

        return [lonText, latText];
    };

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const inner = trimmed.slice(1, -1);
        const parts = inner.split(',');
        const result = validateAndNormalizePair(parts);
        if (result) return result;
    }

    if (trimmed.includes(',')) {
        const parts = trimmed.split(',');
        const result = validateAndNormalizePair(parts);
        if (result) return result;
    }

    const spaceParts = trimmed.split(/\s+/);
    const result = validateAndNormalizePair(spaceParts);
    if (result) return result;

    return null;
}
