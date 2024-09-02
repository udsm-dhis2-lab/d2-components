// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import axios, { AxiosDefaults, AxiosInstance } from 'axios';
import { D2HttpResponse } from './http-response.model';

export class D2HttpClient {
  #axiosInstance!: AxiosInstance;

  constructor(config: AxiosDefaults) {
    this.#axiosInstance = axios.create(config);
  }

  async get(url: string): Promise<D2HttpResponse> {
    try {
      const response = await this.#axiosInstance.get(`api/${url}`);

      return new D2HttpResponse(response as unknown as Record<string, unknown>);
    } catch (error) {
      return new D2HttpResponse(error as unknown as Record<string, unknown>);
    }
  }
}
