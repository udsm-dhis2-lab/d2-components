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

## Closed defects and retained constraints

- Filter state is seeded and re-seeded from `dataSelections`, so changing one
  filter preserves untouched startup and dashboard dimensions.
- Parent and submenu navigation both use
  `<rootUrl>/ng-dashboard-view/<dashboardId>`.
- Visualization renderers and observers are deterministically cleaned up.
  In-flight work inside external `D2Visualizer.draw()` is still not cancellable.
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

## Viewport virtualization profiling

Sprint 06 keeps every KTD grid shell mounted but defers its heavy
`DashboardItemComponent` until the shell intersects the browser viewport plus a
200px vertical prefetch margin. Activation is retained once per displayed
dashboard. The browser viewport (`root: null`) is intentional: Intersection
Observer also accounts for clipping by supported nested scroll containers.
When the API is unavailable, all items render eagerly for compatibility.

The deterministic three-item benchmark changed initial visualization work from
three component/configuration requests to zero before intersection and one
after the first item intersects. For a real dashboard with `N` total and `V`
visible or prefetched items, initial component, configuration and analytics
work should therefore be `V` rather than `N`.

Run this checklist against a non-production DHIS2 instance:

1. Select a dashboard spanning at least three viewport heights and record its
   total item count.
2. Clear the Network panel, load at the top, and record configuration,
   analytics and tracker requests before scrolling. Confirm requests belong
   only to visible or prefetched items.
3. Record `d2-dashboard-item` and visualizer instance counts after initial
   rendering, after scrolling to the bottom, and after returning to the top.
4. Scroll one viewport at a time and confirm each new item activates once,
   without KTD shell movement or a change in total scroll height.
5. Scroll back and confirm activated items remain rendered and do not refetch.
6. Change period, organisation-unit and additional filters. Confirm active
   items redraw and a subsequently activated hidden item uses the latest
   selections.
7. Switch dashboards rapidly while scrolling. Confirm old observers disconnect
   and no stale item or visualization appears.
8. Repeat in hosts that scroll the window and in supported nested scroll
   containers.
9. Use Performance and Memory tools to compare scripting time, retained nodes
   and observer count with the pre-Sprint baseline.
10. With `IntersectionObserver` disabled, confirm all items render eagerly.

## Responsive layout profiling

Sprint 08 makes the dashboard responsive to its own container. The layout modes
are wide at 960px and above (the canonical 60 columns), compact from 600px to
959px (12 columns with a minimum four-column item span), and narrow below 600px
(one full-width item per row). Compact and narrow layouts are always derived
from the immutable canonical layout, so a wide-narrow-wide cycle cannot
accumulate coordinate rounding.

The pre-change card used content-box `width: 100%`, 3px horizontal margins and
1px borders. Its outer width was therefore its grid shell width plus 8px, while
the 70px minimum could force a 78px outer width in a smaller cell. The corrected
shell owns 3px internal padding and the card uses border-box sizing, zero margin,
zero minimum inline size and a 100% maximum inline size.

Run this matrix in both a full-page host and a sidebar or split-view host:

1. Load a small dashboard and `rUvRjwYqqPg` at container widths 1440, 1024,
   768, 480 and 320px.
2. Record `clientWidth` and `scrollWidth` for the document, dashboard container,
   dashboard-items wrapper and KTD grid. Confirm no ordinary card or shell
   extends past its owner.
3. Confirm the active layout modes are respectively wide, wide, compact,
   narrow and narrow.
4. Resize slowly and rapidly across 960px and 600px. Confirm one final layout
   transition per animation frame, stable item identity and no overlap.
5. Resize wide-narrow-wide and compare the final 60-column coordinates with the
   initial canonical coordinates.
6. Scroll before and after resizing. Confirm hidden items remain deferred and
   activated items do not issue additional configuration or analytics requests.
7. Change filters and exercise visualization controls, downloads, fullscreen,
   errors and keyboard focus at every mode.
8. Repeat at 200% browser zoom and confirm titles, filter summaries and focus
   indicators remain visible without unintended horizontal page scrolling.
