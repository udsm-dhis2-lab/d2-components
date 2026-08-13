import { Program } from '@iapps/d2-web-sdk';
import { FilterConfig } from '../models/filter-config.model';
import {
  LineListResponse,
  ColumnDefinition,
  TableRow,
  EventsResponse,
} from '../models/line-list.models';
import {
  LineListColumnMetadataDisplayMode,
  LineListColumnMetadataDisplayModeValue,
} from '../models/line-list-column-metadata-display-mode.model';
import { formatMultiTextOptionValue } from './multi-text-option.util';

export const getEvents = (
  response: LineListResponse,
  programStageId: string,
  pager: any,
  metaData: Program,
  columnNameSource: 'NAME' | 'FORM_NAME' = 'NAME',
  columnMetadataDisplayMode?: LineListColumnMetadataDisplayModeValue
): { columns: ColumnDefinition[]; data: TableRow[] } => {
  const getColumnLabel = (item?: {
    name?: string;
    formName?: string;
  }): string =>
    columnNameSource === 'FORM_NAME'
      ? item?.formName || item?.name || 'Default'
      : item?.name || item?.formName || 'Default';

  const eventsRaw = (response.data as EventsResponse).events;
  const events = Array.isArray(eventsRaw)
    ? eventsRaw
    : [eventsRaw].filter(Boolean);

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

  const shouldShowAllDataElements =
    columnMetadataDisplayMode ===
    LineListColumnMetadataDisplayMode.ALL_ATTRIBUTES_AND_DATA_ELEMENTS;

  const dataElementMetaList = stageFromMetaData
    .programStageDataElements!.filter((psde: any) =>
      shouldShowAllDataElements ? true : psde.displayInReports === true
    )
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  const displayedDataElementIds = new Set(
    dataElementMetaList.map((psde: any) => psde.dataElement.id)
  );

  const entityColumns = dataElementMetaList.map((psde: any) => ({
    label: getColumnLabel(psde.dataElement),
    key: psde.dataElement.id,
  }));

  const dataElementsData: TableRow[] = events.map((event: any, idx: number) => {
    const row: TableRow = {
      event: { value: event.event },
      responseData: {
        value: event,
      },
      index: {
        value: (pager.page - 1) * pager.pageSize + idx + 1,
      },
    };

    displayedDataElementIds.forEach((dataElementId: string) => {
      row[dataElementId] = { value: '' };
    });

    (event.dataValues || []).forEach((dv: any) => {
      if (!displayedDataElementIds.has(dv.dataElement)) {
        return;
      }

      const dataElementMeta = stageFromMetaData.programStageDataElements!.find(
        (psde: any) => psde.dataElement.id === dv.dataElement
      );

      if (dataElementMeta?.dataElement.optionSet) {
        const optionSet = dataElementMeta.dataElement.optionSet;

        if (dataElementMeta.dataElement.valueType === 'MULTI_TEXT') {
          row[dv.dataElement] = {
            value: formatMultiTextOptionValue(dv.value, optionSet.options),
          };
        } else {
          const matchingOption = optionSet.options.find(
            (option: any) => option.code === dv.value
          );

          row[dv.dataElement] = matchingOption
            ? { value: matchingOption.name }
            : { value: dv.value };
        }
      } else {
        row[dv.dataElement] = { value: dv.value };
      }
    });

    return row;
  });

  return { columns: entityColumns, data: dataElementsData };
};
