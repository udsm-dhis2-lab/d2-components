import { TableDownloadService, tableToCsv } from './download.service';

describe('TableDownloadService', () => {
  const createObjectURL = jest.fn(() => 'blob:table');
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    document.body.innerHTML =
      '<table id="table"><tr><th>Name</th><th>Value</th></tr><tr><td>A</td><td>42</td></tr></table>';
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('converts table content with deterministic quoting', () => {
    expect(tableToCsv(document.querySelector('table')!)).toBe(
      '"Name","Value"\r\n"A","42"'
    );
  });

  it.each(['CSV', 'XLS'] as const)(
    'downloads %s and cleans temporary resources',
    (format) => {
      new TableDownloadService().download({
        elementId: 'table',
        filename: 'report',
        format,
      });
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
      expect(document.querySelector('a')).toBeNull();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:table');
    }
  );
});
