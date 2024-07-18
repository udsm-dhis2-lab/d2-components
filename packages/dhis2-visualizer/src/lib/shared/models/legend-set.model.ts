// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export interface LegendSet {
  name: string;
  id: string;
  legends?: Legend[];
}

export interface Legend {
  id: string;
  name: string;
  endValue: number;
  color: string;
  startValue: number;
}
