import { facilitySymbolUrl } from './facility-symbol';

describe('facility symbol URL boundary', () => {
  it('accepts only same-origin raster paths', () => {
    expect(facilitySymbolUrl('/api/icons/hospital.png', '/dhis'))
      .toBe('http://localhost/api/icons/hospital.png');
    expect(facilitySymbolUrl('hospital.png', '/dhis', '/dhis-web-maps/images'))
      .toBe('http://localhost/dhis-web-maps/images/hospital.png');
    expect(facilitySymbolUrl('21.png', '/dhis'))
      .toBe('http://localhost/dhis/images/orgunitgroup/21.png');
    expect(facilitySymbolUrl('https://evil.example/icon.png', '/dhis')).toBeNull();
    expect(facilitySymbolUrl('../secret.png', '/dhis')).toBeNull();
    expect(facilitySymbolUrl('icon.svg', '/dhis')).toBeNull();
    expect(facilitySymbolUrl('javascript:alert(1)', '/dhis')).toBeNull();
  });
});
