import { VisualizationDataSelection } from './visualization-data-selection.model';

export interface GlobalFilter {
  id: string;
  dataSelections: VisualizationDataSelection[];
}
