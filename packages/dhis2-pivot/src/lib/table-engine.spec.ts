import { TablePayload } from './models/table-object.model';
import { D2TableEngine } from './utils/table-engine.util';

describe('D2TableEngine pure operations', () => {
  it('calculates analytics values without a DOM', () => {
    const engine = new D2TableEngine();
    const analytics = {
      headers: [{ name: 'dx' }, { name: 'value' }],
      rows: [
        ['dx-a', '10'],
        ['dx-a', '2.5'],
      ],
    };
    expect(
      engine.getDataValue(analytics, [{ type: 'dx', value: 'dx-a' }])
    ).toBe(12.5);
    expect(
      engine.getDataValueColor(
        [{ startValue: 0, endValue: 20, color: 'green' }],
        12.5
      )
    ).toBe('green');
  });

  it('does not mutate rows while calculating consecutive-period differences', () => {
    const payload = {
      headers: [
        {
          style: '',
          items: [
            { id: 'p1', name: 'P1', span: 1, type: 'pe' },
            { id: 'p2', name: 'P2', span: 1, type: 'pe' },
          ],
        },
      ],
      columns: [],
      rows: [
        {
          headers: [],
          items: [
            { name: '', val: 10, row_span: 1 },
            { name: '', val: 15, row_span: 1 },
          ],
        },
      ],
      titles: { rows: [], column: [] },
      titlesAvailable: false,
      hasParentOu: false,
      title: '',
      subtitle: '',
    } satisfies TablePayload;
    const before = JSON.parse(JSON.stringify(payload));
    const result = new D2TableEngine().getDifferenceInConsecutivePe(
      null,
      payload
    );
    expect(payload).toEqual(before);
    expect(result.rows[0].items.at(-1)?.val).toBe(5);
  });
});
