import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChange,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardItemsComponent } from './dashboard-items.component';
import {
  DASHBOARD_ITEM_PREFETCH_MARGIN,
  ViewportActivationDirective,
} from './viewport-activation.directive';

class ControlledIntersectionObserver implements IntersectionObserver {
  static instances: ControlledIntersectionObserver[] = [];

  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[];
  readonly observed = new Set<Element>();
  readonly disconnect = jest.fn(() => this.observed.clear());
  readonly observe = jest.fn((target: Element) => this.observed.add(target));
  readonly unobserve = jest.fn((target: Element) =>
    this.observed.delete(target)
  );
  readonly takeRecords = jest.fn(() => [] as IntersectionObserverEntry[]);

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) {
    this.root = options.root || null;
    this.rootMargin = options.rootMargin || '0px';
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold || 0];
    ControlledIntersectionObserver.instances.push(this);
  }

  emit(isIntersecting: boolean): void {
    const entries = [...this.observed].map(
      (target) =>
        ({
          target,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
        } as IntersectionObserverEntry)
    );
    this.callback(entries, this);
  }
}

const visualizationRequests = jest.fn();
@Component({
  selector: 'd2-test-visualization',
  standalone: true,
  template: '',
})
class TestVisualizationComponent implements OnInit {
  @Input() itemId = '';
  @Input() selections: string[] = [];

  ngOnInit(): void {
    visualizationRequests(this.itemId, this.selections);
  }
}

@Component({
  standalone: true,
  imports: [ViewportActivationDirective, TestVisualizationComponent],
  template: `
    <div role="status">
      Dashboard visualizations load as they enter the viewport.
    </div>
    @for (itemId of itemIds; track itemId) {
    <section
      class="shell"
      ngDhis2UiViewportActivation
      [viewportActivationKey]="dashboardId + ':' + itemId"
      (viewportActivate)="activate(itemId)"
    >
      @if (activated.has(itemId)) {
      <d2-test-visualization [itemId]="itemId" [selections]="selections" />
      } @else {
      <div aria-hidden="true">Visualization will load when visible</div>
      }
    </section>
    }
  `,
})
class ViewportHarnessComponent {
  dashboardId = 'dashboard-a';
  itemIds = ['item-a', 'item-b', 'item-c'];
  selections = ['period-a'];
  activated = new Set<string>();

  activate(itemId: string): void {
    this.activated.add(itemId);
  }

  switchDashboard(dashboardId: string): void {
    this.dashboardId = dashboardId;
    this.activated.clear();
  }
}

describe('dashboard item viewport activation', () => {
  let fixture: ComponentFixture<ViewportHarnessComponent>;

  const render = () => {
    fixture = TestBed.createComponent(ViewportHarnessComponent);
    fixture.detectChanges();
  };

  beforeEach(() => {
    ControlledIntersectionObserver.instances = [];
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: ControlledIntersectionObserver,
    });
    TestBed.configureTestingModule({ imports: [ViewportHarnessComponent] });
  });

  it('keeps stable shells and requests only intersecting items', () => {
    render();

    expect(fixture.nativeElement.querySelectorAll('.shell')).toHaveLength(3);
    expect(
      fixture.nativeElement.querySelectorAll('[role="status"]')
    ).toHaveLength(1);
    expect(visualizationRequests).not.toHaveBeenCalled();
    expect(ControlledIntersectionObserver.instances[0]).toMatchObject({
      root: null,
      rootMargin: DASHBOARD_ITEM_PREFETCH_MARGIN,
      thresholds: [0.01],
    });

    ControlledIntersectionObserver.instances[0].emit(true);
    fixture.detectChanges();

    expect(visualizationRequests).toHaveBeenCalledTimes(1);
    expect(visualizationRequests).toHaveBeenCalledWith('item-a', ['period-a']);
    expect(fixture.nativeElement.querySelectorAll('.shell')).toHaveLength(3);
  });

  it('activates once and does not refetch after leaving and re-entering', () => {
    render();
    const observer = ControlledIntersectionObserver.instances[0];

    observer.emit(true);
    fixture.detectChanges();
    observer.emit(false);
    observer.emit(true);
    fixture.detectChanges();

    expect(visualizationRequests).toHaveBeenCalledTimes(1);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('uses the latest selections when a hidden item becomes visible', () => {
    render();
    fixture.componentInstance.selections = ['period-b'];
    fixture.detectChanges();

    ControlledIntersectionObserver.instances[1].emit(true);
    fixture.detectChanges();

    expect(visualizationRequests).toHaveBeenCalledWith('item-b', ['period-b']);
    expect(visualizationRequests).toHaveBeenCalledTimes(1);
  });

  it('resets activation and rejects stale callbacks after dashboard changes', () => {
    render();
    const staleObserver = ControlledIntersectionObserver.instances[0];
    staleObserver.emit(true);
    fixture.detectChanges();
    expect(visualizationRequests).toHaveBeenCalledTimes(1);

    fixture.componentInstance.switchDashboard('dashboard-b');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    staleObserver.emit(true);
    fixture.detectChanges();
    expect(visualizationRequests).toHaveBeenCalledTimes(1);
  });

  it('disconnects observers when the item list is destroyed', () => {
    render();
    const observers = [...ControlledIntersectionObserver.instances];

    fixture.destroy();

    expect(observers).toHaveLength(3);
    observers.forEach((observer) =>
      expect(observer.disconnect).toHaveBeenCalledTimes(1)
    );
  });

  it('eagerly renders all items when IntersectionObserver is unavailable', () => {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    render();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(visualizationRequests).toHaveBeenCalledTimes(3);
    expect(fixture.nativeElement.querySelectorAll('.shell')).toHaveLength(3);
  });
});

describe('DashboardItemsComponent activation registry', () => {
  it('activates an item once and retains activation across selection updates', () => {
    const changeDetectorRef = { markForCheck: jest.fn() };
    const component = new DashboardItemsComponent(
      changeDetectorRef as unknown as ChangeDetectorRef
    );

    component.activateItem('item-a');
    component.activateItem('item-a');

    expect(component.isItemActivated('item-a')).toBe(true);
    expect(changeDetectorRef.markForCheck).toHaveBeenCalledTimes(1);
  });

  it('resets activation when dashboard identity changes', () => {
    const component = new DashboardItemsComponent({
      markForCheck: jest.fn(),
    } as unknown as ChangeDetectorRef);
    component.dashboardId = 'dashboard-a';
    component.activateItem('item-a');

    component.dashboardId = 'dashboard-b';
    component.ngOnChanges({
      dashboardId: new SimpleChange('dashboard-a', 'dashboard-b', false),
    });

    expect(component.isItemActivated('item-a')).toBe(false);
    expect(component.activationKey('item-a')).toBe('dashboard-b:item-a');
  });
});
