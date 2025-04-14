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
  metaData: Program
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
    .map((attr) => ({
      label: attr.name,
      key: attr.id,
    }));

  const dataElementColumns = metaData.displayInListDataElements
    .sort((a, b) => a.sortOrder! - b.sortOrder!)
    .map((element) => ({
      label: element.name,
      key: element.id,
    }));

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
      label: orgUnitLabel || 'registering unit',
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
          return { ...attr }; // Leave value as is on parse failure
        }
      }
      return attr;
    });

    attributesData.forEach((attr: Attribute) => {
      row[attr.attribute] = { value: attr.value };
    });

    dataElementsData.forEach((element: DataValue) => {
      // Find the matching data element in dataElementOptions by ID
      const dataElementOption = dataElementOptions.find(
        (deo) => deo.id === element.dataElement
      );

      // find a matching option within that data element's options
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

    // Include orgUnit in the row for id access with style
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
    filteredEntityColumns: tableFilters,
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
