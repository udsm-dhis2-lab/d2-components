// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export interface D2HttpRequestConfig {
  includeVersionNumber?: boolean;
  preferPreviousApiVersion?: boolean;
  useRootUrl?: boolean;
  isExternalLink?: boolean;
  useIndexDb?: boolean;
  fetchOnlineIfNotExist?: boolean;
  indexDbConfig?: {
    schema: string;
  };
  httpHeaders?: any;
  allowDataStoreRequestStandardization?: boolean;
}
