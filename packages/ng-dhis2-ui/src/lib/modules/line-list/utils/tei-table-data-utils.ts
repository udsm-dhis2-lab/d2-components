import {
  Attribute,
  DataValue,
  Program,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import {
  LineListResponse,
  ColumnDefinition,
  TableRow,
  TrackedEntityInstancesResponse,
} from '../models/line-list.models';
import { parse, format } from 'date-fns';

export const getTrackedEntityTableData = (
  response: LineListResponse,
  programId: string,
  pager: any,
  metaData: Program,
  searcheableDataElements: string[]
): {
  columns: ColumnDefinition[];
  data: TableRow[];
  filteredEntityColumns: ColumnDefinition[];
  orgUnitLabel: string;
} => {
  const teisRaw = (response.data as TrackedEntityInstancesResponse)
    .trackedEntityInstances;
  const teis: TrackedEntityInstance[] = Array.isArray(teisRaw)
    ? teisRaw
    : [teisRaw];

  const orgUnitLabel = metaData.orgUnitLabel as string;
  const orgUnitMap = (response.data as TrackedEntityInstancesResponse)
    .orgUnitsMap;

  const attributeColumns = metaData.displayInListTrackedEntityAttributes
    .sort((a, b) => a.sortOrder! - b.sortOrder!)
    .map((trackedEntityAttribute) => ({
      label: trackedEntityAttribute.name ?? trackedEntityAttribute.formName,
      key: trackedEntityAttribute.id,
    }));

  const tableSearcheableDataElements = metaData
    .programStages!.sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((stage) =>
      stage
        .programStageDataElements!.filter((psde) => psde.displayInReports)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((psde) => ({
          label:
            psde.dataElement.name || psde.dataElement.formName || 'default',
          key: psde.dataElement.id,
          valueType: psde.dataElement.valueType,
          options: psde.dataElement.optionSet,
          type: 'dataElement',
        }))
        .filter((col) => searcheableDataElements.includes(col.key))
    );

  const dataElementColumns = metaData
    .programStages!.sort((a, b) => a.sortOrder - b.sortOrder) // Sorts stages by sortOrder
    .flatMap((stage) =>
      stage
        .programStageDataElements!.filter((psde) => psde.displayInReports)
        .sort((a, b) => a.sortOrder - b.sortOrder) // Sorts data elements within stage
        .map((psde) => ({
          label:
            psde.dataElement.name || psde.dataElement.formName || 'default',
          key: psde.dataElement.id,
        }))
    );

  const dataElementOptions = metaData.displayInListDataElements.map(
    (element) => ({
      id: element.id,
      options: element.optionSet?.options.map((opt) => ({
        name: opt.name,
        color: opt.style?.color,
      })),
    })
  );

  const tableColumns = [
    {
      label: orgUnitLabel || 'Registering unit',
      key: 'orgUnit',
    },
    ...attributeColumns,
    ...dataElementColumns,
  ];

  const tableFilters = metaData.searchableTrackedEntityAttributes
    .sort((a, b) => a.sortOrder! - b.sortOrder!)
    .map((attr) => ({
      label: attr.name,
      key: attr.id,
      valueType: attr.valueType,
      options: attr.optionSet ?? undefined,
      type: 'attribute',
    }));

  const tableData = teis.map((tei: TrackedEntityInstance, idx: number) => {
    const row: TableRow = {
      trackedEntityInstance: { value: tei.trackedEntity },
      index: { value: (pager.page - 1) * pager.pageSize + idx + 1 },
    };

    const matchingEnrollment = tei.latestEnrollment;

    let attributesData = matchingEnrollment.attributes;

    const dataElementsData = matchingEnrollment!.events.flatMap(
      (event) => event.dataValues
    );

    attributesData = attributesData!.map((attr: any) => {
      if (attr?.valueType?.toLowerCase() === 'date') {
        try {
          return {
            ...attr,
            value: format(
              parse(attr.value, 'yyyy-MM-dd', new Date()),
              'dd/MM/yyyy'
            ),
          };
        } catch {
          return { ...attr };
        }
      }
      return attr;
    });
    // attributesData.forEach((attr: any) => {
    //   const attributeMeta = metaData.programTrackedEntityAttributes?.find(
    //     (metadata) => metadata.trackedEntityAttribute.id === attr.attribute
    //   );

    //   if (attributeMeta?.trackedEntityAttribute.optionSetValue) {
    //     const optionSet = attributeMeta?.trackedEntityAttribute?.optionSet;

    //     const option = optionSet?.options?.find(
    //       (option) => option.code === attr.value
    //     );

    //     row[attr.attribute] = option
    //       ? { value: option?.name }
    //       : { value: attr.value };
    //   } else {
    //     row[attr.attribute] = { value: attr.value };
    //   }
    // });
    attributesData.forEach((attr: any) => {
      const attributeMeta = metaData.programTrackedEntityAttributes?.find(
        (metadata) => metadata.trackedEntityAttribute.id === attr.attribute
      );

      const valueType = attributeMeta?.trackedEntityAttribute?.valueType;

      if (valueType === 'ORGANISATION_UNIT') {
        const orgUnitName = orgUnitMap?.get(attr.value);
        row[attr.attribute] = { value: orgUnitName || attr.value };
      } else if (attributeMeta?.trackedEntityAttribute.optionSetValue) {
        const optionSet = attributeMeta?.trackedEntityAttribute?.optionSet;

        const option = optionSet?.options?.find(
          (option) => option.code === attr.value
        );

        row[attr.attribute] = option
          ? { value: option?.name }
          : { value: attr.value };
      } else {
        row[attr.attribute] = { value: attr.value };
      }
    });

    dataElementsData.forEach((element: DataValue) => {
      // Finds the matching data element in dataElementOptions by ID
      const dataElementOption = dataElementOptions.find(
        (deo) => deo.id === element.dataElement
      );

      // finds a matching option within that data element's options
      const matchingOption = dataElementOption?.options?.find(
        (opt) => opt.name === element.value
      );

      // Builds the row entry with value and optional style
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

    // Includes orgUnit in the row for id access with style
    row['orgUnitId'] = { value: matchingEnrollment!.orgUnit };
    row['orgUnit'] = {
      value: orgUnitMap?.get(matchingEnrollment!.orgUnit) || '-',
    };
    row['responseData'] = { value: tei.toObject() as TrackedEntityInstance };
    return row;
  });

  return {
    columns: tableColumns,
    data: tableData,
    filteredEntityColumns: [...tableFilters, ...tableSearcheableDataElements],
    orgUnitLabel: orgUnitLabel,
  };
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
