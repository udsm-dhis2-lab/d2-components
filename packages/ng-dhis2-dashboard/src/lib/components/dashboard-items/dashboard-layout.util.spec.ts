import { KtdGridLayout } from '@katoid/angular-grid-layout';
import {
  DASHBOARD_COMPACT_COLUMNS,
  DASHBOARD_COMPACT_MIN_WIDTH,
  DASHBOARD_NARROW_COLUMNS,
  DASHBOARD_WIDE_COLUMNS,
  DASHBOARD_WIDE_MIN_WIDTH,
  deriveDashboardLayout,
  getDashboardLayoutColumns,
  getDashboardLayoutMode,
} from './dashboard-layout.util';

const sourceLayout = (): KtdGridLayout => [
  { id: 'third', x: 0, y: 12, w: 35, h: 18 },
  { id: 'second', x: 35, y: 0, w: 25, h: 10 },
  { id: 'first', x: 0, y: 0, w: 7, h: 8 },
  { id: 'fourth', x: 35, y: 12, w: 25, h: 12 },
];

const hasCollision = (layout: KtdGridLayout): boolean =>
  layout.some((left, leftIndex) =>
    layout.some(
      (right, rightIndex) =>
        leftIndex !== rightIndex &&
        left.x < right.x + right.w &&
        left.x + left.w > right.x &&
        left.y < right.y + right.h &&
        left.y + left.h > right.y
    )
  );

describe('responsive dashboard layout', () => {
  it('selects modes and column counts at the container breakpoints', () => {
    expect(getDashboardLayoutMode(DASHBOARD_COMPACT_MIN_WIDTH - 1)).toBe(
      'narrow'
    );
    expect(getDashboardLayoutMode(DASHBOARD_COMPACT_MIN_WIDTH)).toBe(
      'compact'
    );
    expect(getDashboardLayoutMode(DASHBOARD_WIDE_MIN_WIDTH)).toBe('wide');
    expect(getDashboardLayoutColumns('narrow')).toBe(
      DASHBOARD_NARROW_COLUMNS
    );
    expect(getDashboardLayoutColumns('compact')).toBe(
      DASHBOARD_COMPACT_COLUMNS
    );
    expect(getDashboardLayoutColumns('wide')).toBe(DASHBOARD_WIDE_COLUMNS);
  });

  it('preserves the canonical wide layout without sharing item references', () => {
    const source = sourceLayout();
    const result = deriveDashboardLayout(source, 'wide');

    expect(result).toEqual(source);
    expect(result).not.toBe(source);
    result.forEach((item, index) => expect(item).not.toBe(source[index]));
  });

  it('packs a collision-free compact layout within twelve columns', () => {
    const result = deriveDashboardLayout(sourceLayout(), 'compact');

    expect(result.map(({ id }) => id)).toEqual([
      'first',
      'second',
      'third',
      'fourth',
    ]);
    expect(result.every((item) => item.x >= 0 && item.x + item.w <= 12)).toBe(
      true
    );
    expect(result.every((item) => item.w >= 4 && item.h >= 8)).toBe(true);
    expect(hasCollision(result)).toBe(false);
  });

  it('stacks a narrow layout in canonical reading order', () => {
    const result = deriveDashboardLayout(sourceLayout(), 'narrow');

    expect(result.map(({ id }) => id)).toEqual([
      'first',
      'second',
      'third',
      'fourth',
    ]);
    expect(result.every((item) => item.x === 0 && item.w === 1)).toBe(true);
    expect(result.map(({ y }) => y)).toEqual([0, 8, 18, 36]);
    expect(hasCollision(result)).toBe(false);
  });

  it('does not mutate or drift the source across repeated mode changes', () => {
    const source = sourceLayout();
    const snapshot = sourceLayout();

    deriveDashboardLayout(source, 'compact');
    deriveDashboardLayout(source, 'narrow');
    const restored = deriveDashboardLayout(source, 'wide');

    expect(source).toEqual(snapshot);
    expect(restored).toEqual(snapshot);
  });
});
