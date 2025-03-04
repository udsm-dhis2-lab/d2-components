// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class TrackerImportValidationReport {
  id!: string;
  uid?: string;
  type!: 'ERROR' | 'WARNING';
  errorCode!: string;
  objectType!: string;
  message!: string;
  summary!: string;
  constructor(report: Partial<TrackerImportValidationReport>) {
    this.id = report.uid as string;
    this.type = report.type as 'ERROR' | 'WARNING';
    this.errorCode = report.errorCode as string;
    this.objectType = report.objectType as string;
    this.message = report.message as string;
    this.summary = this.getSummary();
  }

  getSummary(): string {
    return `[${this.errorCode} - ${this.objectType} (${this.id})]: ${this.message}`;
  }

  static setReports(reportResponse: Record<string, Record<string, unknown>[]>) {
    return [
      ...(reportResponse['errorReports'] || []).map(
        (errorReport) =>
          new TrackerImportValidationReport({
            uid: errorReport['uid'] as string,
            type: 'ERROR',
            errorCode: errorReport['errorCode'] as string,
            objectType: errorReport['trackerType'] as string,
            message: errorReport['message'] as string,
          })
      ),
      ...(reportResponse['warningReports'] || []).map(
        (warningReport) =>
          new TrackerImportValidationReport({
            uid: warningReport['uid'] as string,
            type: 'WARNING',
            errorCode: warningReport['errorCode'] as string,
            objectType: warningReport['trackerType'] as string,
            message: warningReport['message'] as string,
          })
      ),
    ];
  }
}
