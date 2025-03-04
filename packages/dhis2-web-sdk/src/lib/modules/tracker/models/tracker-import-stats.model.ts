// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class TrackerImportStats {
  created!: number;
  updated!: number;
  deleted!: number;
  ignored!: number;
  total!: number;
  summary!: string;
  constructor(stats: Partial<TrackerImportStats>) {
    this.created = stats.created || 0;
    this.updated = stats.updated || 0;
    this.deleted = stats.deleted || 0;
    this.ignored = stats.ignored || 0;
    this.total = stats.total || 0;
    this.summary = this.getSummary(stats);
  }

  getSummary(stats: Partial<TrackerImportStats>): string {
    return Object.keys(stats || {})
      .map((statsKey) => {
        return `${statsKey.toUpperCase()}: ${
          (stats as Record<string, number>)[statsKey]
        }`;
      })
      .join(', ');
  }

  get hasErrors(): boolean {
    return this.ignored > 0;
  }
}
