export interface Pager {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface EventsResponse {
  events: {
    event: string;
    programStage?: string;
    dataValues: { dataElement: string; value: string }[];
  }[];
  pager: Pager;
}

export interface Enrollment {
  enrollment: string;
  program: string;
  attributes: { attribute: string; value: string; displayName?: string }[];
}

export interface TrackedEntityInstance {
  trackedEntityInstance: string;
  attributes: { attribute: string; value: string; displayName?: string }[];
  enrollments: Enrollment[]; // Added enrollments here
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