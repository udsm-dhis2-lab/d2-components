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
    .programStages!.sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((stage) =>
      stage
        .programStageDataElements!.filter((psde) => psde.displayInReports)
        .sort((a, b) => a.sortOrder - b.sortOrder)
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

  const getOptionColor = (option: any): string | undefined =>
    option?.color || option?.style?.color;

  const formatDate = (value: string): string => {
    try {
      return format(parse(value, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy');
    } catch {
      return value;
    }
  };

  const trackedEntityAttributeMap = new Map<string, any>();
  (metaData.programTrackedEntityAttributes || []).forEach(
    ({ trackedEntityAttribute }) => {
      if (trackedEntityAttribute?.id) {
        trackedEntityAttributeMap.set(
          trackedEntityAttribute.id,
          trackedEntityAttribute
        );
      }
    }
  );

  const dataElementOptionMap = new Map<string, any>();
  dataElementOptions.forEach((deo) => {
    if (deo.id) {
      dataElementOptionMap.set(deo.id, deo);
    }
  });

  const tableData = teis.map((tei: TrackedEntityInstance, index: number) => {
    const row: TableRow = {
      trackedEntityInstance: { value: tei.trackedEntity },
      index: { value: (pager.page - 1) * pager.pageSize + index + 1 },
    };

    const enrollment = tei.latestEnrollment;
    if (!enrollment) return row;

    const attributes = (enrollment.attributes || []).map((attr: any) => {
      if (
        attr?.valueType?.toLowerCase() === 'date' &&
        typeof attr.value === 'string'
      ) {
        return { ...attr, value: formatDate(attr.value) };
      }
      return attr;
    });

    attributes.forEach((attr: any) => {
      const attributeId = attr?.attribute;
      const value = attr?.value;
      if (!attributeId || value == null) return;

      const attributeMeta = trackedEntityAttributeMap.get(attributeId);
      const valueType = attributeMeta?.valueType;

      if (valueType === 'ORGANISATION_UNIT') {
        const name = orgUnitMap?.get(value);
        row[attributeId] = { value: name || value };
      } else if (
        attributeMeta?.optionSetValue &&
        attributeMeta?.optionSet?.options
      ) {
        const matchedOption = attributeMeta.optionSet.options.find(
          (opt: any) => opt.code === value
        );
        row[attributeId] = {
          value: matchedOption?.name || value,
          ...(getOptionColor(matchedOption) && {
            style: getOptionColor(matchedOption),
          }),
        };
      } else {
        row[attributeId] = { value };
      }
    });

    const dataValues =
      enrollment.events?.flatMap((event) => event.dataValues || []) || [];

    dataValues.forEach((dataValue: DataValue) => {
      const dataElementId = dataValue.dataElement;
      const value = dataValue.value;
      if (!dataElementId || value == null) return;

      const dataElementOption = dataElementOptionMap.get(dataElementId);
      const matchedOption = dataElementOption?.options?.find(
        (opt: any) => opt.name === value
      );

      row[dataElementId] = {
        value,
        ...(getOptionColor(matchedOption) && {
          style: getOptionColor(matchedOption),
        }),
      };
    });

    const orgUnitId = enrollment.orgUnit;
    const orgUnitName = orgUnitMap?.get(orgUnitId) || '-';

    row['orgUnitId'] = { value: orgUnitId || '-' };
    row['orgUnit'] = { value: orgUnitName };

    const teiObject =
      typeof tei.toObject === 'function' ? tei.toObject() : null;
    row['responseData'] = {
      value: (teiObject as TrackedEntityInstance) || null,
    };

    return row;
  });

  return {
    columns: tableColumns,
    data: tableData,
    filteredEntityColumns: [...tableFilters, ...tableSearcheableDataElements],
    orgUnitLabel,
  };

  // const tableData = teis.map((tei: TrackedEntityInstance, idx: number) => {
  //   const row: TableRow = {
  //     trackedEntityInstance: { value: tei.trackedEntity },
  //     index: { value: (pager.page - 1) * pager.pageSize + idx + 1 },
  //   };

  //   const matchingEnrollment = tei.latestEnrollment;

  //   let attributesData = matchingEnrollment.attributes;

  //   const dataElementsData = matchingEnrollment!.events.flatMap(
  //     (event) => event.dataValues
  //   );

  //   attributesData = attributesData!.map((attr: any) => {
  //     if (attr?.valueType?.toLowerCase() === 'date') {
  //       try {
  //         return {
  //           ...attr,
  //           value: format(
  //             parse(attr.value, 'yyyy-MM-dd', new Date()),
  //             'dd/MM/yyyy'
  //           ),
  //         };
  //       } catch {
  //         return { ...attr };
  //       }
  //     }
  //     return attr;
  //   });

  //   // Tracked Entity Instance Attributes
  //   const trackedEntityAttributeMap = new Map<string, any>();
  //   (metaData.programTrackedEntityAttributes || []).forEach(
  //     (programAttribute) => {
  //       const attributeId = programAttribute.trackedEntityAttribute?.id;
  //       if (attributeId) {
  //         trackedEntityAttributeMap.set(
  //           attributeId,
  //           programAttribute.trackedEntityAttribute
  //         );
  //       }
  //     }
  //   );

  //   attributesData.forEach((attributeItem: any) => {
  //     const attributeId = attributeItem?.attribute;
  //     const attributeValue = attributeItem?.value;

  //     if (!attributeId || attributeValue == null) return;

  //     const trackedEntityAttribute = trackedEntityAttributeMap.get(attributeId);
  //     const valueType = trackedEntityAttribute?.valueType;

  //     if (valueType === 'ORGANISATION_UNIT') {
  //       const organisationUnitName = orgUnitMap?.get(attributeValue);
  //       row[attributeId] = {
  //         value: organisationUnitName || attributeValue,
  //       };
  //     } else if (
  //       trackedEntityAttribute?.optionSetValue &&
  //       trackedEntityAttribute?.optionSet?.options
  //     ) {
  //       const matchedOption = trackedEntityAttribute.optionSet.options.find(
  //         (option: any) => option.code === attributeValue
  //       );

  //       const optionColor = matchedOption?.color || matchedOption?.style?.color;

  //       row[attributeId] = {
  //         value: matchedOption?.name || attributeValue,
  //         ...(optionColor && { style: optionColor }),
  //       };
  //     } else {
  //       row[attributeId] = {
  //         value: attributeValue,
  //       };
  //     }
  //   });

  //   // Program Stage Data Elements
  //   const dataElementOptionMap = new Map(
  //     dataElementOptions.map((deo) => [deo.id, deo])
  //   );

  //   dataElementsData.forEach((element: DataValue) => {
  //     if (!element?.dataElement || element.value == null) return;

  //     const dataElementOption = dataElementOptionMap.get(element.dataElement);
  //     const matchingOption: any = dataElementOption?.options?.find(
  //       (opt) => opt.name === element.value
  //     );

  //     const optionColor = matchingOption?.color || matchingOption?.style?.color;

  //     row[element.dataElement] = {
  //       value: element.value,
  //       ...(optionColor && { style: optionColor }),
  //     };
  //   });

  //   const orgUnitId = matchingEnrollment?.orgUnit;

  //   if (orgUnitId) {
  //     row['orgUnitId'] = { value: orgUnitId };

  //     const orgUnitName = orgUnitMap?.get(orgUnitId) || '-';
  //     row['orgUnit'] = { value: orgUnitName };
  //   } else {
  //     row['orgUnitId'] = { value: '-' };
  //     row['orgUnit'] = { value: '-' };
  //   }

  //   const teiObject =
  //     typeof tei?.toObject === 'function' ? tei.toObject() : null;
  //   row['responseData'] = {
  //     value: (teiObject as TrackedEntityInstance) || null,
  //   };

  //   return row;
  // });

  // return {
  //   columns: tableColumns,
  //   data: tableData,
  //   filteredEntityColumns: [...tableFilters, ...tableSearcheableDataElements],
  //   orgUnitLabel: orgUnitLabel,
  // };
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
