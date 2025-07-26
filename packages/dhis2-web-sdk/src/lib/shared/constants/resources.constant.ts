export const D2_RESOURCES = {
  organisationUnit: {
    name: 'organisationUnits',
    indexDbIndices: 'id,code,name,parent.id',
  },
  organisationUnitGroup: {
    name: 'organisationUnitGroups',
    indexDbIndices: 'id,code,name',
  },
  organisationUnitLevel: {
    name: 'organisationUnitLevels',
    indexDbIndices: 'id,code,name',
  },
  organisationUnitGroupSet: {
    name: 'organisationUnitGroupSets',
    indexDbIndices: 'id,code,name',
  },
  dataElement: {
    name: 'dataElements',
    indexDbIndices: 'id,code,name',
  },
  dataElementGroup: {
    name: 'dataElementGroups',
    indexDbIndices: 'id,code,name',
  },
  indicator: {
    name: 'indicators',
    indexDbIndices: 'id,code,name',
  },
  indicatorGroup: {
    name: 'indicatorGroups',
    indexDbIndices: 'id,code,name',
  },
  trackedEntityAttribute: {
    name: 'trackedEntityAttributes',
    indexDbIndices: 'id,code,name',
  },
  program: {
    name: 'programs',
    indexDbIndices: 'id,code,name',
  },
  programRule: {
    name: 'programRules',
    indexDbIndices: 'id,code,name',
  },
  dataSet: {
    name: 'dataSets',
    indexDbIndices: 'id,code,name',
  },
  dashboard: {
    name: 'dashboards',
    indexDbIndices: 'id,code,name',
  },
  visualization: {
    name: 'visualizations',
    indexDbIndices: 'id,code,name',
  },
  map: { name: 'maps', indexDbIndices: 'id,code,name' },
  geoFeatures: {
    name: 'geoFeatures',
    indexDbIndices: 'id,code',
  },
  legendSets: {
    name: 'legendSets',
    indexDbIndices: 'id,code,name',
  },
  optionSet: {
    name: 'optionSets',
    indexDbIndices: 'id,code,name',
  },
  dataStore: {
    name: 'dataStore',
    indexDbIndices: 'referenceKey,key',
  },
};
