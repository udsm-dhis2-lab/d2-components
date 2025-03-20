import { camelCase, isEmpty, isString, isUndefined } from 'lodash';
import { EventUtil } from '../utils/event.util';
import { BaseTrackerSDKModel } from '../../tracker/models/base.model';
import { DataValue } from './data-value.model';
import { generateUid } from '../../../shared';
import {
  DHIS2EventAssignedUser,
  DHIS2EventStatus,
  EventFieldProperty,
} from '../interfaces';

const DEFAULT_FIELD_PROPERTIES: Record<string, EventFieldProperty> = {
  occurredAt: {
    id: 'occurredAt',
    type: 'OCCURRED_DATE',
  },
  scheduledAt: {
    id: 'scheduledAt',
    type: 'SCHEDULED_DATE',
  },
  orgUnit: {
    id: 'orgUnit',
    type: 'ORG_UNIT',
  },
};

export interface IDHIS2Event {
  storedBy?: string;
  dueDate?: string;
  scheduledAt?: string;
  createdAtClient?: string;
  program: string;
  event: string;
  programStage: string;
  orgUnit: string;
  trackedEntity?: string;
  enrollment: string;
  enrollmentStatus?: string;
  status: DHIS2EventStatus;
  orgUnitName?: string;
  lastUpdatedAtClient?: string;
  eventDate: string;
  occurredAt: string;
  attributeCategoryOptions?: string;
  lastUpdated?: string;
  created?: string;
  completedDate?: string;
  deleted?: boolean;
  attributeOptionCombo?: string;
  completedBy?: string;
  dataValues: DataValue[];
  assignedUser?: DHIS2EventAssignedUser;
  dataValueEntities?: Record<string, DataValue>;
  notes?: any[];
  relationships?: any[];
  [key: string]: any;
  isCompleted: boolean;
  metaData?: Record<string, unknown>;
  fields?: Record<string, EventFieldProperty>;
  setDataValue?: (options: {
    dataElement: string;
    value: string;
    code?: string;
  }) => void;
  getDataValue?: (dataElement: string) => DataValue;

  setStatus?: (status: string) => void;
  toObject: () => Partial<IDHIS2Event>;
}

export class DHIS2Event
  extends BaseTrackerSDKModel<DHIS2Event>
  implements IDHIS2Event
{
  storedBy?: string;
  dueDate?: string;
  scheduledAt?: string;
  createdAtClient?: string;
  program!: string;
  event!: string;
  programStage!: string;
  orgUnit!: string;
  trackedEntity?: string;
  enrollment!: string;
  enrollmentStatus?: string;
  status!: DHIS2EventStatus;
  orgUnitName?: string;
  lastUpdatedAtClient?: string;
  eventDate!: string;
  occurredAt!: string;
  attributeCategoryOptions?: string;
  lastUpdated?: string;
  created?: string;
  completedDate?: string;
  deleted?: boolean;
  attributeOptionCombo?: string;
  completedBy?: string;
  dataValues!: DataValue[];
  assignedUser?: DHIS2EventAssignedUser;
  notes?: any[];
  relationships?: any[];
  [key: string]: any;
  fields: Record<string, EventFieldProperty> = DEFAULT_FIELD_PROPERTIES;
  dataValueEntities?: Record<string, DataValue>;

  constructor(
    eventDetails: Partial<DHIS2Event>,
    config?: { skipAutoGeneration?: boolean; generateIdIfNotExists?: boolean }
  ) {
    if (isEmpty(eventDetails) && !config?.skipAutoGeneration) {
      eventDetails = EventUtil.generateEvent({
        program: '',
        programStage: '',
        orgUnit: '',
        trackedEntity: '',
        enrollment: '',
      });
    }
    super(eventDetails);

    if (!isEmpty(this)) {
      if (config?.generateIdIfNotExists && !this.event) {
        this.event = generateUid();
      }

      this.occurredAt =
        this.eventDate || this.occurredAt || new Date().toISOString();

      this.dueDate = this.dueDate || this.scheduledAt;
      (this.dataValues || []).forEach((dataValue) => {
        if (dataValue.code && dataValue.code.length > 0) {
          this[camelCase(dataValue.code)] = dataValue.value;
        }

        this[dataValue.dataElement] = dataValue.value;

        this.dataValueEntities = {
          ...this.dataValueEntities,
          [dataValue.dataElement]: { ...dataValue, event: this.event },
        };
      });
    }
  }

  complete() {
    this.status = 'COMPLETED';
  }

  get isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }

  setEventDate(eventDate: string) {
    this.eventDate = eventDate;
    this.occurredAt = this.eventDate;
  }

  setDataValue(options: { dataElement: string; value: string; code?: string }) {
    const { dataElement, value, code } = options;

    if (dataElement) {
      /**
       * This assignment is intended to simply make the value available as instance property,
       * so that one can directly access without looping through data values
       */

      this[dataElement] = value;
      const availableDataValue: any = this.dataValues?.find(
        (dataValue) => dataValue.dataElement === dataElement
      );

      const dataValueIndex = (this.dataValues || []).indexOf(
        availableDataValue
      );

      this.dataValues =
        dataValueIndex !== -1
          ? [
              ...(this.dataValues || []).slice(0, dataValueIndex),
              { ...availableDataValue, value },
              ...(this.dataValues || []).slice(dataValueIndex + 1),
            ]
          : [...(this.dataValues || []), { dataElement, value, code }];
    }
  }

  getDataValue(dataElement: string): DataValue {
    return (this.dataValues || []).find(
      (dataValue) => dataValue.dataElement === dataElement
    ) as any;
  }

  updateDataValues(dataValueEntities: Record<string, unknown>) {
    const dataValueKeys = Object.keys(dataValueEntities);

    dataValueKeys.forEach((key) => {
      const dataValue = dataValueEntities[key] as string;
      if (dataValue && dataValue.length > 0) {
        const field = (this.fields || {})[key];
        switch (field?.type) {
          case 'DATA_ELEMENT':
            this.setDataValue({ dataElement: field.id, value: dataValue });
            break;
          case 'OCCURRED_DATE':
            this.occurredAt = dataValue;
            break;
          case 'SCHEDULED_DATE':
            this.scheduledAt = dataValue;
            break;
          case 'ORG_UNIT':
            this.orgUnit = dataValue;
            break;
        }
      }
    });
  }

  setStatus(status?: string) {
    this.status = status as any;
  }

  toObject(): Partial<DHIS2Event> {
    const dataValues = (this.dataValues || []).filter((dataValue) => {
      return !isUndefined(dataValue.value) && dataValue.value !== '';
    });

    return {
      event: this.event,
      status: this.status,
      program: this.program,
      programStage: this.programStage,
      enrollment: this.enrollment,
      trackedEntity: this.trackedEntity,
      orgUnit: this.orgUnit,
      occurredAt: this.occurredAt,
      scheduledAt: this.dueDate,
      dataValues,
      assignedUser: this.assignedUser
        ? {
            uid: isString(this.assignedUser as unknown)
              ? (this.assignedUser as unknown as string)
              : this.assignedUser.uid,
          }
        : undefined,
    };
  }
}
