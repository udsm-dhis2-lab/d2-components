import {
    Program,
  } from '@iapps/d2-web-sdk';
  import { FilterConfig } from '../models/filter-config.model';
  import {
    LineListResponse,
    ColumnDefinition,
    TableRow,
    EventsResponse,
  } from '../models/line-list.models';

//TODO: Convert it to use tracker sdk models and get data from tracker sdk event query 

export const getEventData = (
  response: LineListResponse,
  pager: any,
  metaData: Program,
  isOptionSetNameVisible: boolean
): { columns: ColumnDefinition[]; data: TableRow[] } => {
  const events = (response.data as EventsResponse).events;
  const uniqueDataElements = new Set<string>();

  events?.forEach((event: any) => {
    event?.dataValues.forEach((dv: any) =>
      uniqueDataElements.add(dv.dataElement)
    );
  });

  const entityColumns = Array.from(uniqueDataElements).map(
    (dataElement: string) => ({
      label:
        metaData.programStages![0].programStageDataElements!.find(
          (psde: any) => psde.dataElement.id === dataElement
        )?.dataElement.name || dataElement,
      key: dataElement,
    })
  );

  const dataElementsData = events.map((event: any, idx: number) => {
    const row: TableRow = {
      event: { value: event.event, style: 'event-style' },
      index: {
        value: (pager.page - 1) * pager.pageSize + idx + 1,
        style: 'index-style',
      },
    };

    uniqueDataElements.forEach((dataElement: string) => {
      row[dataElement] = { value: '', style: 'default-style' };
    });

    event.dataValues.forEach((dv: any) => {
      if (isOptionSetNameVisible && dv.optionSetValue) {
        const dataElementMetadata = metaData
          .programStages!.flatMap(
            (programStage: any) => programStage.programStageDataElements
          )
          .find((psde: any) => psde.dataElement.id === dv.dataElement)
          ?.dataElement.optionSet;

        if (dataElementMetadata && dataElementMetadata.options) {
          const matchingOption = dataElementMetadata.options.find(
            (option: any) => option.code === dv.value
          );

          if (matchingOption) {
            row[dv.dataElement] = matchingOption.name;
          } else {
            row[dv.dataElement] = dv.value;
          }
        } else {
          row[dv.dataElement] = dv.value;
        }
      } else {
        row[dv.dataElement] = dv.value;
      }
    });

    return row;
  });

  return { columns: entityColumns, data: dataElementsData };
};


export const getProgramStageData = (
  response: LineListResponse,
  programStageId: string,
  pager: any,
  metaData: Program,
  isOptionSetNameVisible: boolean
): { columns: ColumnDefinition[]; data: TableRow[] } => {
  const events = (response.data as EventsResponse).events;
  const allDataElements = new Set<string>();

  events.forEach((event: any) => {
    event.dataValues.forEach((dv: any) => allDataElements.add(dv.dataElement));
  });

  const stageFromMetaData = metaData.programStages!.find(
    (stage: any) => stage.id === programStageId
  );

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
      event: { value: event.event, style: 'default-style' },
      index: {
        value: (pager.page - 1) * pager.pageSize + idx + 1,
        style: 'default-style',
      },
    };

    allDataElements.forEach((dataElementId: string) => {
      row[dataElementId] = { value: '', style: 'default-style' };
    });

    event.dataValues.forEach((dv: any) => {
      const dataElementMeta = stageFromMetaData.programStageDataElements!.find(
        (psde: any) => psde.dataElement.id === dv.dataElement
      );

      if (isOptionSetNameVisible && dataElementMeta?.dataElement.optionSet) {
        const optionSet = dataElementMeta.dataElement.optionSet;

        const matchingOption = optionSet.options.find(
          (option: any) => option.code === dv.value
        );

        row[dv.dataElement] = matchingOption ? matchingOption.name : dv.value;
      } else {
        row[dv.dataElement] = dv.value;
      }
    });

    return row;
  });

  return { columns: entityColumns, data: dataElementsData };
};