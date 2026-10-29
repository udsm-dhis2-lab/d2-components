import { ElementRef, SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { D2Visualizer, DownloadFormat } from '@iapps/d2-visualizer';
import { of, ReplaySubject, Subject, throwError } from 'rxjs';
import {
  orgUnitSelection,
  periodSelection,
} from '../../../testing/dashboard.fixtures';
import { DashboardItemObject } from '../../models';
import { DashboardItemService, TrackerDashboardService } from '../../services';
import { DashboardItemComponent } from './dashboard-item.component';

describe('DashboardItemComponent visualization boundary', () => {
  const itemService = {
    getItem: jest.fn(() =>
      of({ id: 'visualization-a', type: 'COLUMN', title: 'Coverage' })
    ),
  };
  const trackerService = {
    getTrackedEntityInstances: jest.fn(() => of(undefined)),
  };
  const host = document.createElement('d2-dashboard-item');
  const observedElement = document.createElement('div');

  const item = (
    id = 'item-a',
    visualizationId = 'visualization-a'
  ): DashboardItemObject => ({
    id,
    type: 'CHART',
    x: 0,
    y: 0,
    h: 20,
    w: 29,
    visualization: {
      id: visualizationId,
      name: 'Coverage',
      type: 'COLUMN',
      regressionType: 'NONE',
      dimensions: [],
    },
  });

  beforeEach(() => {
    host.replaceChildren();
    observedElement.replaceChildren(host);
    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardItemService, useValue: itemService },
        { provide: TrackerDashboardService, useValue: trackerService },
        { provide: ElementRef, useValue: new ElementRef(host) },
      ],
    });
    (D2Visualizer as unknown as { instances: unknown[] }).instances.length = 0;
    itemService.getItem.mockReturnValue(
      of({ id: 'visualization-a', type: 'COLUMN', title: 'Coverage' })
    );
    trackerService.getTrackedEntityInstances.mockReturnValue(of(undefined));
    document.body.innerHTML =
      '<div class="dashboard-item-item-a" style="height: 500px"></div>';
  });

  const createComponent = () =>
    TestBed.runInInjectionContext(() => {
      const component = new DashboardItemComponent();
      component.dashboardItem = item();
      component.dataSelections = [periodSelection()];
      component.dashboardItemHeight = '500px';
      return component;
    });

  const instances = () =>
    (D2Visualizer as unknown as { instances: D2Visualizer[] }).instances;

  it('loads metadata once and coalesces equivalent render requests', async () => {
    const component = createComponent();
    const first = component.setVisualization();
    const duplicate = component.setVisualization();
    await Promise.all([first, duplicate]);

    component.dataSelections = [periodSelection()];
    await component.setVisualization();

    expect(itemService.getItem).toHaveBeenCalledTimes(1);
    expect(instances()).toHaveLength(1);
    expect(component.visualizer.draw).toHaveBeenCalledTimes(1);
  });

  it('redraws a changed selection on the owned instance and disposes its renderer', async () => {
    const component = createComponent();
    await component.setVisualization();
    const visualizer = component.visualizer;

    component.dataSelections = [orgUnitSelection()];
    await component.setVisualization();

    expect(instances()).toHaveLength(1);
    expect(visualizer.draw).toHaveBeenCalledTimes(2);
    expect(visualizer.visualizer.dispose).toHaveBeenCalledTimes(1);
  });

  it('renders a non-initial dataSelections input change', async () => {
    const component = createComponent();
    await component.setVisualization();
    const previousSelections = component.dataSelections;
    component.dataSelections = [orgUnitSelection()];

    component.ngOnChanges({
      dataSelections: new SimpleChange(
        previousSelections,
        component.dataSelections,
        false
      ),
    });
    await component.setVisualization();

    expect(component.visualizer.draw).toHaveBeenCalledTimes(2);
  });

  it('replaces metadata and resources when the dashboard item input changes', async () => {
    const component = createComponent();
    await component.setVisualization();
    const previousVisualizer = component.visualizer;
    itemService.getItem.mockReturnValueOnce(
      of({ id: 'visualization-b', type: 'LINE', title: 'Cases' })
    );

    const previousItem = component.dashboardItem;
    component.dashboardItem = item('item-b', 'visualization-b');
    component.ngOnChanges({
      dashboardItem: new SimpleChange(
        previousItem,
        component.dashboardItem,
        false
      ),
    });
    await component.setVisualization();

    expect(previousVisualizer.visualizer.dispose).toHaveBeenCalled();
    expect(itemService.getItem).toHaveBeenLastCalledWith(
      'visualization-b',
      'CHART',
      undefined
    );
    expect(component.visualizationConfig.id).toBe('visualization-b');
    expect(instances()).toHaveLength(2);
  });

  it('skips stale metadata completions during rapid dashboard switching', async () => {
    const firstMetadata = new Subject<Record<string, unknown>>();
    const secondMetadata = new ReplaySubject<Record<string, unknown>>(1);
    itemService.getItem
      .mockReturnValueOnce(firstMetadata)
      .mockReturnValueOnce(secondMetadata);
    const component = createComponent();

    const completion = component.setVisualization();
    const previousItem = component.dashboardItem;
    component.dashboardItem = item('item-b', 'visualization-b');
    component.ngOnChanges({
      dashboardItem: new SimpleChange(
        previousItem,
        component.dashboardItem,
        false
      ),
    });
    firstMetadata.next({ id: 'visualization-a', type: 'COLUMN' });
    firstMetadata.complete();
    await Promise.resolve();
    secondMetadata.next({ id: 'visualization-b', type: 'LINE' });
    secondMetadata.complete();
    await completion;

    expect(component.visualizationConfig.id).toBe('visualization-b');
    expect(instances()).toHaveLength(1);
    expect(instances()[0].config).toMatchObject({ id: 'visualization-b' });
  });

  it('owns failure state and does not retain a failed renderer', async () => {
    const failure = new Error('visualization failed');
    itemService.getItem.mockReturnValueOnce(throwError(() => failure));
    const component = createComponent();

    await component.setVisualization();

    expect(component.error).toBe(failure);
    expect(instances()).toHaveLength(0);
  });

  it('disconnects size observation and disposes resources on destruction', async () => {
    const component = createComponent();
    await component.setVisualization();
    const visualizer = component.visualizer;
    component.ngAfterViewInit();
    const observer = (
      component as unknown as { resizeObserver: ResizeObserver }
    ).resizeObserver;

    component.ngOnDestroy();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(visualizer.visualizer.dispose).toHaveBeenCalledTimes(1);
  });

  it('redraws only when the observed item height actually changes', async () => {
    const component = createComponent();
    await component.setVisualization();
    component.ngAfterViewInit();
    const observer = (
      component as unknown as {
        resizeObserver: ResizeObserver & { callback: ResizeObserverCallback };
      }
    ).resizeObserver;
    const redraw = jest.spyOn(component, 'setVisualization');
    const entry = (height: number) =>
      ({ contentRect: { height } } as unknown as ResizeObserverEntry);

    observer.callback([entry(500)], observer);
    expect(redraw).not.toHaveBeenCalled();

    observer.callback([entry(620)], observer);
    expect(component.dashboardItemHeight).toBe('620px');
    expect(redraw).toHaveBeenCalledTimes(1);
  });

  it('does not create a visualization when destroyed during metadata loading', async () => {
    const metadata = new Subject<Record<string, unknown>>();
    itemService.getItem.mockReturnValueOnce(metadata);
    const component = createComponent();

    const completion = component.setVisualization();
    component.ngOnDestroy();
    metadata.next({ id: 'visualization-a', type: 'COLUMN' });
    metadata.complete();
    await completion;

    expect(instances()).toHaveLength(0);
  });

  it('delegates download and visualization-type actions', async () => {
    const component = createComponent();
    await component.setVisualization();

    component.onDownload(DownloadFormat.PNG);
    await component.onTypeChange('LINE');

    expect(component.visualizer.download).toHaveBeenCalledWith(
      DownloadFormat.PNG
    );
    expect(component.visualizer.visualizationType).toBe('LINE');
    expect(component.visualizer.draw).toHaveBeenCalledTimes(2);
  });

  it('keeps a scatter visualization in the normal chart card flow', async () => {
    const component = createComponent();
    component.dashboardItem = item('item-a', 'visualization-a');
    component.dashboardItem.visualization!.type = 'SCATTER';
    itemService.getItem.mockReturnValue(
      of({ id: 'visualization-a', type: 'SCATTER', title: 'ANC visits' })
    );
    await component.setVisualization();

    expect(component.visualizer.visualizationType).toBe('SCATTER');
    expect(component.isChart).toBe(true);
    expect(component.currrentVisualizationType?.type).toBe('SCATTER');
    expect(component.visualizer.draw).toHaveBeenCalledTimes(1);
    component.onDownload(DownloadFormat.PNG);
    expect(component.visualizer.download).toHaveBeenCalledWith(DownloadFormat.PNG);
  });

  it('redraws for fullscreen size changes and preserves the selected type', async () => {
    const component = createComponent();
    await component.setVisualization();
    await component.onTypeChange('LINE');
    const container = document.createElement('div') as HTMLDivElement & {
      requestFullscreen: jest.Mock;
    };
    container.id = component.dashboardContainerId;
    container.requestFullscreen = jest.fn();
    document.body.appendChild(container);
    const exitFullscreen = jest.fn();
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });

    await component.onFullScreenAction();
    expect(container.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(component.fullScreen).toBe(true);
    expect(component.visualizer.visualizationType).toBe('LINE');

    await component.onFullScreenAction();
    expect(exitFullscreen).toHaveBeenCalledTimes(1);
    expect(component.fullScreen).toBe(false);

    const event = { stopPropagation: jest.fn() };
    component.fullScreen = true;
    component.fullScreenModes(event);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(component.fullScreen).toBe(false);
  });

  it('loads tracker records before drawing tracker visualizations', async () => {
    itemService.getItem.mockReturnValueOnce(
      of({
        id: 'visualization-a',
        type: 'COLUMN',
        isTrackerVisualization: true,
        program: 'program-a',
        periodType: 'Yearly',
      })
    );
    trackerService.getTrackedEntityInstances.mockReturnValueOnce(
      of({
        trackedEntityInstances: [{ trackedEntity: 'tei-a' }],
        program: { id: 'program-a' },
      })
    );
    const component = createComponent();
    await component.setVisualization();

    expect(trackerService.getTrackedEntityInstances).toHaveBeenCalledWith(
      'program-a',
      'Yearly',
      component.dataSelections
    );
  });
});
