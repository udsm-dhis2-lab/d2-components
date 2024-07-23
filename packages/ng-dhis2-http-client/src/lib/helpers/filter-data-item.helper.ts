export function filterDataItem(dataItem: any, filterList: any[]) {
  return (filterList || []).some((filterItem: any) => {
    const { attribute, condition, filterValue } = filterItem;
    let dataValue: Record<string, unknown> | string;

    (attribute || '')
      .split('.')
      .forEach((attributeKey: string, index: number) => {
        if (index > 0 && !dataValue) {
          return undefined;
        }
        dataValue = dataValue
          ? (dataValue as Record<string, unknown>)[attributeKey]
          : dataItem[attributeKey];
      });

    switch (condition) {
      case 'ilike':
        return ((dataValue! as string) || '').indexOf(filterValue) !== -1;

      case 'eq':
        return dataValue! === filterValue;

      case 'le':
        return parseInt(dataValue! as string, 10) <= parseInt(filterValue, 10);

      case 'lt':
        return parseInt(dataValue! as string, 10) < parseInt(filterValue, 10);

      case 'ge':
        return parseInt(dataValue! as string, 10) >= parseInt(filterValue, 10);

      case 'gt':
        return parseInt(dataValue! as string, 10) > parseInt(filterValue, 10);

      case 'in':
        return (filterValue || '').indexOf(dataValue! as string) !== -1;

      default:
        return false;
    }
  });
}
