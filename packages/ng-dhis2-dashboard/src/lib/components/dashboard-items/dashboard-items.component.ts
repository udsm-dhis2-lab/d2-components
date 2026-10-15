import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  KtdGridComponent,
  KtdGridLayout,
  KtdGridModule,
  ktdTrackById,
} from '@katoid/angular-grid-layout';
import { DashboardItemObject, VisualizationDataSelection } from '../../models';
import { DashboardItemComponent } from '../dashboard-item/dashboard-item.component';
import {
  DashboardLayoutMode,
  DASHBOARD_WIDE_COLUMNS,
  deriveDashboardLayout,
  getDashboardLayoutColumns,
  getDashboardLayoutMode,
} from './dashboard-layout.util';
import { ViewportActivationDirective } from './viewport-activation.directive';

@Component({
  imports: [DashboardItemComponent, KtdGridModule, ViewportActivationDirective],
  selector: 'd2-dashboard-items',
  templateUrl: './dashboard-items.component.html',
  styleUrls: ['./dashboard-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardItemsComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() dashboardId?: string;
  @Input() dashboardItems!: DashboardItemObject[];
  @Input() dashboardItemsLayout!: KtdGridLayout;
  @Input() dataSelections?: VisualizationDataSelection[];

  @ViewChild(KtdGridComponent) private grid?: KtdGridComponent;

  cols = DASHBOARD_WIDE_COLUMNS;
  rowHeight = 20;
  trackById = ktdTrackById;
  renderedDashboardItems: DashboardItemObject[] = [];
  renderedLayout: KtdGridLayout = [];
  layoutMode: DashboardLayoutMode = 'wide';

  private readonly activatedItemIds = new Set<string>();
  private canonicalLayout: KtdGridLayout = [];
  private resizeObserver?: ResizeObserver;
  private resizeFrameId?: number;
  private resizeScheduled = false;
  private pendingResize?: { width: number; generation: number };
  private observedWidth?: number;
  private layoutGeneration = 0;
  private destroyed = false;

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    @Optional() private readonly elementRef?: ElementRef<HTMLElement>
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboardId']) {
      this.activatedItemIds.clear();
      this.invalidateScheduledResize();
    }

    if (changes['dashboardItemsLayout']) {
      this.canonicalLayout = (this.dashboardItemsLayout || []).map((item) => ({
        ...item,
      }));
      this.layoutGeneration += 1;
      this.applyLayoutMode(this.layoutMode, true);
    }

    if (changes['dashboardItems'] || changes['dashboardItemsLayout']) {
      this.updateRenderedDashboardItems();
    }
  }

  ngAfterViewInit(): void {
    const element = this.elementRef?.nativeElement;
    if (!element || typeof globalThis.ResizeObserver === 'undefined') {
      return;
    }

    const initialWidth = Math.round(
      element.getBoundingClientRect().width || element.clientWidth || 0
    );
    if (initialWidth > 0) {
      this.applyContainerWidth(initialWidth);
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width || 0);
      if (width > 0) {
        this.scheduleContainerResize(width);
      }
    });
    this.resizeObserver.observe(element);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.invalidateScheduledResize();
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

  private scheduleContainerResize(width: number): void {
    this.pendingResize = { width, generation: this.layoutGeneration };
    if (this.resizeScheduled) {
      return;
    }

    this.resizeScheduled = true;
    const applyPendingResize = () => {
      this.resizeFrameId = undefined;
      this.resizeScheduled = false;
      const pendingResize = this.pendingResize;
      this.pendingResize = undefined;
      if (
        this.destroyed ||
        !pendingResize ||
        pendingResize.generation !== this.layoutGeneration
      ) {
        return;
      }
      this.applyContainerWidth(pendingResize.width);
    };

    if (typeof globalThis.requestAnimationFrame === 'function') {
      this.resizeFrameId = globalThis.requestAnimationFrame(
        applyPendingResize
      );
    } else {
      queueMicrotask(applyPendingResize);
    }
  }

  private applyContainerWidth(width: number): void {
    if (width === this.observedWidth) {
      return;
    }

    this.observedWidth = width;
    const nextMode = getDashboardLayoutMode(width);
    if (nextMode !== this.layoutMode) {
      this.applyLayoutMode(nextMode);
      return;
    }

    this.grid?.resize();
  }

  private applyLayoutMode(
    mode: DashboardLayoutMode,
    force = false
  ): void {
    if (!force && mode === this.layoutMode) {
      return;
    }

    this.layoutMode = mode;
    this.cols = getDashboardLayoutColumns(mode);
    this.renderedLayout = deriveDashboardLayout(this.canonicalLayout, mode);
    this.changeDetectorRef.markForCheck();
  }

  private updateRenderedDashboardItems(): void {
    const layoutOrder = new Map(
      [...this.canonicalLayout]
        .map((item, sourceIndex) => ({ item, sourceIndex }))
        .sort(
          (left, right) =>
            left.item.y - right.item.y ||
            left.item.x - right.item.x ||
            left.sourceIndex - right.sourceIndex
        )
        .map(({ item }, index) => [item.id, index])
    );
    const sourceOrder = new Map(
      (this.dashboardItems || []).map((item, index) => [item.id, index])
    );
    this.renderedDashboardItems = [...(this.dashboardItems || [])].sort(
      (left, right) =>
        (layoutOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
          (layoutOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER) ||
        (sourceOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
          (sourceOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER)
    );
  }

  private invalidateScheduledResize(): void {
    this.layoutGeneration += 1;
    this.pendingResize = undefined;
    if (
      this.resizeFrameId !== undefined &&
      typeof globalThis.cancelAnimationFrame === 'function'
    ) {
      globalThis.cancelAnimationFrame(this.resizeFrameId);
    }
    this.resizeFrameId = undefined;
    this.resizeScheduled = false;
  }
}
