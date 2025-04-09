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
import {
  getFilteredTrackedEntites,
  getFilteredTrackedEntityInstances,
} from './filter-builder';
import { parse, format } from 'date-fns';

// export const getProgramStageData = (
//   response: LineListResponse,
//   programStageId: string,
//   pager: any,
//   isOptionSetNameVisible: boolean
// ): { columns: ColumnDefinition[]; data: TableRow[] } => {
//   const events = (response.data as EventsResponse).events;
//   const allDataElements = new Set<string>();
//   events.forEach((event: any) => {
//     event.dataValues.forEach((dv: any) => allDataElements.add(dv.dataElement));
//   });

//   const stageFromMetaData = response.metadata.programStages.find(
//     (stage: any) => stage.id === programStageId
//   );

//   if (!stageFromMetaData) {
//     throw new Error(`Program stage with ID ${programStageId} not found`);
//   }

//   const entityColumns = Array.from(allDataElements).map(
//     (dataElementId: string) => ({
//       label:
//         stageFromMetaData.programStageDataElements.find(
//           (psde: any) => psde.dataElement.id === dataElementId
//         )?.dataElement.name || dataElementId,
//       key: dataElementId,
//     })
//   );

//   const dataElementsData: TableRow[] = events.map((event: any, idx: number) => {
//     const row: TableRow = {
//       event: event.event,
//       index: (pager.page - 1) * pager.pageSize + idx + 1,
//     };
//     allDataElements.forEach(
//       (dataElementId: string) => (row[dataElementId] = '')
//     );

//     if (isOptionSetNameVisible) {
//       event.dataValues.forEach((dv: any) => (row[dv.dataElement] = dv.value));
//     } else {
//       event.dataValues.forEach((dv: any) => (row[dv.dataElement] = dv.value));

//     }
//     return row;
//   });

//   return { columns: entityColumns, data: dataElementsData };
// };

// export const getTrackedEntityData = (
//   response: LineListResponse,
//   programId: string,
//   pager: any,
//   isOptionSetNameVisible: boolean,
//   filters?: FilterConfig[]
// ): {
//   columns: ColumnDefinition[];
//   data: TableRow[];
//   filteredEntityColumns: ColumnDefinition[];
// } => {
//   let teis =
//     (response.data as TrackedEntityResponse)?.trackedEntities ??
//     (response.data as TrackedEntityResponse)?.instances ??
//     [];

//   const programMetaData = response.metadata.programTrackedEntityAttributes;

//   // //organisation units from metadata
//   // let orgUnitsFromMetaData = response.metadata.organisationUnits;

//   // //a Map to efficiently look up orgUnit names by ID
//   // const orgUnitMap = new Map<string, string>(
//   //   orgUnitsFromMetaData.map((ou: { id: string; name: string }) => [
//   //     ou.id,
//   //     ou.name,
//   //   ])
//   // );

//   const orgUnitMap = (response.data as TrackedEntityResponse).orgUnitsMap;

//   const mappedProgramMetadataAttributes = programMetaData.map((attr) => ({
//     displayInList: attr.displayInList,
//     searchable: attr.searchable,
//     id: attr.trackedEntityAttribute.id,
//   }));

//   const programAttributesMap = programMetaData.reduce(
//     (acc: { [key: string]: string }, attribute: any) => {
//       if (attribute.displayInList) {
//         acc[attribute.id] = attribute.displayName;
//       }
//       return acc;
//     },
//     {}
//   );

//   if (filters) {
//     teis = getFilteredTrackedEntites(teis, filters);
//   }

//   const allAttributes = new Set<string>();

//   teis.forEach((tei: any) => {
//     const matchingEnrollment = tei.enrollments.find(
//       (enrollment: any) => enrollment.program === programId
//     );
//     const attributes = matchingEnrollment
//       ? matchingEnrollment.attributes
//       : tei.attributes;
//     attributes.forEach((attr: any) => allAttributes.add(attr.attribute));
//   });

