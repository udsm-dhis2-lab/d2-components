// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { TrackerImportStats } from './tracker-import-stats.model';
import { TrackerImportValidationReport } from './tracker-import-validation-report.model';

export class TrackerImportSummary {
  statusCode!: number;
  status!: string;
  stats!: TrackerImportStats;
  validationReports!: TrackerImportValidationReport[];
  constructor(summaryResponse: Record<string, unknown>) {
    this.statusCode = summaryResponse['statusCode'] as number;
    this.status = summaryResponse['status'] as string;
    this.stats = new TrackerImportStats(
      summaryResponse['stats'] as TrackerImportStats
    );
    this.validationReports = TrackerImportValidationReport.setReports(
      summaryResponse['validationReport'] as Record<
        string,
        Record<string, unknown>[]
      >
    );
  }

  get hasErrors(): boolean {
    return this.stats.hasErrors;
  }
}
