// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import * as _ from 'lodash';
// TODO: Find best way to get axis items without using underscore
export class ChartAxisUtil {
  static getXAxisItems(analyticsObject: any, axisTypeArray: any[]) {
    let items: any[] = [];
    const metadataNames = analyticsObject?.metaData?.names;
    axisTypeArray.forEach((axisType, axisIndex) => {
      const itemKeys = analyticsObject.metaData[axisType];
      if (itemKeys) {
        if (axisIndex > 0) {
          const availableItems = _.assign([], items);
          items = [];
          itemKeys.forEach((itemKey: string) => {
            availableItems.forEach((item: { id: string; name: string }) => {
              items.push({
                id: item.id + '_' + itemKey,
                name: item.name + '_' + metadataNames[itemKey].trim(),
              });
            });
          });
        } else {
          items = _.map(itemKeys, (itemKey: string | number) => {
            return {
              id: itemKey,
              name: metadataNames[itemKey].trim(),
            };
          });
        }
      }
    });

    return items;
  }

  static getYAxisItems(analyticsObject: any, axisType: string) {
    let items: any[] = [];
    const metadataNames = analyticsObject.metaData.names;
    const itemKeys = analyticsObject.metaData[axisType];

    if (itemKeys) {
      items = _.map(itemKeys, (itemKey: string | number) => {
        return {
          id: itemKey,
          name: metadataNames[itemKey],
        };
      });
    }

    return items;
  }

  static sanitizeYAxisTextAlignment(textAlign: 'LEFT' | 'RIGHT'): string {
    switch (textAlign) {
      case 'LEFT':
        return 'low';
      case 'RIGHT':
        return 'high';
      default:
        return 'middle';
    }
  }
}
