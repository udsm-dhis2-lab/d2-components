import { computed, Injectable, signal } from '@angular/core';
import {
  DashboardMenuObject,
  DashboardObject,
  VisualizationDataSelection,
} from '../models';
import {
  GlobalSelection,
  IGlobalSelection,
} from '../models/global-selection.model';

export interface DashboardLoadingState {
  menus: boolean;
  dashboard: boolean;
}

export interface DashboardErrorState {
  menus: unknown | null;
  dashboard: unknown | null;
}

export interface DashboardSignalState {
  menus: readonly DashboardMenuObject[];
  selectedMenuId: string | null;
  selectedSubMenuId: string | null;
  dashboards: Readonly<Record<string, DashboardObject>>;
  activeDashboardId: string | null;
  selections: Readonly<Record<string, IGlobalSelection>>;
  startupSelections: readonly VisualizationDataSelection[];
  loading: DashboardLoadingState;
  errors: DashboardErrorState;
}

function createInitialState(): DashboardSignalState {
  return {
    menus: [],
    selectedMenuId: null,
    selectedSubMenuId: null,
    dashboards: {},
    activeDashboardId: null,
    selections: {},
    startupSelections: [],
    loading: {
      menus: false,
      dashboard: false,
    },
    errors: {
      menus: null,
      dashboard: null,
    },
  };
}

@Injectable()
export class DashboardStateFacade {
  readonly #state = signal<DashboardSignalState>(createInitialState());

  readonly menus = computed(() => this.#state().menus);
  readonly dashboards = computed(() => this.#state().dashboards);
  readonly activeDashboardId = computed(() => this.#state().activeDashboardId);
  readonly startupSelections = computed(
    () => this.#state().startupSelections
  );
  readonly loading = computed(() => this.#state().loading);
  readonly errors = computed(() => this.#state().errors);

  readonly selectedMenu = computed(() =>
    this.menus().find((menu) => menu.id === this.#state().selectedMenuId)
  );

  readonly selectedSubMenu = computed(() =>
    this.selectedMenu()?.subMenus?.find(
      (menu) => menu.id === this.#state().selectedSubMenuId
    )
  );

  readonly activeDashboard = computed(() => {
    const id = this.activeDashboardId();
    return id ? this.dashboards()[id] : undefined;
  });

  readonly activeSelection = computed(() => {
    const id = this.activeDashboardId();
    return id ? this.#state().selections[id] : undefined;
  });

  readonly filters = computed(
    () => this.activeSelection()?.dataSelections ?? []
  );

  beginMenuLoad(): void {
    this.#state.update((state) => ({
      ...state,
      loading: { ...state.loading, menus: true },
      errors: { ...state.errors, menus: null },
    }));
  }

  setMenus(
    menus: readonly DashboardMenuObject[],
    selectedMenuId: string | null = null,
    selectedSubMenuId: string | null = null
  ): void {
    this.#state.update((state) => ({
      ...state,
      menus: [...menus],
      selectedMenuId,
      selectedSubMenuId,
      activeDashboardId:
        selectedSubMenuId ?? selectedMenuId ?? state.activeDashboardId,
      loading: { ...state.loading, menus: false },
      errors: { ...state.errors, menus: null },
    }));
  }

  failMenuLoad(error: unknown): void {
    this.#state.update((state) => ({
      ...state,
      loading: { ...state.loading, menus: false },
      errors: { ...state.errors, menus: error },
    }));
  }

  selectMenu(menuId: string, subMenuId: string | null = null): void {
    const menu = this.#state().menus.find((item) => item.id === menuId);
    if (!menu) {
      return;
    }

    const selectedSubMenuId = menu.subMenus?.some(
      (item) => item.id === subMenuId
    )
      ? subMenuId
      : null;

    this.#state.update((state) => ({
      ...state,
      selectedMenuId: menuId,
      selectedSubMenuId,
      activeDashboardId: selectedSubMenuId ?? menuId,
    }));
  }

  beginDashboardLoad(dashboardId: string): void {
    this.#state.update((state) => ({
      ...state,
      activeDashboardId: dashboardId,
      loading: { ...state.loading, dashboard: true },
      errors: { ...state.errors, dashboard: null },
    }));
  }

  setDashboard(dashboard: DashboardObject): void {
    this.#state.update((state) => ({
      ...state,
      dashboards: { ...state.dashboards, [dashboard.id]: dashboard },
      activeDashboardId: dashboard.id,
      loading: { ...state.loading, dashboard: false },
      errors: { ...state.errors, dashboard: null },
    }));
  }

  failDashboardLoad(error: unknown): void {
    this.#state.update((state) => ({
      ...state,
      loading: { ...state.loading, dashboard: false },
      errors: { ...state.errors, dashboard: error },
    }));
  }

  setStartupSelections(
    dataSelections: readonly VisualizationDataSelection[],
    dashboardId?: string
  ): void {
    const startupSelections = [...dataSelections];
    this.#state.update((state) => ({
      ...state,
      startupSelections,
      selections: dashboardId
        ? {
            ...state.selections,
            [dashboardId]: new GlobalSelection({
              default: true,
              dataSelections: startupSelections,
            }),
          }
        : state.selections,
    }));
  }

  setDashboardSelection(
    dashboardId: string,
    dataSelections: readonly VisualizationDataSelection[]
  ): void {
    this.#state.update((state) => {
      const selection =
        dataSelections.length > 0
          ? new GlobalSelection({
              default: false,
              dataSelections: [...dataSelections],
            })
          : new GlobalSelection({
              default: state.startupSelections.length > 0,
              dataSelections: [...state.startupSelections],
            });

      return {
        ...state,
        selections: {
          ...state.selections,
          [dashboardId]: selection,
        },
      };
    });
  }

  ensureDashboardSelection(dashboardId: string): void {
    if (this.#state().selections[dashboardId]) {
      return;
    }
    this.setDashboardSelection(dashboardId, []);
  }

  activateDashboard(dashboardId: string): void {
    this.#state.update((state) => ({
      ...state,
      activeDashboardId: dashboardId,
    }));
  }

  resetDashboard(dashboardId: string): void {
    this.#state.update((state) => {
      const dashboards = { ...state.dashboards };
      const selections = { ...state.selections };
      delete dashboards[dashboardId];
      delete selections[dashboardId];
      return {
        ...state,
        dashboards,
        selections,
        activeDashboardId:
          state.activeDashboardId === dashboardId
            ? null
            : state.activeDashboardId,
        loading: { ...state.loading, dashboard: false },
        errors: { ...state.errors, dashboard: null },
      };
    });
  }

  reset(): void {
    this.#state.set(createInitialState());
  }
}
