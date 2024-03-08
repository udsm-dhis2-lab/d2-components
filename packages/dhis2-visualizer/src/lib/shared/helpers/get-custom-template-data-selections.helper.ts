import { keys, unionBy, uniqBy } from 'lodash';
import { VisualizationDataSelection } from '../models/visualization-data-selection.model';

export function getCustomTemplateDataSelections(
  templateHTML: string,
  defaultDataSelections: VisualizationDataSelection[]
): VisualizationDataSelection[] {
  const dataVariables: string[] = templateHTML.match(/\{{([^{^)]+)}}/g) || [];

  const results: Record<string, unknown> = (dataVariables || []).reduce(
    (variableObject: Record<string, unknown>, dataVariable: string) => {
      const dataDimensions = dataVariable
        .replace(/[{}']/g, '')
        .split(';')
        .reduce((dimensionObject: any, dimensionVariable) => {
          const dimensionParams = dimensionVariable.split(':');

          if (dimensionParams[1]?.indexOf('PERCENT') !== -1) {
            const percentageVariables = (dimensionParams[1] || '')
              ?.replace(/(^PERCENT<)|(>$)/g, '')
              ?.replace(/\s/g, '')
              ?.split(',');
            return {
              ...dimensionObject,
              [dimensionParams[0]]: uniqBy(
                [
                  ...(dimensionObject[dimensionParams[0] as string] || []),
                  ...percentageVariables.map((id) => ({ id })),
                ],
                'id'
              ),
            };
          }

          return {
            ...dimensionObject,
            [dimensionParams[0]]: uniqBy(
              [
                ...(dimensionObject[dimensionParams[0] as string] || []),
                { id: dimensionParams[1] },
              ],
              'id'
            ),
          };
        }, variableObject);

      return dataDimensions;
    },
    {}
  );

  return unionBy(
    keys(results).map((dimension: string) => ({
      dimension,
      items: results[dimension],
    })),
    defaultDataSelections,
    'dimension'
  ) as VisualizationDataSelection[];
}
