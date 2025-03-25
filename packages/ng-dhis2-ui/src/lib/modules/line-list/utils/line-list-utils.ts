// src/utils/line-list-utils.ts
import { FilterConfig } from '../models/filter-config.model';
import {
  LineListResponse,
  ColumnDefinition,
  TableRow,
  EventsResponse,
  TrackedEntityInstancesResponse,
  TrackedEntityResponse,
} from '../models/line-list.models';
import { getFilteredTrackedEntites, getFilteredTrackedEntityInstances } from './filter-builder';

export const getProgramStageData = (
  response: LineListResponse,
  programStageId: string,
  pager: any
): { columns: ColumnDefinition[]; data: TableRow[] } => {
  const events = (response.data as EventsResponse).events;
  const allDataElements = new Set<string>();
  events.forEach((event: any) => {
    event.dataValues.forEach((dv: any) => allDataElements.add(dv.dataElement));
  });

  const stageFromMetaData = response.metadata.programStages.find(
    (stage: any) => stage.id === programStageId
  );

  if (!stageFromMetaData) {
    throw new Error(`Program stage with ID ${programStageId} not found`);
  }

  const entityColumns = Array.from(allDataElements).map(
    (dataElementId: string) => ({
      label:
        stageFromMetaData.programStageDataElements.find(
          (psde: any) => psde.dataElement.id === dataElementId
        )?.dataElement.name || dataElementId,
      key: dataElementId,
    })
  );

  const dataElementsData: TableRow[] = events.map((event: any, idx: number) => {
    let row: TableRow = {
      event: event.event,
      index: (pager.page - 1) * pager.pageSize + idx + 1,
    };
    allDataElements.forEach(
      (dataElementId: string) => (row[dataElementId] = '')
    );
    event.dataValues.forEach((dv: any) => (row[dv.dataElement] = dv.value));
    return row;
  });

  return { columns: entityColumns, data: dataElementsData };
};

export const getTrackedEntityData = (
  response: LineListResponse,
  programId: string,
  pager: any,
  filters?: FilterConfig[]
): {
  columns: ColumnDefinition[];
  data: TableRow[];
  filteredEntityColumns: ColumnDefinition[];
} => {
  let teis = (response.data as TrackedEntityResponse)
    .trackedEntities;

  let programMetaData = response.metadata.programTrackedEntityAttributes;

  // //organisation units from metadata
  // let orgUnitsFromMetaData = response.metadata.organisationUnits;

  // //a Map to efficiently look up orgUnit names by ID
  // const orgUnitMap = new Map<string, string>(
  //   orgUnitsFromMetaData.map((ou: { id: string; name: string }) => [
  //     ou.id,
  //     ou.name,
  //   ])
  // );

   const orgUnitMap = (response.data as TrackedEntityResponse).orgUnitsMap;

  const mappedProgramMetadataAttributes = programMetaData.map((attr) => ({
    displayInList: attr.displayInList,
    searchable: attr.searchable,
    id: attr.trackedEntityAttribute.id,
  }));

  const programAttributesMap = programMetaData.reduce(
    (acc: { [key: string]: string }, attribute: any) => {
      if (attribute.displayInList) {
        acc[attribute.id] = attribute.displayName;
      }
      return acc;
    },
    {}
  );

  if (filters) {
    teis = getFilteredTrackedEntites(teis, filters);
  }

  const allAttributes = new Set<string>();

  teis.forEach((tei: any) => {
    const matchingEnrollment = tei.enrollments.find(
      (enrollment: any) => enrollment.program === programId
    );
    const attributes = matchingEnrollment
      ? matchingEnrollment.attributes
      : tei.attributes;
    attributes.forEach((attr: any) => allAttributes.add(attr.attribute));
  });

  let entityColumns = Array.from(allAttributes).map((attrId: string) => {
    const foundAttribute = teis
      .flatMap((tei: any) => {
        const matchingEnrollment = tei.enrollments.find(
          (enrollment: any) => enrollment.program === programId
        );
        return matchingEnrollment
          ? matchingEnrollment.attributes
          : tei.attributes;
      })
      .find((attr: any) => attr.attribute === attrId);

    return {
      label: foundAttribute?.displayName || attrId,
      key: attrId,
    };
  });

  entityColumns = entityColumns.filter((column) => {
    // Check if the column label is part of any value in programAttributesMap
    return Object.values(programAttributesMap).some((value: string) =>
      value.includes(column.label)
    );
  });

  // Add orgUnit as the first column
  entityColumns.unshift({
    label: 'Location',
    key: 'orgUnit',
  });

  const searchableAttributes = mappedProgramMetadataAttributes
    .filter((attr) => attr.searchable && attr.displayInList)
    .map((attr) => ({
      //  label: attr.trackedEntityAttribute.displayName,
      key: attr.id,
    }));

  // Extract keys from searchableAttributes for quick lookup
  const searchableKeys = new Set(searchableAttributes.map((attr) => attr.key));

  // Filter entityColumns to keep only those whose key exists in searchableAttributes
  const filteredEntityColumns = entityColumns.filter((column) =>
    searchableKeys.has(column.key)
  );

  const attributesData = teis.map((tei: any, idx: number) => {
    let row: TableRow = {
      trackedEntityInstance: tei.trackedEntityInstance,
      index: (pager.page - 1) * pager.pageSize + idx + 1,
    };

    allAttributes.forEach((attrId: string) => (row[attrId] = ''));

    const matchingEnrollment = tei.enrollments.find(
      (enrollment: any) => enrollment.program === programId
    );
    const attributesToUse = matchingEnrollment
      ? matchingEnrollment.attributes
      : tei.attributes;

    attributesToUse.forEach((attr: any) => (row[attr.attribute] = attr.value));

    //include orgUnit in the row for id access
    row['orgUnitId'] = matchingEnrollment.orgUnit;
    // Access the name of the orgUnit using the Map
  //  row['orgUnit'] = matchingEnrollment.orgUnitName;
   row['orgUnit'] = orgUnitMap?.get(matchingEnrollment.orgUnit) || 'N/A';
  //  row['orgUnit'] =
  // orgUnitMap && orgUnitMap[matchingEnrollment.orgUnit]
  //   ? orgUnitMap[matchingEnrollment.orgUnit]
  //   : 'N/A';

    return row;
  });
  return {
    columns: entityColumns,
    data: attributesData,
    filteredEntityColumns: filteredEntityColumns,
  };
};

export const getEventData = (
  response: LineListResponse,
  pager: any
): { columns: ColumnDefinition[]; data: TableRow[] } => {
  const events = (response.data as EventsResponse).events;
  const uniqueDataElements = new Set<string>();
  events.forEach((event: any) => {
    event.dataValues.forEach((dv: any) =>
      uniqueDataElements.add(dv.dataElement)
    );
  });

  const entityColumns = Array.from(uniqueDataElements).map(
    (dataElement: string) => ({
      label:
        response.metadata.programStages[0].programStageDataElements.find(
          (psde: any) => psde.dataElement.id === dataElement
        )?.dataElement.name || dataElement,
      key: dataElement,
    })
  );

  const dataElementsData = events.map((event: any, idx: number) => {
    let row: TableRow = {
      event: event.event,
      index: (pager.page - 1) * pager.pageSize + idx + 1,
    };
    uniqueDataElements.forEach(
      (dataElement: string) => (row[dataElement] = '')
    );
    event.dataValues.forEach((dv: any) => (row[dv.dataElement] = dv.value));
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
