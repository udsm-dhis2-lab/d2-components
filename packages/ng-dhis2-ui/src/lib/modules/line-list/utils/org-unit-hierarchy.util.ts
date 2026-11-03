import {
  ColumnDefinition,
  OrganisationUnitHierarchy,
  OrganisationUnitLevel,
} from '../models/line-list.models';

export type OrganisationUnitHierarchyMap = ReadonlyMap<
  string,
  OrganisationUnitHierarchy
>;

export const orgUnitLevelKey = (level: number) => `orgUnitLevel:${level}`;

export function buildOrgUnitHierarchyColumns(
  levels: OrganisationUnitLevel[]
): ColumnDefinition[] {
  return [...levels]
    .sort((a, b) => a.level - b.level)
    .slice(1)
    .map(({ level, name }) => ({ key: orgUnitLevelKey(level), label: name }));
}

export function buildOrgUnitHierarchyValues(
  orgUnitId: string,
  hierarchy: OrganisationUnitHierarchyMap,
  levels: OrganisationUnitLevel[]
): Record<string, string> {
  const displayedLevels = [...levels]
    .sort((a, b) => a.level - b.level)
    .slice(1);
  const values = Object.fromEntries(
    displayedLevels.map(({ level }) => [orgUnitLevelKey(level), ''])
  );
  const orgUnit = hierarchy.get(orgUnitId);
  if (!orgUnit) return values;

  for (const node of [...(orgUnit.ancestors ?? []), orgUnit]) {
    const key = orgUnitLevelKey(node.level);
    if (key in values) values[key] = node.name;
  }
  return values;
}
