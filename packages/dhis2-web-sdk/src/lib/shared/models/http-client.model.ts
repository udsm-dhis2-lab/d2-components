// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import axios, { AxiosDefaults, AxiosInstance } from 'axios';
import { D2HttpResponse } from './http-response.model';
import { D2HttpRequestConfig } from './d2-http-request-config.model';

export class D2HttpClient {
  #axiosInstance!: AxiosInstance;

  constructor(config: AxiosDefaults) {
    this.#axiosInstance = axios.create(config);
  }

  async get(
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
