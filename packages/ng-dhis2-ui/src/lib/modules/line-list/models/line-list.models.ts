export interface Pager {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface Attribute {
  lastUpdated: string;
  code: string;
  displayName: string;
  created: string;
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
  trackedEntityInstance: string;
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
  completedBy: string;
  lastUpdatedByUserInfo: LastUpdatedByUserInfo;
  createdByUserInfo: CreatedByUserInfo;
  dataValues: DataValue[];
  notes: any[];
  relationships: any[];
}

export interface DataValue {
  lastUpdated: string;
  created: string;
  dataElement: string;
  value: string;
  providedElsewhere: boolean;
}

export interface Enrollment {
  program: string;
  lastUpdated: string;
  created: string;
  orgUnit: string;
  enrollment: string;
  trackedEntityInstance: string;
  trackedEntityType: string;
  orgUnitName: string;
  enrollmentDate: string;
  followup: boolean;
  deleted: boolean;
  incidentDate: string;
  status: string;
  lastUpdatedByUserInfo: LastUpdatedByUserInfo;
  createdByUserInfo: CreatedByUserInfo;
  notes: any[];
  relationships: any[];
  events: Event[];
  attributes: Attribute[];
}

export interface TrackedEntityInstance {
  trackedEntityInstance: string;
  attributes: { attribute: string; value: string; displayName?: string }[];
  enrollments: Enrollment[]; 
}

export interface TrackedEntityInstancesResponse {
  trackedEntityInstances: TrackedEntityInstance[];
  pager: Pager;
}

export interface ProgramStageDataElement {
  dataElement: { id: string; name: string };
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
  programTrackedEntityAttributes: ProgramTrackedEntityAttribute[]
}

export interface LineListResponse {
  metadata: ProgramMetadata;
  data: EventsResponse | TrackedEntityInstancesResponse;
}

export interface TableRow {
  [key: string]: string | number;
  index: number;
}

export interface ColumnDefinition {
  label: string;
  key: string;
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
  sortOrder: number;
  trackedEntityAttribute: {
    id: string;
    name: string;
    valueType: string;
  };
  translations: any[]; 
  userAccesses: any[];
  userGroupAccesses: any[];
  valueType: string;
}


// // //line-list.models.ts
// // src/models/line-list.models.ts
// export interface Pager {
//   page: number;
//   pageSize: number;
//   total: number;
//   pageCount: number;
// }

// export interface EventsResponse {
//   events: {
//     event: string;
//     programStage?: string;
//     dataValues: { dataElement: string; value: string }[];
//   }[];
//   pager: Pager;
// }

// export interface TrackedEntityInstancesResponse {
//   trackedEntityInstances: {
//     trackedEntityInstance: string;
//     attributes: { attribute: string; value: string; displayName?: string }[];
//   }[];
//   pager: Pager;
// }

// export interface ProgramMetadata {
//   programType: string;
//   programStages: {
//     id: string;
//     name: string;
//     programStageDataElements: { dataElement: { id: string; name: string } }[];
//   }[];
//   organisationUnits: { id: string; name: string }[];
// }

// export interface LineListResponse {
//   metadata: ProgramMetadata;
//   data: EventsResponse | TrackedEntityInstancesResponse;
// }

//   export interface TableRow {
//     [key: string]: string | number; 
//     index: number; 
//   }
  
//   export interface ColumnDefinition {
//     label: string;
//     key: string;
//   }




// // Base DHIS2 Object (common fields across many entities)
// interface Dhis2Base {
//     id: string;
//     name?: string;
//     displayName?: string;
//     code?: string;
//     created?: string;
//     lastUpdated?: string;
//     href?: string;
//     [key: string]: any; // For any additional DHIS2 fields
//   }
  
//   export interface DataElement extends Dhis2Base {
//     id: string;
//     name: string; 
//     shortName?: string;
//     description?: string;
//     valueType?: string;
//     domainType?: string;
//     aggregationType?: string;
//   }
  
//   export interface ProgramStageDataElement extends Dhis2Base {
//     dataElement: DataElement; 
//     compulsory?: boolean;
//     allowProvidedElsewhere?: boolean;
//     displayInReports?: boolean;
//   }
  
//   export interface ProgramStage extends Dhis2Base {
//     id: string; 
//     name: string; 
//     programStageDataElements: ProgramStageDataElement[]; 
//     description?: string;
//     repeatable?: boolean;
//     program?: Dhis2Base; // Reference to Program
//     executionDateLabel?: string;
//   }
  
//   export interface OrganisationUnit extends Dhis2Base {
//     id: string; 
//     name: string; 
//     path?: string;
//     level?: number;
//     parent?: OrganisationUnit;
//     children?: OrganisationUnit[];
//   }
  
//   export interface ProgramMetadata extends Dhis2Base {
//     programType: 'WITH_REGISTRATION' | 'WITHOUT_REGISTRATION'; 
//     programStages: ProgramStage[]; 
//     organisationUnits: OrganisationUnit[]; 
//     name?: string;
//     description?: string;
//     trackedEntityType?: Dhis2Base;
//     categoryCombo?: Dhis2Base;
//   }
  
//   // Data Value (required fields: dataElement, value)
//   export interface DataValue {
//     dataElement: string; 
//     value: string; 
//     providedElsewhere?: boolean;
//     storedBy?: string;
//     lastUpdated?: string;
//   }
  
//   export interface Event extends Dhis2Base {
//     event: string; 
//     dataValues: DataValue[]; 
//     program?: string;
//     programStage?: string;
//     orgUnit?: string;
//     status?: 'ACTIVE' | 'COMPLETED' | 'VISITED' | 'SCHEDULED' | 'OVERDUE' | 'SKIPPED';
//     eventDate?: string;
//     dueDate?: string;
//     coordinate?: { latitude: number; longitude: number };
//   }
  
//   export interface EventsResponse {
//     events: Event[]; 
//     pager?: {
//       page: number;
//       pageCount: number;
//       total: number;
//       pageSize: number;
//     };
//   }
  
//   export interface Attribute {
//     attribute: string; 
//     value: string; 
//     displayName?: string; 
//     created?: string;
//     lastUpdated?: string;
//   }
  
//   export interface Enrollment extends Dhis2Base {
//     enrollment?: string;
//     trackedEntityInstance?: string;
//     program?: string;
//     status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
//     enrollmentDate?: string;
//     incidentDate?: string;
//   }
  
//   export interface TrackedEntityInstance extends Dhis2Base {
//     trackedEntityInstance: string; 
//     attributes: Attribute[]; 
//     enrollments: Enrollment[]; 
//     trackedEntityType?: string;
//     orgUnit?: string;
//     createdAtClient?: string;
//     lastUpdatedAtClient?: string;
//     inactive?: boolean;
//   }
  
//   export interface TrackedEntityInstancesResponse {
//     trackedEntityInstances: TrackedEntityInstance[]; 
//     pager?: {
//       page: number;
//       pageCount: number;
//       total: number;
//       pageSize: number;
//     };
//   }
  
//   export interface LineListResponse {
//     metadata: ProgramMetadata; 
//     data: EventsResponse | TrackedEntityInstancesResponse; 
//   }
  
//   export interface TableRow {
//     [key: string]: string | number; 
//     index: number; 
//   }
  
//   export interface ColumnDefinition {
//     label: string;
//     key: string;
//   }