//   let entityColumns = Array.from(allAttributes).map((attrId: string) => {
//     const foundAttribute = teis
//       .flatMap((tei: any) => {
//         const matchingEnrollment = tei.enrollments.find(
//           (enrollment: any) => enrollment.program === programId
//         );
//         return matchingEnrollment
//           ? matchingEnrollment.attributes
//           : tei.attributes;
//       })
//       .find((attr: any) => attr.attribute === attrId);

//     return {
//       label: foundAttribute?.displayName || attrId,
//       key: attrId,
//     };
//   });

//   entityColumns = entityColumns.filter((column) => {
//     // Check if the column label is part of any value in programAttributesMap
//     return Object.values(programAttributesMap).some((value: string) =>
//       value.includes(column.label)
//     );
//   });

//   // Add orgUnit as the first column
//   entityColumns.unshift({
//     label: 'Location',
//     key: 'orgUnit',
//   });

//   const searchableAttributes = mappedProgramMetadataAttributes
//     .filter((attr) => attr.searchable && attr.displayInList)
//     .map((attr) => ({
//       //  label: attr.trackedEntityAttribute.displayName,
//       key: attr.id,
//     }));

//   // Extract keys from searchableAttributes for quick lookup
//   const searchableKeys = new Set(searchableAttributes.map((attr) => attr.key));

//   // Filter entityColumns to keep only those whose key exists in searchableAttributes
//   const filteredEntityColumns = entityColumns.filter((column) =>
//     searchableKeys.has(column.key)
//   );

//   const attributesData = teis.map((tei: any, idx: number) => {
//     const row: TableRow = {
//       trackedEntityInstance: tei.trackedEntity,
//       index: (pager.page - 1) * pager.pageSize + idx + 1,
//     };

//     allAttributes.forEach((attrId: string) => (row[attrId] = ''));

//     const matchingEnrollment = tei.enrollments.find(
//       (enrollment: any) => enrollment.program === programId
//     );
//     const attributesToUse = matchingEnrollment
//       ? matchingEnrollment.attributes
//       : tei.attributes;

//     console.log('RESPONSE::: ', JSON.stringify(attributesToUse));
//     console.log('HERE WEARE', JSON.stringify(response.metadata));

//     if (isOptionSetNameVisible) {
//       attributesToUse.forEach(
//         (attr: any) => (row[attr.attribute] = attr.value)
//       );
//     } else {
//       attributesToUse.forEach(
//         (attr: any) => (row[attr.attribute] = attr.value)
//       );
//     }

//     //include orgUnit in the row for id access
//     row['orgUnitId'] = matchingEnrollment.orgUnit;
//     // Access the name of the orgUnit using the Map
//     //  row['orgUnit'] = matchingEnrollment.orgUnitName;
//     row['orgUnit'] = orgUnitMap?.get(matchingEnrollment.orgUnit) || 'N/A';
//     //  row['orgUnit'] =
//     // orgUnitMap && orgUnitMap[matchingEnrollment.orgUnit]
//     //   ? orgUnitMap[matchingEnrollment.orgUnit]
//     //   : 'N/A';
//     return row;
//   });
//   return {
//     columns: entityColumns,
//     data: attributesData,
//     filteredEntityColumns: filteredEntityColumns,
//   };
// };

