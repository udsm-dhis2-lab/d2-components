import { TestBed } from '@angular/core/testing';
import { D2Visualizer, DownloadFormat } from '@iapps/d2-visualizer';
import { of } from 'rxjs';
import { periodSelection } from '../../../testing/dashboard.fixtures';
import { DashboardItemService, TrackerDashboardService } from '../../services';
import { DashboardItemComponent } from './dashboard-item.component';

describe('DashboardItemComponent visualization boundary', () => {
  const itemService = { getItem: jest.fn(() => of({
    id: 'visualization-a', type: 'COLUMN', title: 'Coverage',
  })) };
  const trackerService = { getTrackedEntityInstances: jest.fn(() => of(undefined)) };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: DashboardItemService, useValue: itemService },
      { provide: TrackerDashboardService, useValue: trackerService },
    ] });
    (D2Visualizer as unknown as { instances: unknown[] }).instances.length = 0;
    document.body.innerHTML = '<div class="dashboard-item-item-a" style="height: 500px"></div>';
  });

  const createComponent = () => TestBed.runInInjectionContext(() => {
    const component = new DashboardItemComponent();
    component.dashboardItem = {
      id: 'item-a', type: 'CHART', x: 0, y: 0, h: 20, w: 29,
      visualization: { id: 'visualization-a', name: 'Coverage', type: 'COLUMN',
        regressionType: 'NONE', dimensions: [] },
    };
    component.dataSelections = [periodSelection()];
    return component;
  });

  it('loads metadata once and draws through the visualizer boundary', async () => {
    const component = createComponent();
    await component.setVisualization();
    await component.setVisualization();

    expect(itemService.getItem).toHaveBeenCalledTimes(1);
    expect(component.visualizer).toBeInstanceOf(D2Visualizer);
    expect(component.visualizer.draw).toHaveBeenCalled();
  });

  it('delegates download and visualization-type actions', async () => {
    const component = createComponent();
    await component.setVisualization();

    component.onDownload(DownloadFormat.PNG);
    await component.onTypeChange('LINE');

    expect(component.visualizer.download).toHaveBeenCalledWith(DownloadFormat.PNG);
    expect(component.visualizer.visualizationType).toBe('LINE');
    expect(component.visualizer.draw).toHaveBeenCalledTimes(2);
  });

  it('loads tracker records before drawing tracker visualizations', async () => {
    itemService.getItem.mockReturnValueOnce(of({
      id: 'visualization-a', type: 'COLUMN', isTrackerVisualization: true,
      program: 'program-a', periodType: 'Yearly',
    }));
    trackerService.getTrackedEntityInstances.mockReturnValueOnce(of({
      trackedEntityInstances: [{ trackedEntity: 'tei-a' }], program: { id: 'program-a' },
    }));
    const component = createComponent();
    await component.setVisualization();

    expect(trackerService.getTrackedEntityInstances).toHaveBeenCalledWith(
      'program-a', 'Yearly', component.dataSelections
    );
  });
});
