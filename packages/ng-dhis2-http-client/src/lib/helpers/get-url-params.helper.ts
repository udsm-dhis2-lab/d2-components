import { IndexDBParams } from '../models/index-db-params.model';

export function getUrlParams(splitedUrl: string[]) {
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

  return sanitizeParams(params);
}

function sanitizeParams(params: any): IndexDBParams | null {
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
