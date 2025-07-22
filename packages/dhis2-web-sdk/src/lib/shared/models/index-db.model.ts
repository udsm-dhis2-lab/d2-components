import Dexie from 'dexie';
import { ID2IndexDbConfig, IndexDBParams } from '../interfaces';
import { IndexDbUtil } from '../utils';

export class D2IndexDb extends Dexie {
  constructor(config: ID2IndexDbConfig) {
    super(config.namespace);
    this.version(config.version).stores(config.models);
  }

  findById(schemaName: string, id: string) {
    return this.table(schemaName).where({ id }).first();
  }

  async findAll(schemaName: string, params: IndexDBParams): Promise<any> {
    const dataArray = await this.#getTableSchema(schemaName, params).toArray();

    return {
      [schemaName]: IndexDbUtil.filterIndexDBData(
        dataArray,
        params.filter as string[]
      ),
    };
  }

  saveOne(schemaName: string, data: any) {
    return this.table(schemaName).put(data);
  }

  saveBulk(schemaName: string, data: any[]): Promise<any> {
    return this.table(schemaName).bulkPut(data);
  }

  #getTableSchema(schemaName: string, params: IndexDBParams) {
    const tableSchema = this.table(schemaName);
    if (!params) {
      return tableSchema;
    }

    // TODO: Find best way to simplify this code
    if (params.pageSize) {
      const page = params.page || 1;
      const pagedTableSchema = tableSchema
        .offset(page * params.pageSize)
        .limit(params.pageSize);

      if (params.order) {
        const orderByColumns = IndexDbUtil.getOrderByColumns(params.order);

        if (orderByColumns.length === 0) {
          return pagedTableSchema;
        }

        // TODO: Need to find a way to order by more than one column, currently dexie does not support this
        return tableSchema
          .orderBy(orderByColumns[0])
          .offset(page === 1 ? 0 : page * params.pageSize)
          .limit(params.pageSize);
      }

      return pagedTableSchema;
    } else if (params.order) {
      const orderByColumns = IndexDbUtil.getOrderByColumns(params.order);

      if (orderByColumns.length === 0) {
        return tableSchema;
      }

      // TODO: Need to find a way to order by more than one column, currently dexie does not support this
      return tableSchema.orderBy(orderByColumns[0]);
    }

    return tableSchema;
  }
}
