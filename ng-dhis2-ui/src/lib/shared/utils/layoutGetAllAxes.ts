import { AXIS_ID_COLUMNS, AXIS_ID_ROWS, AXIS_ID_FILTERS } from './axis';

export const layoutGetAllAxes = (layout: any) => [
  layout[AXIS_ID_COLUMNS],
  layout[AXIS_ID_ROWS],
  layout[AXIS_ID_FILTERS],
];
