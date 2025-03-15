// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { AnalyticsResult } from '@iapps/function-analytics';
import { Legend, LegendSet } from '../../../shared';

export class LegendSetUtil {
  static generateFromColorScale(
    mapConfig: {
      colorScale: string;
      classes: number;
      method: number;
      noDataColor: string;
    },
    data: AnalyticsResult
  ): LegendSet {
    if (!mapConfig?.colorScale) {
      return {
        name: 'Legend',
        id: 'legend-set',
        legends: [],
      };
    }

    const dataValues = (data?.rows || []).map((row) => Number(row.value));

    const legendClasses = LegendSetUtil.generateLegendClasses(
      dataValues,
      mapConfig.classes
    );

    let legends = mapConfig.colorScale
      .split(',')
      .map((color, colorIndex: number) => {
        const legendClass = legendClasses[colorIndex];
        if (!legendClass) {
          return null;
        }

        const legend: Legend = {
          id: color,
          name: legendClass.join(' - '),
          color,
          startValue: legendClass[0],
          endValue: legendClass[1],
        };

        return legend;
      })
      .filter((legend) => legend) as Legend[];

    if (mapConfig.noDataColor) {
      legends = [
        ...legends,
        {
          id: mapConfig.noDataColor,
          name: 'No Data',
          color: mapConfig.noDataColor,
          startValue: 0,
          endValue: 0,
        },
      ];
    }

    return {
      id: 'legend-set',
      name: 'Legend',
      legends,
    };
  }

  static generateLegendClasses(
    data: number[],
    numClasses: number
  ): [number, number][] {
    if (data.length === 0) {
      return [];
    }

    // Find min and max values
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);

    // Calculate class interval
    const interval = (maxValue - minValue) / numClasses;

    // Generate class ranges
    const legendClasses: [number, number][] = [];
    let start = minValue;

    for (let i = 0; i < numClasses; i++) {
      const end = parseFloat((start + interval).toFixed(1)); // Round to one decimal place
      legendClasses.push([parseFloat(start.toFixed(1)), end]);
      start = end;
    }

    return legendClasses;
  }
}
