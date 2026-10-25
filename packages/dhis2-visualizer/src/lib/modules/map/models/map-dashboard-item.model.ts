export interface MapDashboardItem {
  lastUpdated: string;
  id: string;
  created: string;
  type: string;
  externalAccess: boolean;
  contentCount: number;
  height: number;
  interpretationCount: number;
  sharing: Sharing;
  width: number;
  x: number;
  y: number;
  interpretationLikeCount: number;
  favorite: boolean;
  access: Access;
  map: Map;
  favorites: unknown[];
  reports: unknown[];
  translations: unknown[];
  userGroupAccesses: unknown[];
  attributeValues: unknown[];
  resources: unknown[];
  users: unknown[];
  userAccesses: unknown[];
}

export interface Access {
  read: boolean;
  update: boolean;
  externalize: boolean;
  delete: boolean;
  write: boolean;
  manage: boolean;
}

export interface Map {
  lastUpdated: string;
  id: string;
  created: string;
  name: string;
  displayName: string;
  basemap: string;
  externalAccess: boolean;
  subscribed: boolean;
  sharing: Sharing;
  displayFormName: string;
  favorite: boolean;
  access: Access;
  lastUpdatedBy: CreatedBy;
  createdBy: CreatedBy;
  user: CreatedBy;
  favorites: unknown[];
  translations: unknown[];
  mapViews: MapView[];
  interpretations: unknown[];
  userGroupAccesses: unknown[];
  subscribers: unknown[];
  attributeValues: unknown[];
  userAccesses: unknown[];
}

export interface CreatedBy {
  displayName: string;
  name: string;
  id: string;
  username: string;
}

export interface MapView {
  lastUpdated: string;
  id: string;
  created: string;
  name: string;
  userOrganisationUnitChildren: boolean;
  subscribed: boolean;
  userOrganisationUnit: boolean;
  method: number;
  renderingStrategy: string;
  sortOrder: number;
  favorite: boolean;
  topLimit: number;
  userOrganisationUnitGrandChildren: boolean;
  displayName: string;
  layer: string;
  hideTitle: boolean;
  eventClustering: boolean;
  opacity: number;
  parentLevel: number;
  parentGraphMap: unknown;
  completedOnly: boolean;
  eventPointRadius: number;
  sharing: Sharing;
  displayFormName: string;
  thematicMapType: string;
  hideSubtitle: boolean;
  externalAccess: boolean;
  digitGroupSeparator: string;
  access: Access;
  relativePeriods: { [key: string]: boolean };
  legendSet: LegendSet;
  dataElementGroupSetDimensions: unknown[];
  attributeDimensions: unknown[];
  translations: unknown[];
  filterDimensions: string[];
  interpretations: unknown[];
  userGroupAccesses: unknown[];
  subscribers: unknown[];
  columns: unknown[];
  dataElementDimensions: unknown[];
  periods: unknown[];
  categoryDimensions: unknown[];
  itemOrganisationUnitGroups: unknown[];
  programIndicatorDimensions: unknown[];
  attributeValues: unknown[];
  columnDimensions: string[];
  userAccesses: unknown[];
  favorites: unknown[];
  dataDimensionItems: DataDimensionItem[];
  categoryOptionGroupSetDimensions: unknown[];
  organisationUnitGroupSetDimensions: unknown[];
  organisationUnitLevels: number[];
  organisationUnits: unknown[];
  filters: unknown[];
  rows: unknown[];
}

export interface DataDimensionItem {
  dataDimensionItemType: string;
  indicator: LegendSet;
}

export interface LegendSet {
  id: string;
}

export interface Sharing {
  external: boolean;
  users: Readonly<Record<string, unknown>>;
  userGroups: Readonly<Record<string, unknown>>;
  owner?: string;
}
