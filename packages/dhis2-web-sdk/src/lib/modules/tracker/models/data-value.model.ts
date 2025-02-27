import { flatten } from 'lodash';
import { DHIS2Event } from './event.model';

export interface DataValue {
  code?: string;
  lastUpdated?: string;
  storedBy?: string;
  created?: string;
  dataElement: string;
  value: string;
  providedElsewhere?: boolean;
  event?: string;
}

export class DataValueUtil {
  static getEventDataValueEntities(events: DHIS2Event[]): {
    [attribute: string]: string | number;
  } {
    return DataValueUtil.getDataValueEntities(
      flatten(events.map((event) => event.dataValues))
    );
  }

  static getDataValueEntities(dataValues: any[]) {
    return (dataValues || []).reduce((entity: any, dataValue: DataValue) => {
      return {
        ...entity,
        [dataValue.dataElement]: dataValue.value,
      };
    }, {});
  }

  static setEventDataValue(
    event: DHIS2Event,
    dataElement: string,
    value: string
  ) {
    if (!event) {
      return event;
    }

    let { dataValues } = event;
    const availableDataValue = (dataValues || []).find(
      (dataValue) => dataValue?.dataElement === dataElement
    );

    if (availableDataValue) {
      const dataValueIndex = dataValues.indexOf(availableDataValue);

      dataValues = [
        ...dataValues.slice(0, dataValueIndex),
        { ...availableDataValue, value },
        ...dataValues.slice(dataValueIndex + 1),
      ];
    } else {
      dataValues = [...dataValues, { dataElement, value }];
    }

    return {
      ...event,
      dataValues,
      dataValueEntities: DataValueUtil.getDataValueEntities(dataValues),
    };
  }
}
