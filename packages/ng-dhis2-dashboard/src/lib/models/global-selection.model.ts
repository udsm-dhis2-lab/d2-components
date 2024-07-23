import { DIMENSION_LABELS } from '../constants/selection-dimension-label.constant';
import { VisualizationDataSelection } from './visualization-data-selection.model';

export interface IGlobalSelection {
  default: boolean;
  summary?: string;
  dataSelections: VisualizationDataSelection[];
}

export class GlobalSelection implements IGlobalSelection {
  default: boolean;
  summary?: string;
  dataSelections: VisualizationDataSelection[];

  constructor(selections: Partial<GlobalSelection>) {
    this.default = selections.default !== undefined ? selections.default : true;
    this.dataSelections = selections.dataSelections || [];
    this.summary = this.getSummaryText();
  }

  getSelectionSummary() {
    return this.dataSelections
      .map(
        (dataSelection: any) =>
          ((DIMENSION_LABELS || {})[dataSelection.dimension] ||
            dataSelection.label ||
            'Dimension') +
          ': ' +
          dataSelection.items.map((item: any) => item.name || item.id).join(',')
      )
      .join(' - ');
  }

  getSummaryText(): string | undefined {
    const selectionSummary = this.getSelectionSummary();

    if (!selectionSummary) {
      return undefined;
    }
    return 'Showing data for ' + selectionSummary;
  }
}
