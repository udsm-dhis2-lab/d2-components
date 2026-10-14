# Dashboard characterization testing

The dashboard test suite is a safety net for the behavior that existed before
the signal-state and rendering refactors. It uses boundary mocks for DHIS2,
React-backed UI wrappers, browser APIs, and `D2Visualizer`; no test contacts a
real DHIS2 instance.

## Commands

```bash
npx nx test ng-dhis2-dashboard
npx nx test ng-dhis2-dashboard --coverage
```

Coverage is enforced in `jest.config.ts`. The initial measured baseline is
88.09% statements, 63.84% branches, 88.34% functions, and 88.02% lines across
the selected domain, service, utility, and state files. The enforced regression
floor is 85% statements, 60% branches, 85% functions, and 85% lines.

## Known behavior and defects

- The additional-filter component keeps a local selection map that is not seeded
  from its `dataSelections` input. A later selection can therefore omit an
  existing startup dimension. This is scheduled for Sprint 02.
- Submenu navigation currently uses a different URL shape from parent-dashboard
  navigation. Tests characterize the current route call; Sprint 02 will make the
  route canonical and update the expectation deliberately.
- Visualization redraws are not cancellable and the visualizer has no component
  teardown path. Sprint 03 owns those changes.
- The tracker request intentionally contains `skipPaging=true`; paging and query
  volume are excluded from this remediation plan.

## Manual smoke checklist

Run against a non-production DHIS2 instance before releasing:

1. Open an API-backed dashboard and a data-store-backed dashboard.
2. Refresh a direct dashboard and submenu URL and confirm the selected tab.
3. Apply period, organisation-unit, and additional filters and confirm summaries.
4. Exercise chart and map download/type controls.
5. Enter and leave fullscreen for more than one dashboard item.
6. Open a tracker visualization and confirm its program and period data.
7. Navigate rapidly between dashboards and verify loaders and error messages.
8. Use keyboard-only navigation for menus, submenus, filters, and removal actions.
