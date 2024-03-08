import { axisGetDimension } from './axisGetDimension';

export const axisHasDimension = (axis: any, dimensionId: string) =>
  Boolean(axisGetDimension(axis, dimensionId));
