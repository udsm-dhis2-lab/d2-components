import { AXIS } from './axis';
import { dimensionIs } from './dimensionIs';

export const axisGetDimension = (axis: any, dimensionId: string) =>
  AXIS.isValid(axis) &&
  axis.find((dimension: any) => dimensionIs(dimension, dimensionId));
