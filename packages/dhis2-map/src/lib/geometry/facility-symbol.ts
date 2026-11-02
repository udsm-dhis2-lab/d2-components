/** Resolve only same-origin raster assets supplied by trusted group metadata. */
export function facilitySymbolUrl(symbol: string | undefined, baseUrl: string, symbolBaseUrl?: string): string | null {
  if (!symbol || symbol.length > 512 || symbol.includes('\\') ||
    Array.from(symbol).some(character => character.charCodeAt(0) < 32)) return null;
  try {
    const origin = typeof window === 'undefined' ? 'http://localhost/' : window.location.href;
    const base = new URL(`${symbolBaseUrl || `${baseUrl}/images/orgunitgroup`}/`, origin);
    const url = new URL(symbol, base);
    if (url.origin !== new URL(origin).origin ||
      !/\.(png|jpe?g|webp)$/i.test(url.pathname) ||
      symbol.split('/').includes('..') ||
      (symbol[0] !== '/' && !/^https?:/i.test(symbol) && !/^[A-Za-z0-9_-]+\.(png|jpe?g|webp)$/i.test(symbol)))
      return null;
    return url.href;
  } catch { return null; }
}
