import { KtdGridLayout } from '@katoid/angular-grid-layout';

export type DashboardLayoutMode = 'wide' | 'compact' | 'narrow';

export const DASHBOARD_WIDE_MIN_WIDTH = 960;
export const DASHBOARD_COMPACT_MIN_WIDTH = 600;
export const DASHBOARD_WIDE_COLUMNS = 60;
export const DASHBOARD_COMPACT_COLUMNS = 12;
export const DASHBOARD_NARROW_COLUMNS = 1;
export const DASHBOARD_COMPACT_MIN_ITEM_COLUMNS = 4;
export const DASHBOARD_MIN_ITEM_ROWS = 8;

export function getDashboardLayoutMode(width: number): DashboardLayoutMode {
  if (width < DASHBOARD_COMPACT_MIN_WIDTH) {
    return 'narrow';
  }

  return width < DASHBOARD_WIDE_MIN_WIDTH ? 'compact' : 'wide';
}

export function getDashboardLayoutColumns(mode: DashboardLayoutMode): number {
  switch (mode) {
    case 'compact':
      return DASHBOARD_COMPACT_COLUMNS;
    case 'narrow':
      return DASHBOARD_NARROW_COLUMNS;
    default:
      return DASHBOARD_WIDE_COLUMNS;
  }
}

export function deriveDashboardLayout(
  sourceLayout: KtdGridLayout,
  mode: DashboardLayoutMode
): KtdGridLayout {
  const canonicalLayout = sourceLayout.map((item) => ({ ...item }));
  if (mode === 'wide') {
    return canonicalLayout;
  }

  const orderedLayout = canonicalLayout
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .sort(
      (left, right) =>
        left.item.y - right.item.y ||
        left.item.x - right.item.x ||
        left.sourceIndex - right.sourceIndex
    )
    .map(({ item }) => item);

  if (mode === 'narrow') {
    let nextRow = 0;
    return orderedLayout.map((item) => {
      const height = Math.max(DASHBOARD_MIN_ITEM_ROWS, item.h);
      const result = {
        ...item,
        x: 0,
        y: nextRow,
        w: DASHBOARD_NARROW_COLUMNS,
        h: height,
      };
      nextRow += height;
      return result;
    });
  }

  let cursorX = 0;
  let cursorY = 0;
  let currentRowHeight = 0;

  return orderedLayout.map((item) => {
    const proportionalWidth = Math.round(
      (item.w / DASHBOARD_WIDE_COLUMNS) * DASHBOARD_COMPACT_COLUMNS
    );
    const width = Math.min(
      DASHBOARD_COMPACT_COLUMNS,
      Math.max(DASHBOARD_COMPACT_MIN_ITEM_COLUMNS, proportionalWidth)
    );
    const height = Math.max(DASHBOARD_MIN_ITEM_ROWS, item.h);

    if (cursorX > 0 && cursorX + width > DASHBOARD_COMPACT_COLUMNS) {
      cursorX = 0;
      cursorY += currentRowHeight;
      currentRowHeight = 0;
    }

    const result = {
      ...item,
      x: cursorX,
      y: cursorY,
      w: width,
      h: height,
    };
    cursorX += width;
    currentRowHeight = Math.max(currentRowHeight, height);
    return result;
  });
}
