// src/utils/line-list-utils.ts
import {
  Attribute,
  DataValue,
  IEnrollment,
  Program,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import { FilterConfig } from '../models/filter-config.model';
import {
  LineListResponse,
  ColumnDefinition,
  TableRow,
  EventsResponse,
  TrackedEntityInstancesResponse,
  TrackedEntityResponse,
  Enrollment,
  TrackedEntity,
} from '../models/line-list.models';
import {
  getFilteredTrackedEntites,
  getFilteredTrackedEntityInstances,
} from './filter-builder';
import { parse, format } from 'date-fns';

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

export const getTrackedEntityData = (
  response: LineListResponse,
  programId: string,
  pager: any,
  isOptionSetNameVisible: boolean,
  metaData: Program,
  filters?: FilterConfig[]
): {
  columns: ColumnDefinition[];
  data: TableRow[];
  filteredEntityColumns: ColumnDefinition[];
  orgUnitLabel: string;
} => {
  let teisRaw = (response.data as TrackedEntityInstancesResponse)
    .trackedEntityInstances;
  const teis: TrackedEntityInstance[] = Array.isArray(teisRaw)
    ? teisRaw
    : [teisRaw];

  const programMetaData = metaData.programTrackedEntityAttributes;
  const orgUnitLabel = metaData.orgUnitLabel as string;
  const orgUnitMap = (response.data as TrackedEntityInstancesResponse)
    .orgUnitsMap;

  let entityColumns = metaData.displayInListTrackedEntityAttributes
    .sort((a, b) => a.sortOrder! - b.sortOrder!)
    .map((attr) => ({
      label: attr.name,
      key: attr.id,
    }));

  let dataElementColumns = metaData.displayInListDataElements
    .sort((a, b) => a.sortOrder! - b.sortOrder!)
    .map((element) => ({
      label: element.name,
      key: element.id,
    }));

  let dataElementOptions = metaData.displayInListDataElements.map(
    (element) => ({
      id: element.id,
      options: element.optionSet?.options.map((opt) => ({
        name: opt.name,
        color: opt.style?.color,
      })),
    })
  );

  entityColumns = [...entityColumns, ...dataElementColumns];

  entityColumns.unshift({
    label: orgUnitLabel || 'registering unit',
    key: 'orgUnit',
  });

  console.log('filtered entity columns', entityColumns);

  const filteredEntityColumns = metaData.searchableTrackedEntityAttributes
    .sort((a, b) => a.sortOrder! - b.sortOrder!)
    .map((attr) => ({
      label: attr.name,
      key: attr.id,
      valueType: attr.valueType,
      options: attr.optionSet ?? undefined,
    }));

  console.log('filtered entity columns', filteredEntityColumns);

  const attributesData = teis.map((tei: TrackedEntityInstance, idx: number) => {
    const row: TableRow = {
      trackedEntityInstance: { value: tei.trackedEntity },
      index: { value: (pager.page - 1) * pager.pageSize + idx + 1 },
    };
    console.log('tei to use', tei);
    const matchingEnrollment = tei.enrollments.find(
      (enrollment: IEnrollment) => enrollment.program === programId
    );
    console.log('matching enrollment', matchingEnrollment);

    let attributesToUse = tei.latestEnrollment.attributes;
    console.log('the attributes', attributesToUse);

    let dataElementsToUse = matchingEnrollment!.events.flatMap(
      (event) => event.dataValues
    );

    //TODO: find a better way to do optimize this date parsing
    //map any date that occur in the attributes to dd-mm-yyyy
    attributesToUse = attributesToUse!.map((attr: any) => {
      // Check if the attribute is of type DATE
      if (attr?.valueType === 'DATE' || attr?.valueType === 'date') {
        try {
          // Parse the date and format it as dd-MM-yyyy
          const parsedDate = parse(attr.value, 'yyyy-MM-dd', new Date());
          const formattedDate = format(parsedDate, 'dd-MM-yyyy');
          // Update the value to the formatted date
          return {
            ...attr,
            value: formattedDate,
          };
        } catch {
          // If parsing fails, keep the original value
          return {
            ...attr,
            value: attr.value,
          };
        }
      }

      // If not a date, just return the attribute as is
      return attr;
    });

    // // If option set names are visible, transform the attribute values
    if (isOptionSetNameVisible) {
      attributesToUse.forEach((attr: any) => {
        const attributeMeta = programMetaData!.find(
          (metadata) => metadata.trackedEntityAttribute.id === attr.attribute
        );

        //     // Check if the attribute has an option set and map value to option name
        if (attributeMeta?.trackedEntityAttribute.optionSetValue) {
          const optionSet = attributeMeta?.trackedEntityAttribute?.optionSet;
          const option = optionSet?.options?.find(
            (option) => option.code === attr.value
          );
          row[attr.attribute] = option ? option.name : attr.value;
        } else {
          row[attr.attribute] = attr.value;
        }
      });
    } else {
      // Map attributes to the row with style
      // attributesToUse.forEach((attr: Attribute) => {
      //   row[attr.attribute] = { value: attr.value };
      // });
      attributesToUse.forEach((attr: Attribute) => {
        row[attr.attribute] = { value: attr.value };
      });

      dataElementsToUse.forEach((element: DataValue) => {
        // Find the matching data element in dataElementOptions by ID
        const dataElementOption = dataElementOptions.find(
          (deo) => deo.id === element.dataElement
        );

        // Try to find a matching option within that data element's options
        const matchingOption = dataElementOption?.options?.find(
          (opt) => opt.name === element.value
        );

        // Build the row entry with value and optionally style
        if (matchingOption) {
          row[element.dataElement] = {
            value: element.value,
            style: matchingOption.color,
          };
        } else {
          row[element.dataElement] = {
            value: element.value,
          };
        }
      });
    }

    // Include orgUnit in the row for id access with style
    row['orgUnitId'] = { value: matchingEnrollment!.orgUnit };
    row['orgUnit'] = {
      value: orgUnitMap?.get(matchingEnrollment!.orgUnit) || 'N/A',
    };

    return row;
  });

  return {
    columns: entityColumns,
    data: attributesData,
    filteredEntityColumns: filteredEntityColumns,
    orgUnitLabel: orgUnitLabel,
  };
};

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

export const addActionsColumn = (
  columns: ColumnDefinition[],
  actionOptions?: any[]
): ColumnDefinition[] => {
  return [
    ...columns,
    ...(actionOptions && actionOptions.length > 0
      ? [{ label: 'Actions', key: 'actions' }]
      : []),
  ];
};
