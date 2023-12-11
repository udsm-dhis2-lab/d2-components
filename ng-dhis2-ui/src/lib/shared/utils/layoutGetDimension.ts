import { dimensionIs } from './dimensionIs';
import { layoutGetAllDimensions } from './layoutGetAllDimensions';

export const layoutGetDimension = (layout: any, dimensionId: string) =>
  layoutGetAllDimensions(layout).find((dimension: any) =>
    dimensionIs(dimension, dimensionId)
  );
