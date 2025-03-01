// src/utils/line-list-utils.ts
import { LineListResponse, ColumnDefinition, TableRow, EventsResponse, TrackedEntityInstancesResponse } from '../models/line-list.models';

export const buildDataElementMap = (metadata: any, programStageId: string | undefined) => {
  if (programStageId) {
    const stageFromMetaData = metadata.programStages.find(
      (stage: any) => stage.id === programStageId
    );
    if (!stageFromMetaData) {
      throw new Error(`Program stage with ID ${programStageId} not found`);
    }
    return stageFromMetaData.programStageDataElements;
  }
  return metadata.programStages[0].programStageDataElements;
};

export const getProgramStageData = (
  response: LineListResponse, 
  programStageId: string, 
  pager: any
): { columns: ColumnDefinition[], data: TableRow[] } => {
  const events = (response.data as EventsResponse).events;
  const allDataElements = new Set<string>();
  events.forEach((event: any) => {
    event.dataValues.forEach((dv: any) =>
      allDataElements.add(dv.dataElement)
    );
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
    event.dataValues.forEach(
      (dv: any) => (row[dv.dataElement] = dv.value)
    );
    return row;
  });

  return { columns: entityColumns, data: dataElementsData };
};

export const getTrackedEntityData = (
  response: LineListResponse, 
  programId: string, 
  pager: any
): { columns: ColumnDefinition[], data: TableRow[] } => {
  const teis = (response.data as TrackedEntityInstancesResponse).trackedEntityInstances;
  const allAttributes = new Set<string>();

  teis.forEach((tei: any) => {
    const matchingEnrollment = tei.enrollments.find(
      (enrollment: any) => enrollment.program === programId
    );
    const attributes = matchingEnrollment
      ? matchingEnrollment.attributes
      : tei.attributes;
    attributes.forEach((attr: any) =>
      allAttributes.add(attr.attribute)
    );
  });

  const entityColumns = Array.from(allAttributes).map((attrId: string) => {
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

    attributesToUse.forEach(
      (attr: any) => (row[attr.attribute] = attr.value)
    );

    return row;
  });

  return { columns: entityColumns, data: attributesData };
};

export const getEventData = (
  response: LineListResponse, 
  pager: any
): { columns: ColumnDefinition[], data: TableRow[] } => {
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
    event.dataValues.forEach(
      (dv: any) => (row[dv.dataElement] = dv.value)
    );
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