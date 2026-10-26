import { Program } from '@iapps/d2-web-sdk';
import { ColumnDefinition, TableRow } from '../models/line-list.models';

/**
 * Export schema is intentionally independent of the on-screen table columns.
 * The selected program stage determines whether program attributes or stage
 * data elements are exported. No internal tracker/enrollment identifiers are
 * included; only organisation-unit ID and name are retained for follow-up.
 */
interface FieldDefinition {
  id: string;
  name?: string;
  formName?: string;
}

interface AssignedAttribute {
  sortOrder?: number;
  trackedEntityAttribute?: FieldDefinition;
}

interface AssignedDataElement {
  sortOrder?: number;
  dataElement: FieldDefinition;
}

interface ExportMetadata {
  trackedEntityAttributes?: FieldDefinition[];
  programTrackedEntityAttributes?: AssignedAttribute[];
  programStages?: Array<{
    id: string;
    programStageDataElements?: AssignedDataElement[];
  }>;
}

interface ValueWithId {
  attribute: string;
  value?: unknown;
}
interface EventValue {
  dataElement: string;
  value?: unknown;
}
interface ExportEvent {
  orgUnit?: string;
  orgUnitName?: string;
  programStage?: string;
  attributes?: ValueWithId[];
  dataValues?: EventValue[];
}
interface ExportEnrollment {
  orgUnit?: string;
  attributes?: ValueWithId[];
}
interface ExportEntity {
  orgUnit?: string;
  orgUnitName?: string;
  attributes?: ValueWithId[];
  latestEnrollment?: ExportEnrollment;
  enrollments?: ExportEnrollment[];
}

type ExportSchemaField = { key: string; label: string; uid: string };
type ExportRow = Record<string, string>;

const ORGANISATION_COLUMNS: ColumnDefinition[] = [
  { key: 'organisationUnitId', label: 'Organisation unit ID' },
  { key: 'organisationUnitName', label: 'Organisation unit name' },
];

function text(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  return JSON.stringify(value);
}

function displayName(
  field: FieldDefinition,
  source: 'NAME' | 'FORM_NAME'
): string {
  return (
    (source === 'FORM_NAME'
      ? field.formName || field.name
      : field.name || field.formName) || field.id
  );
}

/** Ensure duplicate human-facing names do not create ambiguous headers. */
function deduplicateLabels(fields: ExportSchemaField[]): ExportSchemaField[] {
  const counts = new Map<string, number>();
  for (const field of fields)
    counts.set(field.label, (counts.get(field.label) ?? 0) + 1);
  return fields.map((field) => ({
    ...field,
    label:
      (counts.get(field.label) ?? 0) > 1
        ? `${field.label} (${field.uid})`
        : field.label,
  }));
}

function assignedFields(
  metadata: Program,
  stageId: string | undefined,
  source: 'NAME' | 'FORM_NAME'
): ExportSchemaField[] {
  const program = metadata as unknown as ExportMetadata;
  const unique = new Set<string>();
  const fields: ExportSchemaField[] = [];

  if (stageId) {
    const stage = (program.programStages ?? []).find(
      (item) => item.id === stageId
    );
    if (!stage)
      throw new Error(
        `Selected program stage (${stageId}) is not in the supplied metadata.`
      );
    const assigned = [...(stage.programStageDataElements ?? [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    for (const { dataElement } of assigned) {
      if (!dataElement?.id || unique.has(dataElement.id)) continue;
      unique.add(dataElement.id);
      fields.push({
        key: `dataElement:${dataElement.id}`,
        label: displayName(dataElement, source),
        uid: dataElement.id,
      });
    }
  } else {
    const assigned = [...(program.programTrackedEntityAttributes ?? [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    // Only fall back if the program does not expose an assignment list.
    const attributes = assigned.length
      ? assigned.map((item) => item.trackedEntityAttribute)
      : program.trackedEntityAttributes ?? [];
    for (const attribute of attributes) {
      if (!attribute?.id || unique.has(attribute.id)) continue;
      unique.add(attribute.id);
      fields.push({
        key: `attribute:${attribute.id}`,
        label: displayName(attribute, source),
        uid: attribute.id,
      });
    }
  }
  return deduplicateLabels(fields);
}

function buildRow(
  values: ExportRow,
  columns: ColumnDefinition[],
  index: number
): TableRow {
  const row: TableRow = { index: { value: index + 1 } };
  for (const column of columns)
    row[column.key] = { value: values[column.key] ?? '' };
  return row;
}

function organisationValues(
  item: { orgUnit?: string; orgUnitName?: string },
  names: ReadonlyMap<string, string>
): ExportRow {
  const id = item.orgUnit ?? '';
  return {
    organisationUnitId: id,
    organisationUnitName: item.orgUnitName || names.get(id) || '',
  };
}

/** One export row per matching tracked entity, without stage-level columns. */
export function projectTrackerExport(
  records: ExportEntity[],
  metadata: Program,
  programStageId: string | undefined,
  columnNameSource: 'NAME' | 'FORM_NAME',
  orgUnitNames: ReadonlyMap<string, string> = new Map()
): { columns: ColumnDefinition[]; data: TableRow[] } {
  const fields = assignedFields(metadata, programStageId, columnNameSource);
  const columns = [
    ...ORGANISATION_COLUMNS,
    ...fields.map(({ key, label }) => ({ key, label })),
  ];
  const data = records.map((record, index) => {
    const latest = record.latestEnrollment ?? record.enrollments?.[0];
    // The line list shows the enrollment's registering unit, not necessarily
    // the tracked entity's own organisation-unit assignment.
    const registeringOrgUnit = latest?.orgUnit || record.orgUnit || '';
    const values = organisationValues(
      {
        orgUnit: registeringOrgUnit,
        orgUnitName:
          registeringOrgUnit === record.orgUnit
            ? record.orgUnitName
            : undefined,
      },
      orgUnitNames
    );
    const attributes = new Map<string, unknown>();
    for (const attribute of record.attributes ?? [])
      attributes.set(attribute.attribute, attribute.value);
    for (const attribute of latest?.attributes ?? [])
      attributes.set(attribute.attribute, attribute.value);
    for (const field of fields)
      values[field.key] = text(attributes.get(field.uid));
    return buildRow(values, columns, index);
  });
  return { columns, data };
}

/** One export row per matching event, with only the selected stage's DEs. */
export function projectEventExport(
  events: ExportEvent[],
  metadata: Program,
  programStageId: string | undefined,
  columnNameSource: 'NAME' | 'FORM_NAME',
  orgUnitNames: ReadonlyMap<string, string> = new Map()
): { columns: ColumnDefinition[]; data: TableRow[] } {
  const fields = assignedFields(metadata, programStageId, columnNameSource);
  const columns = [
    ...ORGANISATION_COLUMNS,
    ...fields.map(({ key, label }) => ({ key, label })),
  ];
  const data = events.map((event, index) => {
    const values = organisationValues(event, orgUnitNames);
    // With no stage, expose only any actual attributes returned in the event
    // payload; do not fabricate enrollment attributes absent from the API.
    const lookup = new Map<string, unknown>();
    const source = programStageId
      ? event.dataValues ?? []
      : event.attributes ?? [];
    for (const item of source) {
      const uid = 'dataElement' in item ? item.dataElement : item.attribute;
      lookup.set(uid, item.value);
    }
    for (const field of fields) values[field.key] = text(lookup.get(field.uid));
    return buildRow(values, columns, index);
  });
  return { columns, data };
}
