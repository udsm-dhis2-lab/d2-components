// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class ChartTypeUtil {
  static getAllowedType(chartType: string): string | undefined {
    if (!chartType) {
      return undefined;
    }

    let newChartType;
    const splitedChartType: string[] = chartType.split('_');
    switch (chartType) {
      case 'radar':
        newChartType = 'line';
        break;
      case 'dotted':
        newChartType = 'line';
        break;
      default:
        newChartType =
          splitedChartType.length > 1
            ? splitedChartType[1]
            : splitedChartType[0];
        break;
    }

    if (newChartType?.length === 0) {
      return undefined;
    }

    return newChartType;
  }
}
