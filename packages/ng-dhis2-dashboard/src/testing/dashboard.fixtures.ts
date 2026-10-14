import {
  DashboardMenuObject,
  DashboardObject,
  VisualizationDataSelection,
} from '../lib/models';

export const periodSelection = (
  id = '2024',
  name = '2024'
): VisualizationDataSelection => ({
  dimension: 'pe',
  items: [{ id, name, dimensionItem: id }],
});

export const orgUnitSelection = (
  id = 'ou-a',
  name = 'Facility A'
): VisualizationDataSelection => ({
  dimension: 'ou',
  items: [{ id, name, dimensionItem: id }],
});

export const dashboardMenu = (
  overrides: Partial<DashboardMenuObject> = {}
): DashboardMenuObject => ({
  id: 'dashboard-a',
  name: 'Dashboard A',
  ...overrides,
});

export const dashboard = (
  overrides: Partial<DashboardObject> = {}
): DashboardObject => ({
  id: 'dashboard-a',
  name: 'Dashboard A',
  dashboardItems: [],
  dashboardItemsLayout: [],
  ...overrides,
});

export interface D2HttpMock {
  get: jest.Mock<Promise<{ data: unknown }>, [string]>;
}

export const installD2Web = (
  responses: Record<string, unknown>,
  currentUser: Record<string, unknown> = {
    id: 'user-a',
    userGroups: [],
    organisationUnits: [{ id: 'ou-a' }],
  }
): D2HttpMock => {
  const httpInstance: D2HttpMock = {
    get: jest.fn(async (url: string) => {
      const match = Object.entries(responses)
        .sort(([left], [right]) => right.length - left.length)
        .find(([fragment]) => url.includes(fragment));
      if (!match) {
        throw new Error(`Unexpected test request: ${url}`);
      }
      return { data: match[1] };
    }),
  };

  Object.defineProperty(window, 'd2Web', {
    configurable: true,
    value: { httpInstance, currentUser },
  });
  return httpInstance;
};
