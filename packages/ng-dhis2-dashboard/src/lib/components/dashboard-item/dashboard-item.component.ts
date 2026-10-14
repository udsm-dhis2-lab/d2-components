/* eslint-disable @angular-eslint/component-selector */
import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  D2Visualizer,
  DownloadFormat,
  VISUALIZATION_TYPES,
  VisualizerPlotOptions,
} from '@iapps/d2-visualizer';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { DashboardItemObject, VisualizationDataSelection } from '../../models';
import { DashboardItemService, TrackerDashboardService } from '../../services';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardItemHeaderComponent } from '../dashboard-item-header/dashboard-item-header.component';

interface VisualizationRenderRequest {
  key: string;
  visualizationId: string;
  selections: VisualizationDataSelection[];
}

interface DisposableVisualizer {
  dispose?: () => void;
}

@Component({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    DashboardItemHeaderComponent,
  ],
  selector: 'd2-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardItemComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() trackedEntityInstances?: any[];
  @Input() isTrackerDashboard?: boolean;
  @Input() dashboardItem!: DashboardItemObject;
  @Input() dataSelections?: VisualizationDataSelection[];

  visualizationConfig: any;

  private _loading$: BehaviorSubject<boolean>;
  loading$: Observable<boolean>;
  error?: any;
  dashboardItemHeight!: string;
  fullScreen!: boolean;
  visualizationElement: any;
  hideVisualization?: boolean;
  visualizer!: D2Visualizer;

  private completedRenderKey?: string;
  private configuredVisualizationId?: string;
  private destroyed = false;
  private activeRenderKey?: string;
  private pendingRender?: VisualizationRenderRequest;
  private renderLoop?: Promise<void>;
  private resizeObserver?: ResizeObserver;
  private selectedVisualizationType?: string;

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  fullScreenModes(event: any) {
    event.stopPropagation();

    if (!document.fullscreenElement) {
      this.fullScreen = false;
    }
  }

  get isChart(): boolean {
    return [
      'CHART',
      'LINE',
      'COLUMN',
      'BAR',
      'DOTTED',
      'PIE',
      'STACKED_BAR',
      'STACKED_COLUMN',
      'YEAR_OVER_YEAR_LINE',
    ].includes(
      this.dashboardItem?.visualization?.type || this.dashboardItem.type
    );
  }

  get visualizationHeight(): string {
    return this.fullScreen ? '100vh' : this.dashboardItemHeight || '400px';
  }

  get currrentVisualizationType() {
    return VISUALIZATION_TYPES.find(
      (visualizationTypeObject) =>
        visualizationTypeObject.type ===
        this.visualizer?.visualizationType?.toUpperCase()
    );
  }

  get disableVisualizationChange() {
    return ['TRACKED_ENTITY_LAYER', 'MAP'].includes(
      this.currrentVisualizationType?.type || ''
    );
  }

  get dashboardContainerId(): string {
    return (
      (this.dashboardItem?.visualization?.id || 'visualization_id') +
      '__container'
    );
  }

  get dashboardVisualizationId(): string {
    return this.dashboardItem?.visualization?.id || 'visualization_id';
  }

  get visualizationContainerHeight(): string {
    const offsetHeight = this.currrentVisualizationType ? '56px' : '16px';

    return `calc(${
      this.fullScreen ? '100vh' : this.dashboardItemHeight
    } - ${offsetHeight})`;
  }

  private dashboardItemService = inject(DashboardItemService);
  private trackerDashboardService = inject(TrackerDashboardService);
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef, {
    optional: true,
  });

  constructor() {
    this._loading$ = new BehaviorSubject<boolean>(true);
    this.loading$ = this._loading$.asObservable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const dashboardItemChanged =
      changes['dashboardItem'] && !changes['dashboardItem'].firstChange;
    const selectionsChanged =
      changes['dataSelections'] && !changes['dataSelections'].firstChange;

    if (dashboardItemChanged) {
      this.resetVisualization();
    }

    if (dashboardItemChanged || selectionsChanged) {
      void this.setVisualization();
    }
  }

  async ngOnInit() {
    this.dashboardItemHeight =
      (document.getElementsByClassName(
        'dashboard-item-' + this.dashboardItem.id
      )[0]?.clientHeight || 400) + 'px';
    void this.setVisualization();
  }

  ngAfterViewInit(): void {
    const observedElement = this.elementRef?.nativeElement.parentElement;
    if (!observedElement || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      const height = Math.round(entries[0]?.contentRect.height || 0);
      if (height <= 0 || `${height}px` === this.dashboardItemHeight) {
        return;
      }

      this.dashboardItemHeight = `${height}px`;
      if (this.visualizer) {
        void this.setVisualization();
      }
    });
    this.resizeObserver.observe(observedElement);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.pendingRender = undefined;
    this.resizeObserver?.disconnect();
    this.disposeVisualizer();
    this._loading$.complete();
  }

  setVisualization(): Promise<void> {
    const visualizationId = this.dashboardItem?.visualization?.id;
    if (!visualizationId || this.destroyed) {
      this._loading$.next(false);
      return Promise.resolve();
    }

    const selections = [...(this.dataSelections || [])];
    const key = this.getRenderKey(visualizationId, selections);
    if (
      key === this.completedRenderKey ||
      key === this.activeRenderKey ||
      key === this.pendingRender?.key
    ) {
      return this.renderLoop || Promise.resolve();
    }

    this.pendingRender = { key, visualizationId, selections };
    this.error = undefined;
    this._loading$.next(true);

    if (!this.renderLoop) {
      this.renderLoop = this.processRenderQueue().finally(() => {
        this.renderLoop = undefined;
        if (!this.destroyed) {
          this._loading$.next(false);
        }
      });
    }

    return this.renderLoop;
  }

  onDownload(format: DownloadFormat) {
    this.visualizer.download(format);
  }

  async onFullScreenAction() {
    this.visualizationElement = document.getElementById(
      this.dashboardContainerId
    );

    this.hideVisualization = true;

    if (!this.fullScreen) {
      this.openFullscreen();
    } else {
      this.closeFullscreen();
    }

    this.fullScreen = !this.fullScreen;
    this.hideVisualization = false;
    await this.setVisualization();
  }

  async onTypeChange(visualizationType: any) {
    this.selectedVisualizationType = visualizationType;
    this.visualizer.setChartType(visualizationType).setType(visualizationType);
    this.disposeRenderer();
    await this.visualizer.draw();
  }

  openFullscreen() {
    if (this.visualizationElement.requestFullscreen) {
      this.visualizationElement.requestFullscreen();
    } else if (this.visualizationElement.mozRequestFullScreen) {
      /* Firefox */
      this.visualizationElement.mozRequestFullScreen();
    } else if (this.visualizationElement.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.visualizationElement.webkitRequestFullscreen();
    } else if (this.visualizationElement.msRequestFullscreen) {
      /* IE/Edge */
      this.visualizationElement.msRequestFullscreen();
    }
  }

  closeFullscreen() {
    document.exitFullscreen();
  }

  private _getTrackedEntityInstances() {
    return firstValueFrom(
      this.trackerDashboardService.getTrackedEntityInstances(
        this.visualizationConfig.program as string,
        this.visualizationConfig.periodType as string,
        this.dataSelections
      )
    );
  }

  private async processRenderQueue(): Promise<void> {
    while (this.pendingRender && !this.destroyed) {
      const request = this.pendingRender;
      this.pendingRender = undefined;
      this.activeRenderKey = request.key;

      try {
        await this.render(request);
      } catch (error) {
        this.disposeRenderer();
        if (!this.pendingRender && !this.destroyed) {
          this.error = error;
        }
      } finally {
        this.activeRenderKey = undefined;
      }
    }
  }

  private async render(request: VisualizationRenderRequest): Promise<void> {
    if (this.configuredVisualizationId !== request.visualizationId) {
      const config = await firstValueFrom(
        this.dashboardItemService.getItem(
          request.visualizationId,
          this.dashboardItem.type,
          this.dashboardItem.hasExtension
        )
      );

      if (this.isSuperseded(request)) {
        return;
      }

      this.visualizationConfig = config;
      this.configuredVisualizationId = request.visualizationId;
    }

    const trackedEntityInstanceResponse = this.visualizationConfig
      .isTrackerVisualization
      ? await this._getTrackedEntityInstances()
      : undefined;

    if (this.isSuperseded(request)) {
      return;
    }

    if (!this.visualizer) {
      this.visualizer = new D2Visualizer();
    } else {
      this.disposeRenderer();
    }

    const visualizationType =
      this.selectedVisualizationType || this.visualizationConfig.type;

    this.visualizer
      .setId(this.visualizationConfig?.id)
      .setConfig(this.visualizationConfig)
      .setSelections(request.selections)
      .setType(visualizationType?.toUpperCase())
      .setChartType(visualizationType)
      .setPlotOptions(
        new VisualizerPlotOptions().setHeight(this.visualizationHeight)
      )
      .setTrackedEntityInstances(
        trackedEntityInstanceResponse?.trackedEntityInstances as any[]
      )
      .setProgram(trackedEntityInstanceResponse?.program as any);

    await this.visualizer.draw();

    if (this.isSuperseded(request)) {
      this.disposeRenderer();
      return;
    }

    this.completedRenderKey = request.key;
  }

  private isSuperseded(request: VisualizationRenderRequest): boolean {
    return (
      this.destroyed ||
      (!!this.pendingRender && this.pendingRender.key !== request.key)
    );
  }

  private getRenderKey(
    visualizationId: string,
    selections: VisualizationDataSelection[]
  ): string {
    return JSON.stringify({
      visualizationId,
      type: this.dashboardItem.type,
      hasExtension: !!this.dashboardItem.hasExtension,
      height: this.visualizationHeight,
      selections,
    });
  }

  private resetVisualization(): void {
    this.pendingRender = undefined;
    this.activeRenderKey = undefined;
    this.completedRenderKey = undefined;
    this.configuredVisualizationId = undefined;
    this.visualizationConfig = undefined;
    this.selectedVisualizationType = undefined;
    this.disposeVisualizer();
  }

  private disposeRenderer(): void {
    const renderer = this.visualizer?.visualizer as
      | DisposableVisualizer
      | undefined;
    renderer?.dispose?.();
  }

  private disposeVisualizer(): void {
    this.disposeRenderer();
    this.visualizer = undefined as unknown as D2Visualizer;
  }
}
