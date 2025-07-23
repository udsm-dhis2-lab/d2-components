export const D2_RESOURCES = {
  organisationUnit: {
    name: 'organisationUnits',
    indexDbIndices: 'id,code,name,parent.id',
  },
  dataElement: {
    name: 'dataElements',
    indexDbIndices: 'id,code,name',
  },
  dataStore: {
    name: 'dataStore',
    indexDbIndices: 'key',
  },
};
