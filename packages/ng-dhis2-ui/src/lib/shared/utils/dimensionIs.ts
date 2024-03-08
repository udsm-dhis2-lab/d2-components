import { DIMENSION_PROP_ID } from './dimension';

export const dimensionIs = (dimension: any, dimensionId: string) =>
  dimension[DIMENSION_PROP_ID.name] === dimensionId;