export const getProgramStageData = (
  response: LineListResponse,
  programStageId: string,
  pager: any,
  isOptionSetNameVisible: boolean
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
    (dataElementId: string) => {
      const dataElementMeta = stageFromMetaData.programStageDataElements.find(
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
      event: event.event,
      index: (pager.page - 1) * pager.pageSize + idx + 1,
    };

    allDataElements.forEach(
      (dataElementId: string) => (row[dataElementId] = '')
    );

    event.dataValues.forEach((dv: any) => {
      const dataElementMeta = stageFromMetaData.programStageDataElements.find(
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
  filters?: FilterConfig[]
): {
  columns: ColumnDefinition[];
  data: TableRow[];
  filteredEntityColumns: ColumnDefinition[];
  orgUnitLabel: string;
} => {
  let teis =
    (response.data as TrackedEntityResponse)?.trackedEntities ??
    (response.data as TrackedEntityResponse)?.instances ??
    [];

  const programMetaData = response.metadata.programTrackedEntityAttributes;
  const orgUnitLabel = response.metadata.orgUnitLabel;
  const orgUnitMap = (response.data as TrackedEntityResponse).orgUnitsMap;

  const mappedProgramMetadataAttributes = programMetaData.map((attr) => ({
    displayInList: attr.displayInList,
    searchable: attr.searchable,
    id: attr.trackedEntityAttribute.id,
    name: attr.trackedEntityAttribute.name,
    optionSet: attr.trackedEntityAttribute.optionSetValue
      ? attr.trackedEntityAttribute.optionSet
      : null,
    sortOrder: attr.sortOrder,
  }));

  // if (filters) {
  //   teis = getFilteredTrackedEntites(teis, filters);
  // }

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

  entityColumns = entityColumns
    .filter((column) => {
      return mappedProgramMetadataAttributes
        .filter((attr) => attr.displayInList)
        .some((attr) => attr.id === column.key); // Ensure the column's key matches an id in the filtered list
    })
    .sort((a, b) => {
      // Ensures sortOrder values are treated as numbers
      const sortOrderA = Number(
        mappedProgramMetadataAttributes.find((attr) => attr.id === a.key)
          ?.sortOrder ?? 0
      ); // Default to 0 if undefined, explicitly cast to number
      const sortOrderB = Number(
        mappedProgramMetadataAttributes.find((attr) => attr.id === b.key)
          ?.sortOrder ?? 0
      ); // Default to 0 if undefined, explicitly cast to number

      return sortOrderA - sortOrderB; // Ascending order based on sortOrder
    });

  entityColumns.unshift({
    label: orgUnitLabel || 'registering unit',
    key: 'orgUnit',
  });

  const searchableAttributes = mappedProgramMetadataAttributes
    .filter((attr) => attr.searchable && attr.displayInList)
    .map((attr) => ({
      key: attr.id,
    }));

  const searchableKeys = new Set(searchableAttributes.map((attr) => attr.key));

  const filteredEntityColumns = Array.from(allAttributes)
    .map((attrId: string) => {
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
      // Find the corresponding attribute in mappedProgramMetadataAttributes
      const mappedAttr = mappedProgramMetadataAttributes.find(
        (attr) => attr.id === attrId
      );

      return {
        label: foundAttribute?.displayName || attrId,
        key: attrId,
        valueType: foundAttribute?.valueType,
        options: mappedAttr?.optionSet ?? undefined,
      };
    })
    .filter((column) => {
      return mappedProgramMetadataAttributes
        .filter((attr) => attr.displayInList)
        .some((attr) => attr.id === column.key);
    })
    .sort((a, b) => {
      const sortOrderA = Number(
        mappedProgramMetadataAttributes.find((attr) => attr.id === a.key)
          ?.sortOrder ?? 0
      );
      const sortOrderB = Number(
        mappedProgramMetadataAttributes.find((attr) => attr.id === b.key)
          ?.sortOrder ?? 0
      );

      return sortOrderA - sortOrderB;
    })
    .filter((column) => searchableKeys.has(column.key));

  const attributesData = teis.map((tei: any, idx: number) => {
    const row: TableRow = {
      trackedEntityInstance: tei.trackedEntity,
      index: (pager.page - 1) * pager.pageSize + idx + 1,
    };

    allAttributes.forEach((attrId: string) => (row[attrId] = ''));

    const matchingEnrollment = tei.enrollments.find(
      (enrollment: any) => enrollment.program === programId
    );
    let attributesToUse = matchingEnrollment
      ? matchingEnrollment.attributes
      : tei.attributes;

    //TODO: find a better way to do optimize this date parsing
    //map any date that occur in the attributes to dd-mm-yyyy
    attributesToUse = attributesToUse.map((attr: any) => {
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

    // If option set names are visible, transform the attribute values
    if (isOptionSetNameVisible) {
      attributesToUse.forEach((attr: any) => {
        const attributeMeta = programMetaData.find(
          (metadata) => metadata.trackedEntityAttribute.id === attr.attribute
        );

        // Check if the attribute has an option set and map value to option name
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
      attributesToUse.forEach(
        (attr: any) => (row[attr.attribute] = attr.value)
      );
    }

    // Include orgUnit in the row for id access
    row['orgUnitId'] = matchingEnrollment.orgUnit;
    row['orgUnit'] = orgUnitMap?.get(matchingEnrollment.orgUnit) || 'N/A';

    return row;
  });

  if (teis.length === 0) {
    entityColumns = [
      { label: orgUnitLabel || 'registering unit', key: 'orgUnit' },
      ...mappedProgramMetadataAttributes
        .filter((attr) => attr.displayInList === true)
        .sort((a, b) => {
          return Number(a.sortOrder) - Number(b.sortOrder);
        })
        .map((attr) => ({
          key: attr.id,
          label: attr.name,
        })),
    ];
  }

  return {
    columns: entityColumns,
    data: attributesData,
    filteredEntityColumns: filteredEntityColumns,
    orgUnitLabel: orgUnitLabel,
  };
};

// export const getEventData = (
//   response: LineListResponse,
//   pager: any,
//   isOptionSetNameVisible: boolean
// ): { columns: ColumnDefinition[]; data: TableRow[] } => {
//   const events = (response.data as EventsResponse).events;
//   const uniqueDataElements = new Set<string>();
//   events?.forEach((event: any) => {
//     event?.dataValues.forEach((dv: any) =>
//       uniqueDataElements.add(dv.dataElement)
//     );
//   });

//   const entityColumns = Array.from(uniqueDataElements).map(
//     (dataElement: string) => ({
//       label:
//         response.metadata.programStages[0].programStageDataElements.find(
//           (psde: any) => psde.dataElement.id === dataElement
//         )?.dataElement.name || dataElement,
//       key: dataElement,
//     })
//   );

//   const dataElementsData = events.map((event: any, idx: number) => {
//     const row: TableRow = {
//       event: event.event,
//       index: (pager.page - 1) * pager.pageSize + idx + 1,
//     };
//     uniqueDataElements.forEach(
//       (dataElement: string) => (row[dataElement] = '')
//     );
//     event.dataValues.forEach((dv: any) => {
//       if (isOptionSetNameVisible) {
//         return (row[dv.dataElement] = dv.value)

//       } else {
//         return (row[dv.dataElement] = dv.value)
//       }
//     });
//     return row;
//   });

//   return { columns: entityColumns, data: dataElementsData };
// };

export const getEventData = (
  response: LineListResponse,
  pager: any,
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
        response.metadata.programStages[0].programStageDataElements.find(
          (psde: any) => psde.dataElement.id === dataElement
        )?.dataElement.name || dataElement,
      key: dataElement,
    })
  );

  const dataElementsData = events.map((event: any, idx: number) => {
    const row: TableRow = {
      event: event.event,
      index: (pager.page - 1) * pager.pageSize + idx + 1,
    };

    uniqueDataElements.forEach(
      (dataElement: string) => (row[dataElement] = '')
    );

    event.dataValues.forEach((dv: any) => {
      if (isOptionSetNameVisible && dv.optionSetValue) {
        const dataElementMetadata = response.metadata.programStages
          .flatMap((programStage: any) => programStage.programStageDataElements)
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
