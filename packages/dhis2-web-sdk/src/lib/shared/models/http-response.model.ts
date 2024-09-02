// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AxiosError } from 'axios';
import { BaseSDKModel } from './base.model';

export class D2HttpResponseStatus extends BaseSDKModel<D2HttpResponseStatus> {
  status!: number;
  statusText!: string;
  message?: any;
}

export class D2HttpResponse {
  data?: Record<string, unknown>;
  responseStatus!: D2HttpResponseStatus;

  constructor(response: Record<string, unknown>) {
    if (response instanceof AxiosError) {
      this.responseStatus = new D2HttpResponseStatus({
        status: response.status || response.response?.status,
        statusText: response.response?.statusText || response.message,
        message: response.response?.data || response.message,
      });
    } else {
      this.data = response['data'] as Record<string, unknown>;
      this.responseStatus = new D2HttpResponseStatus({
        status: response['status'] as number,
        statusText: response['statusText'] as string,
      });
    }
  }
}
