import { Program } from '@iapps/d2-web-sdk';
import { fetchLineListDownloadRows } from './line-list-download-data.util';
import {
  projectEventExport,
  projectTrackerExport,
} from './line-list-export-projection.util';

const metadata = {
  programType: 'WITH_REGISTRATION',
  programTrackedEntityAttributes: [
    {
      sortOrder: 1,
      trackedEntityAttribute: {
        id: 'residence',
        name: 'Residence',
        valueType: 'ORGANISATION_UNIT',
      },
    },
    {
      sortOrder: 2,
      trackedEntityAttribute: {
        id: 'name',
        name: 'Name',
        valueType: 'TEXT',
      },
    },
    {
      sortOrder: 3,
      trackedEntityAttribute: {
        id: 'status',
        name: 'Status',
        valueType: 'TEXT',
        optionSet: { options: [{ code: 'ACTIVE', name: 'Active' }] },
      },
    },
  ],
  programStages: [
    {
      id: 'stage',
      programStageDataElements: [
        {
          sortOrder: 1,
          dataElement: {
            id: 'facility',
            name: 'Referring Facility',
            valueType: 'ORGANISATION_UNIT',
          },
        },
        {
          sortOrder: 2,
          dataElement: { id: 'notes', name: 'Notes', valueType: 'TEXT' },
        },
      ],
    },
  ],
} as unknown as Program;

