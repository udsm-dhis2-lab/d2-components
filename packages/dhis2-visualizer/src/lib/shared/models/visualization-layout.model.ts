import { VisualizationDataSelection } from './visualization-data-selection.model';
import * as _ from 'lodash';

export class VisualizationLayout {
  rows: Array<string> = [];
  columns: Array<string> = [];
  filters: Array<string> = [];
  excluded?: Array<string>;

  static getLayout(
    dataSelections: VisualizationDataSelection[]
  ): VisualizationLayout | undefined {
    if (!dataSelections) {
      return undefined;
    }
    const groupedLayout = _.groupBy(
      dataSelections.map((dataSelection) => {
        return {
          dimension: dataSelection.dimension,
          layout: dataSelection.layout,
        };
      }),
      'layout'
    );

    return VisualizationLayout.getStandardizedLayout(groupedLayout);
  }

  static getStandardizedLayout(layoutObject: any): VisualizationLayout {
    const layoutKeys = _.keys(layoutObject);
    const newLayout: VisualizationLayout = {
      rows: ['dx'],
      columns: ['ou'],
      filters: [],
    };
    _.each(layoutKeys, (layoutKey) => {
      const layouts = layoutObject[layoutKey];
      (newLayout as any)[layoutKey] = _.map(
        layouts,
        (layout) => layout.dimension
      );
    });
    return newLayout;
  }
}
