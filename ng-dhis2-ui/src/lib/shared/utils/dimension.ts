import { isObject } from 'lodash';
import { isString } from 'lodash';

// Dimension

export const DIMENSION = {
  isValid: (dimension: any) => isObject(dimension),
};

// Props

export const DIMENSION_PROP_ID = {
  name: 'dimension',
  defaultValue: '',
  required: true,
  isValid: (prop: any) => isString(prop),
};

export const DIMENSION_PROP_ITEMS = {
  name: 'items',
  defaultValue: [],
  required: false,
  isValid: (prop: any) => Array.isArray(prop),
};

export const DIMENSION_PROP_FILTER = {
  name: 'filter',
  defaultValue: [],
  required: false,
  isValid: (prop: any) => isString(prop),
};

export const DIMENSION_PROP_LEGEND_SET = {
  name: 'legendSet',
  defaultValue: [],
  required: false,
  isValid: (prop: any) => isString(prop),
};

export const DIMENSION_PROP_PROGRAM_STAGE = {
  name: 'programStage',
  defaultValue: {},
  required: false,
  isValid: (prop: any) => isObject(prop),
};

export const DIMENSION_PROP_REPETITION = {
  name: 'repetition',
  defaultValue: [],
  required: false,
  isValid: (prop: any) => Array.isArray(prop),
};

export const DIMENSION_PROPS = [
  DIMENSION_PROP_ID,
  DIMENSION_PROP_ITEMS,
  DIMENSION_PROP_FILTER,
  DIMENSION_PROP_LEGEND_SET,
  DIMENSION_PROP_PROGRAM_STAGE,
  DIMENSION_PROP_REPETITION,
];