describe('line-list export organisation-unit values', () => {
  it('projects tracker organisation-unit attributes as names with UID fallback', () => {
    const result = projectTrackerExport(
      [
        {
          orgUnit: 'entityOu',
          latestEnrollment: {
            orgUnit: 'registeringOu',
            attributes: [
              { attribute: 'residence', value: 'knownOu' },
              { attribute: 'name', value: 'Alice' },
              { attribute: 'status', value: 'ACTIVE' },
            ],
          },
        },
        {
          latestEnrollment: {
            orgUnit: 'registeringOu',
            attributes: [{ attribute: 'residence', value: 'unknownOu' }],
          },
        },
      ],
      metadata,
      undefined,
      'NAME',
      new Map([
        ['registeringOu', 'Registration Clinic'],
        ['knownOu', 'Residence Ward'],
      ]),
      new Map([
        [
          'registeringOu',
          {
            id: 'registeringOu',
            name: 'Registration Clinic',
            level: 3,
            ancestors: [{ id: 'region', name: 'Region', level: 2 }],
          },
        ],
      ]),
      [
        { level: 1, name: 'Country' },
        { level: 2, name: 'Region' },
        { level: 3, name: 'Facility' },
      ]
    );

    expect(result.data[0]['attribute:residence'].value).toBe('Residence Ward');
    expect(result.data[1]['attribute:residence'].value).toBe('unknownOu');
    expect(result.data[0]['attribute:name'].value).toBe('Alice');
    expect(result.data[0]['attribute:status'].value).toBe('ACTIVE');
    expect(result.data[0].organisationUnitId.value).toBe('registeringOu');
    expect(result.data[0].organisationUnitName.value).toBe(
      'Registration Clinic'
    );
    expect(result.data[0]['orgUnitLevel:2'].value).toBe('Region');
    expect(result.data[0]['orgUnitLevel:3'].value).toBe('Registration Clinic');
  });

  it('projects event organisation-unit data elements as names with UID fallback', () => {
    const result = projectEventExport(
      [
        {
          orgUnit: 'registeringOu',
          dataValues: [
            { dataElement: 'facility', value: 'knownOu' },
            { dataElement: 'notes', value: 'unchanged' },
          ],
        },
        {
          dataValues: [{ dataElement: 'facility', value: 'unknownOu' }],
        },
      ],
      metadata,
      'stage',
      'NAME',
      new Map([['knownOu', 'Referral Hospital']])
    );

    expect(result.data[0]['dataElement:facility'].value).toBe(
      'Referral Hospital'
    );
    expect(result.data[1]['dataElement:facility'].value).toBe('unknownOu');
    expect(result.data[0]['dataElement:notes'].value).toBe('unchanged');
  });

  it('resolves each tracker organisation-unit ID once across all export rows', async () => {
    const trackedEntities = [
      {
        latestEnrollment: {
          orgUnit: 'registeringOu',
          attributes: [{ attribute: 'residence', value: 'residenceOu' }],
        },
      },
      {
        latestEnrollment: {
          orgUnit: 'registeringOu',
          attributes: [{ attribute: 'residence', value: 'residenceOu' }],
        },
      },
    ];
    const query: any = {};
    for (const method of [
      'setEndDate',
      'setProgram',
      'setOrgUnit',
      'setOuMode',
      'setStatus',
      'setFilters',
      'setPagination',
      'setOrderCriterias',
      'setStartDate',
      'setEventStatus',
    ])
      query[method] = jest.fn(() => query);
    query.get = jest.fn().mockResolvedValue({
      data: trackedEntities,
      pagination: { pageCount: 1 },
      responseStatus: { status: 200 },
    });
    const resolveOrgUnitNames = jest.fn(
      async (ids: string[]) => new Map(ids.map((id) => [id, `${id} name`]))
    );

    const result = await fetchLineListDownloadRows({
      d2: {
        trackerModule: { trackedEntity: query },
      } as any,
      metaData: metadata,
      programId: 'program',
      orgUnit: 'selectedOu',
      dataQueryFilters: [],
      enrollmentStatus: 'ACTIVE' as any,
      columnNameSource: 'NAME',
      resolveOrgUnitNames,
    });

    expect(resolveOrgUnitNames).toHaveBeenCalledTimes(1);
    expect(resolveOrgUnitNames).toHaveBeenCalledWith([
      'registeringOu',
      'residenceOu',
    ]);
    expect(result.data[0]['attribute:residence'].value).toBe(
      'residenceOu name'
    );
  });

  it('resolves tracker hierarchy in bounded batches', async () => {
    const trackedEntities = Array.from({ length: 101 }, (_, index) => ({
      latestEnrollment: { orgUnit: `orgUnit${index}` },
    }));
    const query: any = {};
    for (const method of [
      'setEndDate',
      'setProgram',
      'setOrgUnit',
      'setOuMode',
      'setStatus',
      'setFilters',
      'setPagination',
      'setOrderCriterias',
      'setStartDate',
      'setEventStatus',
    ])
      query[method] = jest.fn(() => query);
    query.get = jest.fn().mockResolvedValue({
      data: trackedEntities,
      pagination: { pageCount: 1 },
      responseStatus: { status: 200 },
    });
    const resolveOrgUnitHierarchy = jest.fn(async (ids: string[]) => ({
      hierarchy: new Map(
        ids.map((id) => [
          id,
          { id, name: `${id} name`, level: 3, ancestors: [] },
        ])
      ),
      levels: [
        { level: 1, name: 'Country' },
        { level: 3, name: 'Facility' },
      ],
    }));

    const result = await fetchLineListDownloadRows({
      d2: { trackerModule: { trackedEntity: query } } as any,
      metaData: metadata,
      programId: 'program',
      orgUnit: 'selectedOu',
      dataQueryFilters: [],
      enrollmentStatus: 'ACTIVE' as any,
      columnNameSource: 'NAME',
      resolveOrgUnitHierarchy,
    });

    expect(resolveOrgUnitHierarchy).toHaveBeenCalledTimes(2);
    expect(resolveOrgUnitHierarchy.mock.calls[0][0]).toHaveLength(100);
    expect(resolveOrgUnitHierarchy.mock.calls[1][0]).toEqual(['orgUnit100']);
    expect(result.data[0]['orgUnitLevel:3'].value).toBe('orgUnit0 name');
    expect(result.data[100]['orgUnitLevel:3'].value).toBe('orgUnit100 name');
  });
});
