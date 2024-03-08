import { Component, EventEmitter, Input, Output } from '@angular/core';
import { find } from 'lodash';
import { DIMENSION_LABELS } from '../../constants/selection-dimension-label.constant';
import { VisualizationDataSelection } from '../../models';
import { IGlobalSelection } from '../../models/global-selection.model';

@Component({
  selector: 'd2-dashboard-selection-summary',
  templateUrl: './dashboard-selection-summary.component.html',
  styleUrls: ['./dashboard-selection-summary.component.scss'],
})
export class DashboardSelectionSummaryComponent {
  @Input() globalSelection?: IGlobalSelection;

  @Output() removeSelection: EventEmitter<VisualizationDataSelection[]> =
    new EventEmitter<VisualizationDataSelection[]>();

  dimensionLabels: any = DIMENSION_LABELS;

  onRemoveSelection(e: MouseEvent, dimension: string) {
    e.stopPropagation();

    const dataSelections = this.globalSelection?.dataSelections || [];

    const availableSelection = find(dataSelections, ['dimension', dimension]);

    if (availableSelection) {
      const indexToRemove = dataSelections?.indexOf(availableSelection);
      this.removeSelection.emit([
        ...dataSelections.slice(0, indexToRemove),
        ...dataSelections.slice(indexToRemove + 1),
      ]);
    }
  }
}
