import {
  buildOrgUnitHierarchyColumns,
  buildOrgUnitHierarchyValues,
} from './org-unit-hierarchy.util';

describe('organisation unit hierarchy projection', () => {
  const levels = [
    { level: 1, name: 'MoH' },
    { level: 2, name: 'Region' },
    { level: 3, name: 'Council' },
    { level: 4, name: 'Facility' },
  ];

  it('uses DHIS2 level names, omits the constant top level, and keeps a stable order', () => {
    expect(buildOrgUnitHierarchyColumns(levels)).toEqual([
      { key: 'orgUnitLevel:2', label: 'Region' },
      { key: 'orgUnitLevel:3', label: 'Council' },
      { key: 'orgUnitLevel:4', label: 'Facility' },
    ]);
  });

  it('projects ancestors and the registering unit without shifting missing levels', () => {
    const values = buildOrgUnitHierarchyValues('facility', new Map([
      ['facility', {
        id: 'facility', name: 'Mtoni Hospital', level: 4,
        ancestors: [
          { id: 'moh', name: 'MoH', level: 1 },
          { id: 'council', name: 'Temeke MC', level: 3 },
        ],
      }],
    ]), levels);

    expect(values).toEqual({
      'orgUnitLevel:2': '',
      'orgUnitLevel:3': 'Temeke MC',
      'orgUnitLevel:4': 'Mtoni Hospital',
    });
  });
});
