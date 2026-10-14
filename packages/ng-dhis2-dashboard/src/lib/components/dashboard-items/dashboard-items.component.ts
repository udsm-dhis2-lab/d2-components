import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  KtdGridLayout,
  KtdGridModule,
  ktdTrackById,
} from '@katoid/angular-grid-layout';
import { DashboardItemObject, VisualizationDataSelection } from '../../models';

import { DashboardItemComponent } from '../dashboard-item/dashboard-item.component';
import { ViewportActivationDirective } from './viewport-activation.directive';

@Component({
  imports: [DashboardItemComponent, KtdGridModule, ViewportActivationDirective],
  selector: 'd2-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardItemsComponent implements OnChanges {
  @Input() dashboardId?: string;
  @Input() dashboardItems!: DashboardItemObject[];
  @Input() dashboardItemsLayout!: KtdGridLayout;
  @Input() dataSelections?: VisualizationDataSelection[];

  cols = 60;
  rowHeight = 20;

  trackById = ktdTrackById;

  private readonly activatedItemIds = new Set<string>();

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardId']) {
      this.activatedItemIds.clear();
    }
  }

  activateItem(itemId: string): void {
    if (this.activatedItemIds.has(itemId)) {
      return;
    }

    this.activatedItemIds.add(itemId);
    this.changeDetectorRef.markForCheck();
  }

  isItemActivated(itemId: string): boolean {
    return this.activatedItemIds.has(itemId);
  }

  activationKey(itemId: string): string {
    return `${this.dashboardId || 'dashboard'}:${itemId}`;
  }
}
