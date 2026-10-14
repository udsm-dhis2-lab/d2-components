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

## Rendering lifecycle profiling

Sprint 04 moved visualization ownership into `DashboardItemComponent`. An item
now owns one outer `D2Visualizer`, disposes the renderer before redraw or input
replacement, observes only its own container, and disconnects that observer on
destruction. Equivalent selection and size requests are coalesced, while a
latest-request queue prevents an older metadata completion from replacing a
newer dashboard item.

The repeatable baseline before this change was two `setVisualization()` calls
for the same item producing two `D2Visualizer` instances and two draws, with no
dispose call. The deterministic boundary test now proves the same scenario
produces one instance and one draw. A changed selection produces one additional
draw on the owned instance and disposes its previous renderer first.

To profile manually in a non-production DHIS2 environment:

1. Open browser Performance and Memory tools and enable network request
   preservation.
2. Load a dashboard containing charts, a map, a table and a tracker item; record
   the initial draw and heap baseline after rendering settles.
3. Reapply an equivalent selection and verify there is no visualization redraw.
4. Change one selection and verify each affected item redraws once without
   constructing an additional outer visualizer.
5. Resize the dashboard item repeatedly, including repeated observations at the
   same height; verify only distinct heights redraw.
6. Switch A-B-A rapidly and confirm the final dashboard is A and no late B
   visualization replaces it.
7. Enter and exit fullscreen after changing chart type; confirm the chosen type
   remains active.
8. Repeat dashboard switching 20 times, force garbage collection when the
   browser permits it, and compare detached DOM nodes, observers and heap size
   with the baseline.
9. Simulate a metadata or analytics failure and confirm the loader settles and
   subsequent selection changes recover.
