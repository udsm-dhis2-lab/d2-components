import { format } from 'date-fns';
import { camelCase, isArray, isEmpty, isPlainObject } from 'lodash';
import {
  AttributeUtil,
  EnrollmentUtil,
  TrackerRelationshipUtil,
} from '../utils';
import { Attribute, AttributeEntity } from './attribute.model';
import { BaseTrackerSDKModel } from './base.model';
import { Enrollment, IEnrollment } from './enrollment.model';
import { DHIS2Event, IDHIS2Event } from '../../event/models/event.model';
import { TrackerRelationship } from './tracker-relationship.model';
import { Program } from '../../program';

export interface ProgramOwner {
  ownerOrgUnit: string;
  program: string;
  trackedEntityInstance: string;
}

export interface TrackerDataEntities {
  [key: string]: string | number;
  enrollmentDate: string;
  orgUnit: string;
}

export interface TrackedEntityInstanceObject {
  created?: string;
  createdAt?: string;
  updatedAt?: string;
  orgUnit: string;
  createdAtClient?: string;
  trackedEntity: string;
  trackedEntityInstance?: string;
  lastUpdated?: string;
  trackedEntityType: string;
  lastUpdatedAtClient?: string;
  inactive?: boolean;
  deleted?: boolean;
  featureType?: string;
  programOwners?: ProgramOwner[];
  enrollments: IEnrollment[];
  relationships?: any[];
  attributes?: Attribute[];
  relatedEntities?: TrackerRelationship[];
}

interface TrackerFieldProperty {
  id: string;
  type:
    | 'ATTRIBUTE'
    | 'DATA_ELEMENT'
    | 'ENROLLMENT_DATE'
    | 'INCIDENT_DATE'
    | 'ORG_UNIT';
  generated?: boolean;
  stageId?: string;
  repeatable?: boolean;
}

const DEFAULT_FIELD_PROPERTIES: Record<string, TrackerFieldProperty> = {
  enrollmentDate: {
    id: 'enrollmentDate',
    type: 'ENROLLMENT_DATE',
  },
  incidentDate: {
    id: 'incidentDate',
    type: 'INCIDENT_DATE',
  },
  orgUnit: {
    id: 'orgUnit',
    type: 'ORG_UNIT',
  },
};

export interface ITrackedEntityInstance {
  program: string;
  attributes: Attribute[];
  enrollments: IEnrollment[];
  latestEnrollment: Enrollment;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
  trackedEntityType: string;
  trackedEntity: string;
  trackedEntityInstance?: string;
  _events: any[];
  ownerOrgUnit: string;
  orgUnit: string;
  orgUnitName: string;
  relatedEntities?: TrackerRelationship[];
  metaData?: Record<string, unknown>;
  fields?: Record<string, TrackerFieldProperty>;
  get attributeEntities(): AttributeEntity;
  get dataEntities(): Record<string, any>;
  get reportEntities(): Record<string, string>;
  spreadAttributes?: (attributes: any) => void;
  setAttributeValue?: (attribute: string, value: string, code?: string) => void;
  setEnrollment?: (enrollment: IEnrollment) => void;
  setEnrollmentDate?: (enrollmentDate: string) => void;
  setIncidentDate?: (incidentDate: string) => void;
  getEventByStage?: (programStage: string) => void;
  setEvent?: (event: IDHIS2Event) => void;
  setOrgUnit?: (orgUnit: string) => void;
  setProgramStageData?: (
    programStage: string,
    data: Record<string, any>
  ) => void;
  getEventsByProgramStage?: (programStage: string) => IDHIS2Event[];
  getRelatedEntitiesByType?: (relationshipType: string) => string[];
  setRelationship?: (relationship: TrackerRelationship) => void;
  toObject?: () => TrackedEntityInstanceObject;
}

