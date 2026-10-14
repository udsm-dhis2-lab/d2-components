import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { orgUnitSelection, periodSelection } from '../../../testing/dashboard.fixtures';
import { DashboardSelectionFiltersComponent } from './dashboard-selection-filters.component';
import { AdditionalFilterDialogComponent } from './dialogs/additional-filter-dialog/additional-filter-dialog.component';
import { DashboardSelectionFilterService } from './services/dashboard-selection-filter.service';

const event = { stopPropagation: jest.fn() } as unknown as MouseEvent;

describe('dashboard selection filters', () => {
  const createComponent = (dialog: MatDialog) => {
    TestBed.configureTestingModule({});
    return TestBed.runInInjectionContext(
      () => new DashboardSelectionFiltersComponent(dialog)
    );
  };

  it('emits the dimensions selected during the current component lifetime', () => {
    const dialog = { open: jest.fn() } as unknown as MatDialog;
    const component = createComponent(dialog);
    component.dataSelections = [periodSelection()];
    const emitted = jest.fn();
    component.setFilterSelection.subscribe(emitted);

    component.onSelectPeriod(periodSelection().items);
    component.onSelectOrgUnit(orgUnitSelection().items);

    expect(emitted).toHaveBeenLastCalledWith([
      periodSelection(), orgUnitSelection(),
    ]);
    expect(component.showPeriodSelector()).toBe(false);
    expect(component.showOrgUnitSelector()).toBe(false);
  });

  it('characterizes the known omission of untouched input dimensions', () => {
    const component = createComponent({} as MatDialog);
    component.dataSelections = [periodSelection()];
    const emitted = jest.fn();
    component.setFilterSelection.subscribe(emitted);

    component.onSelectOrgUnit(orgUnitSelection().items);

    expect(emitted).toHaveBeenCalledWith([orgUnitSelection()]);
  });

  it('merges a confirmed additional-filter selection', () => {
    const result = of({ selectedOptions: [{ id: 'active', name: 'Active' }] });
    const dialog = {
      open: jest.fn(() => ({ afterClosed: () => result })),
    } as unknown as MatDialog;
    const component = createComponent(dialog);
    component.dataSelections = [];
    component.menu = { closeMenu: jest.fn() } as never;
    const emitted = jest.fn();
    component.setFilterSelection.subscribe(emitted);
    const filter = { dimension: 'tea' as const, domain: 'TRACKER' as const,
      id: 'status', label: 'Status' };
    component.additionalFilters = [filter];

    component.onOpenFilterDialog(event, filter);
    expect(emitted).toHaveBeenCalledWith([
      expect.objectContaining({ dimension: 'tea', id: 'status',
        items: [{ id: 'active', name: 'Active' }] }),
    ]);
  });
});

describe('AdditionalFilterDialogComponent', () => {
  const data = { dimension: 'tea' as const, domain: 'TRACKER' as const,
    id: 'status', label: 'Status' };

  it('loads filter metadata and closes with selected option objects', async () => {
    const dialogRef = { close: jest.fn() } as unknown as MatDialogRef<AdditionalFilterDialogComponent>;
    const filterService = { getFilterSelection: jest.fn(() => of(data)) } as unknown as DashboardSelectionFilterService;
    const component = new AdditionalFilterDialogComponent(dialogRef, data, filterService);
    component.ngOnInit();
    await new Promise<void>((resolve) => component.filterSelection$.subscribe(() => resolve()));

    const list = { selectedOptions: { selected: [{ value: 'active' }] } } as MatSelectionList;
    component.onUpdate(event, list, [{ code: 'active', id: 'option-a' }]);
    expect(component.loading).toBe(false);
    expect(dialogRef.close).toHaveBeenCalledWith({
      selectedOptions: [{ code: 'active', id: 'option-a' }],
    });
  });

  it('records metadata loading failures as view state', async () => {
    const error = new Error('metadata unavailable');
    const service = { getFilterSelection: () => throwError(() => error) } as DashboardSelectionFilterService;
    const component = new AdditionalFilterDialogComponent({} as MatDialogRef<AdditionalFilterDialogComponent>, data, service);
    component.ngOnInit();

    await expect(new Promise((resolve) => component.filterSelection$.subscribe(resolve))).resolves.toBeNull();
    expect(component.loading).toBe(false);
    expect(component.loadingError).toBe(error);
  });
});
