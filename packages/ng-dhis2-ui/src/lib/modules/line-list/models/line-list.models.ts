export interface Pager {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}
export interface Attribute {
  updatedAt: string;
  code: string;
  displayName: string;
  createdAt: string;
  valueType: string;
  attribute: string;
  value: string;
}

export interface EventsResponse {
  events: Event[];
  pager: Pager;
}

export interface Event {
  dueDate: string;
  program: string;
  event: string;
  programStage?: string;
  orgUnit: string;
  enrollment: string;
  trackedEntity: string;
  enrollmentStatus: string;
  orgUnitName: string;
  status: string;
  eventDate: string;
  attributeCategoryOptions: string;
  lastUpdated: string;
  created: string;
  completedDate: string;
  followup: boolean;
  deleted: boolean;
  attributeOptionCombo: string;
  createdAt: string;
  updatedAt: string;
  completedBy: string;
  createdBy: CreatedByUserInfo;
  updatedBy: LastUpdatedByUserInfo;
  lastUpdatedByUserInfo: LastUpdatedByUserInfo;
  createdByUserInfo: CreatedByUserInfo;
  dataValues: DataValue[];
  notes: any[];
  relationships: any[];
  followUp: boolean;
  scheduledAt: string;
}
export interface DataValue {
  lastUpdated: string;
  created: string;
  dataElement: string;
  value: string;
  providedElsewhere: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  program: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  orgUnit: string;
  enrollment: string;
  trackedEntity: string;
  trackedEntityType: string;
  orgUnitName: string;
  enrollmentDate: string;
  enrolledAt: string;
  occurredAt: string;
  followUp: boolean;
  deleted: boolean;
  completedBy?: string;
  completedAt?: string;
  incidentDate: string;
  status: string;
  updatedBy: LastUpdatedByUserInfo;
  createdBy: CreatedByUserInfo;
  notes: any[];
  relationships: any[];
  events: Event[];
  attributes: Attribute[];
}
export interface TrackedEntityInstance {
  trackedEntityInstance: string;
  attributes:  Attribute[];
  enrollments: Enrollment[];
  trackedEntity: string;
  trackedEntityType: string;
  createdAt: string;
  createdAtClient: string;
  updatedAt: string;
  orgUnit: string;
  inactive: boolean;
  deleted: boolean;
  potentialDuplicate: boolean;
  programOwners: ProgramOwner[];
}

export interface TrackedEntity {
  attributes: Attribute[];
  enrollments: Enrollment[];
  trackedEntity: string;
  trackedEntityType: string;
  createdAt: string;
  createdAtClient: string;
  updatedAt: string;
  orgUnit: string;
  inactive: boolean;
  deleted: boolean;
  potentialDuplicate: boolean;
  programOwners: ProgramOwner[];
}

export interface ProgramOwner {
  orgUnit: string;
  trackedEntity: string;
  program: string;
}
export interface TrackedEntityInstancesResponse {
  trackedEntityInstances: TrackedEntityInstance[];
  trackedEntity: TrackedEntity[];
  pager: Pager;
}

export interface TrackedEntityResponse {
  trackedEntities: TrackedEntity[];
  instances?: TrackedEntity[],
  pager: Pager;
  orgUnitsMap?: Map<string, string>;
}
export interface EnrollmentsResponse {
  enrollments: Enrollment[];
  pager: Pager;
}

export interface ProgramStageDataElement {
  dataElement: DataElement;
}

export interface DataElement {
  code: string;
  name: string;
  created: string;
  lastUpdated: string;
  translations: any[];
  favorites: any[];
  shortName: string;
  description: string;
  formName: string;
  dimensionItemType: string;
  legendSets: any[];
  aggregationType: string;
  valueType: string;
  domainType: string;
  dataSetElements: any[];
  aggregationLevels: any[];
  zeroIsSignificant: boolean;
  optionSetValue: boolean;
  dimensionItem: string;
  displayShortName: string;
  displayDescription: string;
  displayName: string;
  favorite: boolean;
  displayFormName: string;
  id: string;
  attributeValues: any[];
  dataElementGroups: any[];
  optionSet?: OptionSet;
}

export interface ProgramStage {
  id: string;
  name: string;
  programStageDataElements: ProgramStageDataElement[];
}

export interface ProgramMetadata {
  programType: string;
  programStages: ProgramStage[];
  organisationUnits: { id: string; name: string }[];
  programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
  orgUnitLabel: string;
}

export interface LineListResponse {
  metadata: ProgramMetadata;
  data: EventsResponse | TrackedEntityInstancesResponse | EnrollmentsResponse | TrackedEntityResponse;
}

export interface TableRow {
  [key: string]: string | number;
  index: number;
}

export interface ColumnDefinition {
  label: string;
  key: string;
  valueType?: string;
  options?: OptionSet;
}

export interface LastUpdatedByUserInfo {
  uid: string;
  firstName: string;
  surname: string;
  username: string;
}
export interface CreatedByUserInfo {
  uid: string;
  firstName: string;
  surname: string;
  username: string;
}
export interface ProgramTrackedEntityAttribute {
  access: {
    read: boolean;
    update: boolean;
    externalize: boolean;
    delete: boolean;
    write: boolean;
  };
  attributeValues: any[];
  created: string;
  displayInList: boolean;
  displayName: string;
  displayShortName: string;
  externalAccess: boolean;
  favorite: boolean;
  favorites: any[];
  id: string;
  lastUpdated: string;
  mandatory: boolean;
  name: string;
  program: { id: string };
  programTrackedEntityAttributeGroups: any[];
  renderOptionsAsRadio: boolean;
  searchable: boolean;
  sharing: { userGroups: any; external: boolean; users: any };
  sortOrder: string;
  trackedEntityAttribute: TrackedEntityAttribute;
  translations: any[];
  userAccesses: any[];
  userGroupAccesses: any[];
  valueType: string;
}

export interface TrackedEntityAttribute {
  code: string;
  name: string;
  formName: string;
  shortName: string;
  valueType: string;
  optionSetValue: boolean;
  id: string;
  optionSet?: OptionSet;
  generated: boolean,
  unique: boolean
}

export interface OptionSet {
  name: string;
  options: Option[];
  id: string;
}

export interface Option {
  code: string;
  name: string;
  id: string;
  value?: string;
}

