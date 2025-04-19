import { Program } from '@iapps/d2-web-sdk';
import { FilterConfig } from '../models/filter-config.model';
import {
  LineListResponse,
  ColumnDefinition,
  TableRow,
  EventsResponse,
} from '../models/line-list.models';

export const getEvents = (
  response: LineListResponse,
  programStageId: string,
  pager: any,
  metaData: Program
): { columns: ColumnDefinition[]; data: TableRow[] } => {
  const events = (response.data as EventsResponse).events;
  const eventsiiii = response.data;
  const allDataElements = new Set<string>();

  events.forEach((event: any) => {
    event.dataValues.forEach((dv: any) => allDataElements.add(dv.dataElement));
  });

  let stageFromMetaData;
  if (programStageId) {
    stageFromMetaData = metaData.programStages!.find(
      (stage: any) => stage.id === programStageId
    );
  } else if (metaData.programType === 'WITHOUT_REGISTRATION') {
    stageFromMetaData = metaData.programStages![0];
  }

  if (!stageFromMetaData) {
    throw new Error(`Program stage with ID ${programStageId} not found`);
  }

  const entityColumns = Array.from(allDataElements).map(
    (dataElementId: string) => {
      const dataElementMeta = stageFromMetaData.programStageDataElements!.find(
        (psde: any) => psde.dataElement.id === dataElementId
      );

      return {
        label: dataElementMeta?.dataElement.name || dataElementId,
        key: dataElementId,
      };
    }
  );

  const dataElementsData: TableRow[] = events.map((event: any, idx: number) => {
    const row: TableRow = {
      event: { value: event.event },
      index: {
        value: (pager.page - 1) * pager.pageSize + idx + 1,
      },
    };

    allDataElements.forEach((dataElementId: string) => {
      row[dataElementId] = { value: '' };
    });

    event.dataValues.forEach((dv: any) => {
      const dataElementMeta = stageFromMetaData.programStageDataElements!.find(
        (psde: any) => psde.dataElement.id === dv.dataElement
      );

      if (dataElementMeta?.dataElement.optionSet) {
        const optionSet = dataElementMeta.dataElement.optionSet;
        const matchingOption = optionSet.options.find(
          (option: any) => option.code === dv.value
        );

        row[dv.dataElement] = matchingOption
          ? { value: matchingOption.name }
          : { value: dv.value };
      } else {
        row[dv.dataElement] = { value: dv.value };
      }
    });

    return row;
  });


  return { columns: entityColumns, data: dataElementsData };
};
