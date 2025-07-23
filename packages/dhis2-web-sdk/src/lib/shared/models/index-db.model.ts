import Dexie from 'dexie';
import { ID2IndexDbConfig, IndexDBParams } from '../interfaces';
import { IndexDbUtil } from '../utils';
import { IndexDbQuerySchema } from './index-db-query-schema.model';
import { entries } from 'lodash';

export class D2IndexDb extends Dexie {
  constructor(config: ID2IndexDbConfig) {
    super(config.namespace);
    this.version(config.version).stores(config.models);
  }

  async findById(id: string, indexDbQuerySchema: IndexDbQuerySchema) {
    const { schema, isDataStoreResource } = indexDbQuerySchema;

    if (isDataStoreResource) {
      const data = await this.table(schema).where({ key: id }).first();
      return data?.['entry'];
    }

    return this.table(schema).where({ id }).first();
  }

  async findAll(indexDbQuerySchema: IndexDbQuerySchema): Promise<any> {
    const { schema, isDataStoreResource, params } = indexDbQuerySchema;
    const dataArray = await this.#getTableSchema(schema, params).toArray();

    const filteredData = IndexDbUtil.filterIndexDBData(
      dataArray,
      params.filter as string[]
    );

    if (isDataStoreResource) {
      return {
        entries: filteredData.map((dataItem) => {
          return dataItem['entry'];
        }),
      };
    }

    return {
      [schema]: filteredData,
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
