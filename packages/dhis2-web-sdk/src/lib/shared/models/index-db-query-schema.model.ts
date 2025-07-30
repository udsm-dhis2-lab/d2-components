import { IndexDBParams } from '../interfaces';
import { IndexDbUtil } from '../utils';

export class IndexDbQuerySchema {
  dataId?: string;
  schema!: string;
  namespace?: string;
  params!: IndexDBParams;
  isDataStoreResource?: boolean;

  static fromUrl(url: string): IndexDbQuerySchema {
    const urlContent = IndexDbUtil.deduceUrlContent(url);

    return {
      dataId: urlContent?.schema?.id,
      schema: urlContent?.schema?.name,
      namespace: urlContent?.schema?.namespace,
      params: urlContent?.params || {},
      isDataStoreResource: url.includes('dataStore'),
    };
  }
}