export class TrackedEntityInstance
  extends BaseTrackerSDKModel<ITrackedEntityInstance>
  implements ITrackedEntityInstance
{
  program!: string;
  attributes!: Attribute[];
  enrollments!: IEnrollment[];
  latestEnrollment!: Enrollment;
  enrollmentDate!: string;
  updatedAt!: string;
  createdAt!: string;
  trackedEntityType!: string;
  trackedEntity!: string;
  trackedEntityInstance?: string;
  _events!: DHIS2Event[];
  ownerOrgUnit!: string;
  orgUnit!: string;
  orgUnitName!: string;
  relatedEntities?: TrackerRelationship[];
  fields: Record<string, TrackerFieldProperty> = DEFAULT_FIELD_PROPERTIES;
  [key: string]: any;

  protected _attributes!: Attribute[];
  protected _enrollments!: Enrollment[];
  protected _latestEnrollment!: Enrollment;

  constructor(
    trackedEntityInstanceObject?: Partial<TrackedEntityInstanceObject>
  ) {
    super(trackedEntityInstanceObject);
    if (!isEmpty(this)) {
      this.ownerOrgUnit = this.orgUnit;
      this.trackedEntity = this.trackedEntityInstance || this.trackedEntity;

      this.enrollments = EnrollmentUtil.getEnrollments(
        this.enrollments || [
          EnrollmentUtil.generate({
            date: new Date().toISOString(),
            program: this.program,
            trackedEntity: this.trackedEntity,
            trackedEntityType: this.trackedEntityType,
            orgUnit: this.orgUnit,
          }),
        ],
        { program: this.program, trackedEntityType: this.trackedEntityType }
      );

      this.latestEnrollment = EnrollmentUtil.getLatestEnrollment(
        this.enrollments.filter((enrollment) => {
          if (!this.program) {
            return true;
          }

          return enrollment.program === this.program;
        }) || []
      ) as Enrollment;

      if (!this.program && this.latestEnrollment) {
        this.program = this.latestEnrollment.program;
      }

      // Spread event data values as standalone attributes of the class
      this.#spreadEvents();

      // Spread enrollment data values as standalone attributes of the class
      Object.keys(this.latestEnrollment || {}).forEach((key) => {
        if (key !== 'orgUnit') {
          this[key] = (this.latestEnrollment as any)[key];
        }
      });

      this.orgUnitName = this.latestEnrollment?.orgUnitName as string;
      this.relatedEntities = TrackerRelationshipUtil.getRelationships(
        this['relationships'] || [],
        this.trackedEntity
      );

      this.spreadAttributes!(this.attributes || []);
    }
  }

  #spreadEvents() {
    (
      Object.keys(this.latestEnrollment?.programStageEvents || {}) || []
    ).forEach((stageKey) => {
      const stageEvent = ((this.latestEnrollment?.programStageEvents || {})[
        stageKey
      ]?.events || [])[0];

      Object.keys(stageEvent?.dataValueEntities || {}).forEach(
        (dataValueKey) => {
          this[dataValueKey] = stageEvent[dataValueKey];
        }
      );
    });
  }

  get attributeEntities(): AttributeEntity {
    return AttributeUtil.getAttributeEntities(this.attributes);
  }

  get dataEntities(): Record<string, any> {
    return { ...this.attributeEntities };
  }

  get reportEntities(): Record<string, string> {
    return {
      orgUnit: this.orgUnit,
      orgUnitName: this.orgUnitName,
      enrollmentDate: this.enrollmentDate,
      incidentDate: this['incidentDate'],
    };
  }

  spreadAttributes?(attributes: any[]) {
    attributes.forEach((attribute) => {
      if (attribute.code) {
        this[camelCase(attribute.code)] = attribute.value;
      } else {
        this[attribute.attribute] = attribute.value;
      }
    });
  }

  setOrgUnit(orgUnit: string) {
    if (!this.orgUnit) {
      this.orgUnit = orgUnit;
    }

    if (this.latestEnrollment) {
      this.latestEnrollment.orgUnit = orgUnit;

      this.latestEnrollment.events = this.latestEnrollment.events.map(
        (event) => {
          return { ...event, orgUnit };
        }
      );
    }
  }

  setAttributeValue(attribute: string, value: string, code?: string) {
    this.attributes = AttributeUtil.setAttributeValue(
      this.attributes,
      attribute,
      value,
      code
    );
    if (this.spreadAttributes)
      this.spreadAttributes([{ attribute, code, value }]);
  }

  setEnrollment(enrollment: IEnrollment) {
    enrollment.attributes = this.attributes;
    const availableEnrollment = (this.enrollments || []).find(
      (enrollmentItem) => enrollmentItem.enrollment === enrollment.enrollment
    );

    const enrollmentIndex = (this.enrollments || []).indexOf(
      availableEnrollment as IEnrollment
    );

    if (enrollmentIndex !== -1) {
      this.enrollments[enrollmentIndex] = enrollment;
    } else {
      this.enrollments.push(enrollment);
    }

    this.enrollments = EnrollmentUtil.sortEnrollments(this.enrollments);

    this.latestEnrollment = EnrollmentUtil.getLatestEnrollment(
      this.enrollments
    ) as Enrollment;
  }

  setRelationship?(relationship: TrackerRelationship) {
    const availableRelatedEntity = (this.relatedEntities || []).find(
      (relatedEntity) =>
        relatedEntity.relationship === relationship.relationship
    );
    const relatedEntityIndex = (this.relatedEntities || []).indexOf(
      availableRelatedEntity as TrackerRelationship
    );

    this.relatedEntities =
      relatedEntityIndex !== -1
        ? [
            ...(this.relatedEntities || []).slice(0, relatedEntityIndex),
            relationship,
            ...(this.relatedEntities || []).slice(relatedEntityIndex + 1),
          ]
        : [...(this.relatedEntities || []), relationship];
  }

  setEnrollmentDate(enrollmentDate: string) {
    if (this.latestEnrollment) {
      this.latestEnrollment.enrolledAt = enrollmentDate;
      this.latestEnrollment.enrollmentDate = enrollmentDate;
    }
  }

  setIncidentDate(incidentDate: string) {
    if (this.latestEnrollment) {
      this.latestEnrollment.occurredAt = incidentDate;
      this.latestEnrollment.incidentDate = incidentDate;
    }
  }

  setFields(program: Program) {
    this.fields = {
      ...(this.fields || {}),
      ...(program.dataElements || []).reduce((fieldObject, dataElement) => {
        const key = dataElement.code
          ? camelCase(dataElement.code)
          : dataElement.id;
        return {
          ...fieldObject,
          [key]: {
            id: dataElement.id,
            type: 'DATA_ELEMENT',
            stageId: dataElement.programStageId,
          },
        };
      }, {}),
      ...(program.trackedEntityAttributes || []).reduce(
        (fieldObject, trackedEntityAttribute) => {
          const key = trackedEntityAttribute.code
            ? camelCase(trackedEntityAttribute.code)
            : trackedEntityAttribute.id;
          return {
            ...fieldObject,
            [key]: {
              id: trackedEntityAttribute.id,
              type: 'ATTRIBUTE',
              generated: trackedEntityAttribute.generated,
            },
          };
        },
        {}
      ),
    };
  }

  complete() {
    if (this.latestEnrollment) {
      this.latestEnrollment.status = 'COMPLETED';
    }
  }

  getEventByStage?(programStage: string) {
    return (
      this._events.find((event) => event.programStage === programStage) || {
        dataValues: [],
        programStage,
      }
    );
  }

  setEvent(event: IDHIS2Event) {
    if (this.latestEnrollment) {
      this.latestEnrollment.setEvent(event);
    }
  }

  setProgramStageData(programStage: string, data: Record<string, any>) {
    if (this.latestEnrollment) {
      this.latestEnrollment.setProgramStageData(programStage, data as any);
    }
  }

  getEventsByProgramStage(programStage: string): IDHIS2Event[] {
    if (this.latestEnrollment) {
      return this.latestEnrollment.getEventsByProgramStage(programStage);
    }
    return [];
  }

  getRelatedEntitiesByType?(relationshipType: string) {
    return (this.relatedEntities || [])
      .filter(
        (relatedEntity) => relatedEntity.relationshipType === relationshipType
      )
      .map((relatedEntity) => relatedEntity.trackedEntityInstance);
  }

  updateDataValues(dataValueEntities: Record<string, unknown>) {
    const dataValueKeys = Object.keys(dataValueEntities);

    dataValueKeys.forEach((key) => {
      const dataValue = dataValueEntities[key] as string;
      const field = (this.fields || {})[key];

      switch (field?.type) {
        case 'ATTRIBUTE': {
          this.setAttributeValue(field.id, dataValue);
          break;
        }
        case 'DATA_ELEMENT': {
          this.setDataValue(field.id, dataValue, field.stageId!);
          break;
        }
        case 'ENROLLMENT_DATE':
          this.setEnrollmentDate(dataValue);
          break;
        case 'INCIDENT_DATE':
          this.setIncidentDate(dataValue);
          break;
        case 'ORG_UNIT':
          this.setOrgUnit(dataValue);
          break;

        default: {
          if (isArray(dataValue)) {
            (dataValue as Record<string, unknown>[]).forEach((data) => {
              this.updateDataValues(data);
            });
          } else if (isPlainObject(dataValue)) {
            this.updateDataValues(
              dataValue as unknown as Record<string, unknown>
            );
          }
          break;
        }
      }
    });
  }

  setDataValue(
    dataElement: string,
    value: string,
    programStage: string,
    eventId?: string
  ) {
    if (this.latestEnrollment) {
      this.latestEnrollment.setDataValue(
        dataElement,
        value,
        programStage,
        eventId
      );
    }
  }

  // TODO: Make this dynamic so in the future user does not have to supply attribute type
  toReadable(attributeName: string, attributeType: 'DATE' | 'BOOLEAN') {
    switch (attributeType) {
      case 'DATE': {
        try {
          return format(new Date(this[attributeName]), 'MMMM dd, yyyy');
        } catch (_e) {
          return this[attributeName];
        }
      }
      case 'BOOLEAN': {
        try {
          return JSON.parse(this[attributeName].toLowerCase());
        } catch (_e) {
          return this[attributeName];
        }
      }
      default:
        return this[attributeName];
    }
  }

  toObject(options?: {
    skipAttributes?: boolean;
  }): TrackedEntityInstanceObject {
    if (this.latestEnrollment) {
      this.setEnrollment(this.latestEnrollment);
    }

    return {
      trackedEntity: this.trackedEntity,
      trackedEntityType: this.trackedEntityType,
      orgUnit: this?.orgUnit,
      enrollments: this.enrollments
        .map((enrollment) =>
          enrollment.toObject ? enrollment.toObject() : null
        )
        .filter(
          (enrollment) => enrollment?.program === this.program
        ) as IEnrollment[],
      attributes: options?.skipAttributes
        ? []
        : AttributeUtil.sanitizeAttributes(this.attributes),
      relationships: (this.relatedEntities || []).map((relatedEntity) =>
        relatedEntity.toObject()
      ),
    };
  }

  toTrackedEntity(): Partial<TrackedEntityInstanceObject> {
    return {
      trackedEntity: this.trackedEntity,
      trackedEntityType: this.trackedEntityType,
      orgUnit: this.orgUnit,
      attributes: this.attributes,
    };
  }
}
