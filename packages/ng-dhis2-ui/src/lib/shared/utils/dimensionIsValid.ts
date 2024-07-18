import { DIMENSION, DIMENSION_PROPS } from './dimension';
import { dimensionIsEmpty } from './dimensionIsEmpty';

export const dimensionIsValid = (
  dimension: { [x: string]: unknown },
  { requireItems }: any = {}
) => {
  if (!DIMENSION.isValid(dimension)) {
    return false;
  }

  const requiredProps = DIMENSION_PROPS.filter((prop) => prop.required);

  if (!requiredProps.every((prop) => prop.isValid(dimension[prop.name]))) {
    return false;
  }

  if (
    requireItems === true &&
    dimensionIsEmpty(dimension as { [x: string]: any[] })
  ) {
    return false;
  }

  return true;
};
