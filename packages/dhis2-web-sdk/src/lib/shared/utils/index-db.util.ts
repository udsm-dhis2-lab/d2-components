import { IndexDBParams } from '../interfaces';

export class IndexDbUtil {
  static getUrlParams(splitedUrl: string[]) {
    const params: Record<string, unknown> = {};
    ((splitedUrl[1] || '').split('&') || []).forEach((param) => {
      const splitedParams = param.split('=');
      if (splitedParams[0] || splitedParams[0] !== '') {
        params[splitedParams[0]] = [
          ...((params[splitedParams[0]] as any) || []),
          splitedParams[1],
        ];
      }
    });

    return IndexDbUtil.sanitizeParams(params);
  }

  static sanitizeParams(params: any): IndexDBParams | null {
    if (!params) {
      return null;
    }

    return {
      page: params.page ? parseInt(params.page[0], 10) : undefined,
      pageSize: params.pageSize ? parseInt(params.pageSize[0], 10) : undefined,
      fields: params.fields ? params.fields[0] : undefined,
      filter: params.filter,
      order: params.order,
    };
  }
  static deduceUrlContent(url: string) {
    const splitedUrl = (url || '').split('?');
    const schemaPart = (splitedUrl[0] || '').split('/') || [];
    const schemaName = ((schemaPart[0] || '').split('.') || [])[0];

    const schema = {
      name:
        schemaName === 'dataStore'
          ? `dataStore_${((schemaPart[1] || '').split('.') || [])[0]}`
          : schemaName,
      id:
        schemaName === 'dataStore'
          ? (schemaPart[2] || '').replace('.json', '')
          : (schemaPart[1] || '').replace('.json', ''),
    };

    const params = IndexDbUtil.getUrlParams(splitedUrl);

    return { schema, params };
  }
  static getOrderByColumns(orderParams: string[]) {
    return (orderParams || [])
      .map((orderString) => (orderString || '').split(':')[0])
      .filter((orderString) => orderString);
  }

  static filterIndexDBData(
    data: Record<string, object>[],
    filterParams: string[]
  ) {
    if (!filterParams) {
      return data;
    }

    const filterList = filterParams.map((filterString: string) => {
      const splitedFilterString = filterString.split(':');
      return {
        attribute: splitedFilterString[0],
        condition: splitedFilterString[1],
        filterValue: splitedFilterString[2],
      };
    });

    return data.filter((dataItem: any) =>
      IndexDbUtil.filterDataItem(dataItem, filterList)
    );
  }

  static filterDataItem(dataItem: any, filterList: any[]) {
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
          return (
            parseInt(dataValue! as string, 10) <= parseInt(filterValue, 10)
          );

        case 'lt':
          return parseInt(dataValue! as string, 10) < parseInt(filterValue, 10);

        case 'ge':
          return (
            parseInt(dataValue! as string, 10) >= parseInt(filterValue, 10)
          );

        case 'gt':
          return parseInt(dataValue! as string, 10) > parseInt(filterValue, 10);

        case 'in':
          return (filterValue || '').indexOf(dataValue! as string) !== -1;

        default:
          return false;
      }
    });
  }
}
