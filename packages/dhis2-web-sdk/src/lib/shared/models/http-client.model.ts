// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AxiosInstance } from 'axios';
import { isArray, isPlainObject } from 'lodash';
import { IndexDBParams } from '../interfaces';
import { IndexDbUtil } from '../utils';
import { D2HttpRequestConfig } from './d2-http-request-config.model';
import { D2HttpResponse } from './http-response.model';
import { D2IndexDb } from './index-db.model';
import { IndexDbQuerySchema } from './index-db-query-schema.model';

export class D2HttpClient {
  #axiosInstance!: AxiosInstance;
  #indexDb!: D2IndexDb;

  constructor(axiosInstance: AxiosInstance, indexDb: D2IndexDb) {
    this.#axiosInstance = axiosInstance;
    this.#indexDb = indexDb;
  }

  async get(
    url: string,
    config?: D2HttpRequestConfig
  ): Promise<D2HttpResponse> {
    if (config?.useIndexDb) {
      return this.#fetchFromIndexDb(url, config);
    }

    return this.#fetchFromApi(url, config);
  }

  async #fetchFromApi(
    url: string,
    config?: D2HttpRequestConfig
  ): Promise<D2HttpResponse> {
    try {
      const response = await this.#axiosInstance.get(
        `${this.#getBaseUrl(config)}/${url}`
      );

      return new D2HttpResponse(response as unknown as Record<string, unknown>);
    } catch (error) {
      return new D2HttpResponse(error as unknown as Record<string, unknown>);
    }
  }

  async #fetchFromIndexDb(url: string, config: D2HttpRequestConfig) {
    const indexDbQuerySchema = IndexDbQuerySchema.fromUrl(url);

    const { schema, dataId, params } = indexDbQuerySchema;

    if (!schema) {
      console.warn('index db operations failed, Error: Schema is not supplied');
      return this.#fetchFromApi(url, config);
    }

    const indexDbResponse = await (dataId
      ? this.#indexDb.findById(schema, dataId)
      : this.#indexDb.findAll(schema, params));

    if (!indexDbResponse || indexDbResponse[schema]?.length === 0) {
      const apiResponse = await this.#fetchFromApi(url, config);

      if (!apiResponse?.data) {
        return apiResponse;
      }

      await this.#saveToIndexDb(apiResponse, indexDbQuerySchema);

      return apiResponse;
    }

    return new D2HttpResponse({ data: indexDbResponse, status: 200 });
  }

  async #saveToIndexDb(
    apiResponse: D2HttpResponse,
    IndexDbQuerySchema: IndexDbQuerySchema
  ) {
    const { schema, dataId, isDataStoreResource, namespace } =
      IndexDbQuerySchema;

    const responseData = isDataStoreResource
      ? this.#handleDataStoreResponse(apiResponse, namespace as string)
      : apiResponse?.data?.[schema] ?? apiResponse?.data;

    (await dataId)
      ? this.#indexDb.saveOne(schema, responseData)
      : this.#indexDb.saveBulk(schema, responseData as any);
  }

  #handleDataStoreResponse(apiResponse: D2HttpResponse, namespace: string) {
    if (isArray(apiResponse?.data) || apiResponse?.data?.['entries']) {
      return (
        (apiResponse?.data?.['entries'] ?? apiResponse?.data) as
          | Record<string, unknown>[]
          | string[]
      ).map((entry) => {
        const key = isPlainObject(entry)
          ? `${namespace}-${(entry as Record<string, string>)['key']}`
          : undefined;

        return {
          key,
          entry,
        };
      });
    }

    const entry = apiResponse.data;
    return {
      entry,
      key: `${namespace}-${(entry as Record<string, string>)['key']}`,
    };
  }

  async post(
    url: string,
    data: Record<string, unknown>,
    config?: D2HttpRequestConfig
  ): Promise<D2HttpResponse> {
    try {
      const response = await this.#axiosInstance.post(
        `../../../api/${url}`,
        data
      );

      return new D2HttpResponse(response as unknown as Record<string, unknown>);
    } catch (error) {
      return new D2HttpResponse(error as unknown as Record<string, unknown>);
    }
  }

  async put(
    url: string,
    data: Record<string, unknown>,
    config?: D2HttpRequestConfig
  ): Promise<D2HttpResponse> {
    try {
      const response = await this.#axiosInstance.put(
        `../../../api/${url}`,
        data
      );

      return new D2HttpResponse(response as unknown as Record<string, unknown>);
    } catch (error) {
      return new D2HttpResponse(error as unknown as Record<string, unknown>);
    }
  }

  async patch(
    url: string,
    data: Record<string, unknown>,
    config?: D2HttpRequestConfig
  ): Promise<D2HttpResponse> {
    try {
      const response = await this.#axiosInstance.patch(
        `../../../api/${url}`,
        data
      );

      return new D2HttpResponse(response as unknown as Record<string, unknown>);
    } catch (error) {
      return new D2HttpResponse(error as unknown as Record<string, unknown>);
    }
  }

  async delete(
    url: string,
    config?: D2HttpRequestConfig
  ): Promise<D2HttpResponse> {
    try {
      const response = await this.#axiosInstance.delete(`../../../api/${url}`);

      return new D2HttpResponse(response as unknown as Record<string, unknown>);
    } catch (error) {
      return new D2HttpResponse(error as unknown as Record<string, unknown>);
    }
  }

  #getBaseUrl(config?: D2HttpRequestConfig): string {
    const baseUrl = '../../..';

    if (config?.useRootUrl) {
      return baseUrl;
    }

    return `${baseUrl}/api`;
  }
}
