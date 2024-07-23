import { layoutGetAllAxes } from './layoutGetAllAxes';

export const layoutGetAllDimensions = (layout: any) =>
  layoutGetAllAxes(layout).reduce((allDimensions: any, axis: any) => {
    allDimensions.push(...axis);
    return allDimensions;
  }, []);
