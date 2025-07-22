// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AxiosInstance } from 'axios';
import { isArray } from 'lodash';
import { IndexDBParams } from '../interfaces';
import { IndexDbUtil } from '../utils';
import { D2HttpRequestConfig } from './d2-http-request-config.model';
import { D2HttpResponse } from './http-response.model';
import { D2IndexDb } from './index-db.model';

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
    const urlContent = IndexDbUtil.deduceUrlContent(url);

    console.log('URL CONTENT', urlContent);
    const schemaName =
      urlContent && urlContent.schema ? urlContent.schema.name : undefined;

    const id =
      urlContent && urlContent.schema ? urlContent.schema.id : undefined;

    const params: IndexDBParams = urlContent ? urlContent.params || {} : {};

    if (!schemaName) {
      console.warn('index db operations failed, Error: Schema is not supplied');
      return this.#fetchFromApi(url, config);
    }

    const indexDbResponse = await (id
      ? this.#indexDb.findById(schemaName, id)
      : this.#indexDb.findAll(schemaName, params));

    if (!indexDbResponse || indexDbResponse[schemaName]?.length === 0) {
      const apiResponse = await this.#fetchFromApi(url, config);

      if (!apiResponse?.data) {
        return apiResponse;
      }

      const isDataStoreResource = url.includes('dataStore');

      const responseData = isDataStoreResource
        ? isArray(apiResponse.data)
          ? apiResponse.data
          : apiResponse.data['entries']
        : apiResponse.data[schemaName];

      (await id)
        ? this.#indexDb.saveOne(schemaName, responseData)
        : this.#indexDb.saveBulk(schemaName, responseData as any);

      return apiResponse;
    }

    return new D2HttpResponse({ data: indexDbResponse, status: 200 });
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
