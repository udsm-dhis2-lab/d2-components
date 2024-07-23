const LEVEL_ID_PREFIX = 'LEVEL';
const GROUP_ID_PREFIX = 'OU_GROUP';
export const USER_ORG_UNIT = 'USER_ORGUNIT';
export const USER_ORG_UNIT_CHILDREN = 'USER_ORGUNIT_CHILDREN';
export const USER_ORG_UNIT_GRANDCHILDREN = 'USER_ORGUNIT_GRANDCHILDREN';

const hasGroupPrefix = (id: string) =>
  id.substr(0, GROUP_ID_PREFIX.length) === GROUP_ID_PREFIX;

const hasLevelPrefix = (id: string) => id.includes(LEVEL_ID_PREFIX);

const stripLevelPrefix = (id: string) =>
  hasLevelPrefix(id) ? id.substr(LEVEL_ID_PREFIX.length + 1) : id;

const stripGroupPrefix = (id: string) =>
  hasGroupPrefix(id) ? id.substr(GROUP_ID_PREFIX.length + 1) : id;

const removePrefix = (id: string) => stripGroupPrefix(stripLevelPrefix(id));

export const ouIdHelper = Object.freeze({
  addLevelPrefix: (id: string) => `${LEVEL_ID_PREFIX}-${removePrefix(id)}`,
  addGroupPrefix: (id: string) => `${GROUP_ID_PREFIX}-${removePrefix(id)}`,
  removePrefix,
  hasGroupPrefix,
  hasLevelPrefix,
});
