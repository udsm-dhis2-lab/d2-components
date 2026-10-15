import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { installD2Web } from '../../testing/dashboard.fixtures';
import { DASHBOARD_CONFIG, DashboardConfigService } from './dashboard-config.service';
import { DashboardItemService } from './dashboard-item.service';
import { DashboardSelectionFilterService } from '../modules/dashboard-selection-filters/services/dashboard-selection-filter.service';
import { TrackerDashboardService } from './tracker-dashboard.service';

describe('dashboard data services', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardItemService,
        TrackerDashboardService,
        DashboardSelectionFilterService,
        DashboardConfigService,
        { provide: DASHBOARD_CONFIG, useValue: {
          rootUrl: 'dashboard', useDataStore: true, dataStoreNamespace: 'custom',
        } },
      ],
    });
  });

  it('returns the configured library options', () => {
    expect(TestBed.inject(DashboardConfigService).getConfig()).toEqual({
      rootUrl: 'dashboard', useDataStore: true, dataStoreNamespace: 'custom',
    });
  });

  it('loads and merges visualization metadata with its extension', async () => {
    const http = installD2Web({
      'visualizations/visualization-a': { id: 'visualization-a', type: 'COLUMN', name: 'Coverage' },
      'custom-visualizations/visualization-a': { isTrackerVisualization: true, program: 'program-a' },
    });

    await expect(firstValueFrom(
      TestBed.inject(DashboardItemService).getVisualization('visualization-a', true)
    )).resolves.toEqual({
      id: 'visualization-a', type: 'COLUMN', name: 'Coverage',
      isTrackerVisualization: true, program: 'program-a',
    });
    expect(http.get.mock.calls.map(([url]) => url)).toEqual([
      expect.stringContaining('visualizations/visualization-a.json'),
      'dataStore/custom-visualizations/visualization-a',
    ]);
  });

  it('maps map metadata and identifies the result as a map', async () => {
    installD2Web({ 'maps/map-a': { id: 'map-a', name: 'Cases' } });

    await expect(firstValueFrom(
      TestBed.inject(DashboardItemService).getItem('map-a', 'MAP')
    )).resolves.toEqual({ id: 'map-a', name: 'Cases', type: 'MAP' });
  });

  it('loads tracker entities and program metadata using selected period and org unit', async () => {
    const http = installD2Web({
      'trackedEntityInstances.json': { trackedEntityInstances: [{ trackedEntity: 'tei-a' }] },
      'programs/program-a': { id: 'program-a', name: 'Program A' },
    });

    await expect(firstValueFrom(
      TestBed.inject(TrackerDashboardService).getTrackedEntityInstances(
        'program-a', 'Yearly', [
          { dimension: 'pe', items: [{ id: '2023', name: '2023', dimensionItem: '2023' }] },
          { dimension: 'ou', items: [{ id: 'ou-selected', name: 'Selected', dimensionItem: 'ou-selected' }] },
        ]
      )
    )).resolves.toEqual({
      trackedEntityInstances: [{ trackedEntity: 'tei-a' }],
      program: { id: 'program-a', name: 'Program A' },
    });
    expect(http.get.mock.calls[0][0]).toContain('ou=ou-selected');
    expect(http.get.mock.calls[0][0]).toContain('programStartDate=2024-01-01');
    expect(http.get.mock.calls[0][0]).toContain('skipPaging=true');
  });

  it('loads tracked-entity-attribute filter options and ignores unsupported dimensions', async () => {
    installD2Web({
      'trackedEntityAttributes/tea-a': {
        id: 'tea-a', name: 'Status', optionSet: { id: 'set-a', options: [] },
      },
    });
    const service = TestBed.inject(DashboardSelectionFilterService);
    const filter = { dimension: 'tea' as const, domain: 'TRACKER' as const,
      id: 'tea-a', label: 'Fallback' };

    await expect(firstValueFrom(service.getFilterSelection(filter))).resolves.toMatchObject({
      id: 'tea-a', label: 'Status', optionSet: { id: 'set-a' },
    });
    await expect(firstValueFrom(service.getFilterSelection({
      ...filter, dimension: 'de', domain: 'AGGREGATE',
    }))).resolves.toBeNull();
  });
});
