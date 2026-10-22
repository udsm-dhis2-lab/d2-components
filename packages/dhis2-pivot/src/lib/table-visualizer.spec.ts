import { TablePayload } from './models/table-object.model';
import { D2TableEngine } from './utils/table-engine.util';
import { TableUtil } from './utils/table.util';

function tablePayloadFixture(): TablePayload {
  return {
    headers: [
      {
        style: '',
        items: [{ id: '2024', name: '2024', span: 1, type: 'pe' }],
      },
    ],
    columns: ['dx'],
    rows: [
      {
        headers: [],
        items: [{ name: 'Coverage', val: 42, row_span: 1 }],
      },
    ],
    titles: { rows: ['Data'], column: ['Period'] },
    titlesAvailable: true,
    hasParentOu: false,
    title: 'Coverage table',
    subtitle: 'Facility A',
  };
}

describe('TableUtil', () => {
  it('renders the current table payload into the configured host', () => {
    document.body.innerHTML = '<div id="table-host"></div>';
    jest
      .spyOn(D2TableEngine.prototype, 'drawTable')
      .mockReturnValue(tablePayloadFixture());

    new TableUtil()
      .setId('table-host')
      .setTableConfiguration({
        id: 'table-host',
        title: 'Coverage table',
      } as never)
      .setTableAnalytics({ rows: [] } as never)
      .setLegendSet([])
      .draw();

    const table = document.querySelector('#table-host table');
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain('2024');
    expect(table?.textContent).toContain('42');
    expect(document.querySelector('#table-host style')).not.toBeNull();
    expect(table?.getAttribute('role')).toBe('table');
    expect(table?.getAttribute('aria-label')).toBe('Coverage table');
  });

  it('keeps table-specific fluent state observable', () => {
    const renderer = new TableUtil();
    const analytics = { rows: [['1']] };
    const config = { id: 'table-host' };

    expect(renderer.setTableAnalytics(analytics as never)).toBe(renderer);
    expect(renderer.setTableConfiguration(config as never)).toBe(renderer);
    expect(renderer.getTableAnalytics()).toBe(analytics);
    expect(renderer.getTableConfiguration()).toBe(config);
  });
});
