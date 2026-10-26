// import {
//   D2Web,
//   DataOrderCriteria,
//   DataQueryFilter,
//   EnrollmentStatus,
//   EventStatus,
//   OuMode,
//   Pager,
//   Program,
//   TrackedEntityInstance,
// } from '@iapps/d2-web-sdk';
// import { addDays, format } from 'date-fns';
// import { Observable, firstValueFrom } from 'rxjs';
// import {
//   ColumnDefinition,
//   EventsResponse,
//   TableRow,
//   TrackedEntityInstancesResponse,
// } from '../models/line-list.models';
// import { LineListColumnMetadataDisplayModeValue } from '../models/line-list-column-metadata-display-mode.model';
// import { getEvents } from './event-table-data-util';
// import { getTrackedEntityTableData } from './tei-table-data-utils';

// interface LineListDownloadRowsConfig {
//   d2: D2Web;
//   metaData: Program | null;
//   programId: string;
//   programStageId?: string;
//   orgUnit: string;
//   ouMode?: string;
//   startDate?: string;
//   endDate?: string;
//   dataQueryFilters: DataQueryFilter[];
//   enrollmentStatus: EnrollmentStatus;
//   eventStatus?: {
//     programStage: string;
//     status: EventStatus;
//   };
//   filterableColumnIds?: string[];
//   searcheableDataElements: string[];
//   customDisplayInReportsIds?: string[];
//   columnNameSource: 'NAME' | 'FORM_NAME';
//   columnMetadataDisplayMode?: LineListColumnMetadataDisplayModeValue;
//   fetchOrgUnits: (orgUnitIds: string[]) => Observable<Map<string, string>>;
// }

// const applyDownloadColumnFilter = (
//   columns: ColumnDefinition[],
//   filterableColumnIds?: string[]
// ) => {
//   if (!Array.isArray(filterableColumnIds) || filterableColumnIds.length === 0) {
//     return columns;
//   }

//   const filterableColumnIdsSet = new Set(filterableColumnIds);
//   return columns.filter((column) => filterableColumnIdsSet.has(column.key));
// };

// export const fetchLineListDownloadRows = async ({
//   d2,
//   metaData,
//   programId,
//   programStageId,
//   orgUnit,
//   ouMode,
//   startDate,
//   endDate,
//   dataQueryFilters,
//   enrollmentStatus,
//   eventStatus,
//   filterableColumnIds,
//   searcheableDataElements,
//   customDisplayInReportsIds,
//   columnNameSource,
//   columnMetadataDisplayMode,
//   fetchOrgUnits,
// }: LineListDownloadRowsConfig): Promise<{
//   columns: ColumnDefinition[];
//   data: TableRow[];
// }> => {
//   if (!metaData) {
//     return { columns: [], data: [] };
//   }

//   const isTracker = metaData.programType === 'WITH_REGISTRATION';
//   const isEvent = metaData.programType === 'WITHOUT_REGISTRATION';
//   const downloadPager = new Pager({ paging: false });
//   const resolvedEndDate =
//     endDate ?? format(addDays(new Date(), 1), 'yyyy-MM-dd');

//   if (programStageId || isEvent) {
//     const eventQuery = d2.eventModule.event
//       .setEndDate(resolvedEndDate)
//       .setProgram(programId)
//       .setOrgUnit(orgUnit)
//       .setOuMode(ouMode as OuMode)
//       .setPagination(downloadPager);

//     if (startDate) {
//       eventQuery.setStartDate(startDate);
//     }

//     if (programStageId) {
//       eventQuery.setProgramStage(programStageId);
//     }

//     const response = await eventQuery.get();
//     const events = Array.isArray(response.data)
//       ? response.data
//       : response.data
//       ? [response.data]
//       : [];
//     const eventsResponse: EventsResponse = {
//       events,
//       pager: new Pager({
//         page: 1,
//         pageSize: events.length || 1,
//       }),
//     };
//     const downloadRows = getEvents(
//       { data: eventsResponse },
//       programStageId || '',
//       eventsResponse.pager,
//       metaData,
//       columnNameSource,
//       columnMetadataDisplayMode
//     );

//     return {
//       columns: applyDownloadColumnFilter(
//         downloadRows.columns,
//         filterableColumnIds
//       ),
//       data: downloadRows.data,
//     };
//   }

//   if (isTracker) {
//     const trackerQuery = d2.trackerModule.trackedEntity
//       .setEndDate(resolvedEndDate)
//       .setProgram(programId)
//       .setOrgUnit(orgUnit)
//       .setOuMode(ouMode as OuMode)
//       .setStatus(enrollmentStatus)
//       .setFilters(dataQueryFilters)
//       .setPagination(downloadPager)
//       .setOrderCriterias([
//         new DataOrderCriteria().setField('createdAt').setOrder('desc'),
//       ]);

//     if (startDate) {
//       trackerQuery.setStartDate(startDate);
//     }

//     if (eventStatus?.status && eventStatus?.programStage) {
//       trackerQuery.setEventStatus(eventStatus.status, eventStatus.programStage);
//     }

//     if (programStageId) {
//       trackerQuery.setProgramStage(programStageId);
//     }

//     const response = await trackerQuery.get();
//     const trackedEntityInstances = Array.isArray(response.data)
//       ? response.data
//       : response.data
//       ? [response.data]
//       : [];
//     const uniqueOrgUnitIds = Array.from(
//       new Set(
//         trackedEntityInstances
//           .flatMap((tei: TrackedEntityInstance) => [
//             tei.latestEnrollment?.orgUnit,
//             ...(tei.attributes
//               ?.filter((attr: any) => attr.valueType === 'ORGANISATION_UNIT')
//               .map((attr: any) => attr.value) || []),
//           ])
//           .filter((orgUnitId): orgUnitId is string => !!orgUnitId)
//       )
//     );
//     const fetchedOrgUnits =
//       uniqueOrgUnitIds.length > 0
//         ? await firstValueFrom(fetchOrgUnits(uniqueOrgUnitIds))
//         : new Map<string, string>();
//     const trackedEntityResponse: TrackedEntityInstancesResponse = {
//       trackedEntityInstances,
//       pager: new Pager({
//         page: 1,
//         pageSize: trackedEntityInstances.length || 1,
//       }),
//       orgUnitsMap: fetchedOrgUnits,
//     };
//     const downloadRows = getTrackedEntityTableData(
//       { data: trackedEntityResponse },
//       programId,
//       trackedEntityResponse.pager,
//       metaData,
//       searcheableDataElements,
//       customDisplayInReportsIds,
//       columnNameSource,
//       columnMetadataDisplayMode
//     );

//     return {
//       columns: applyDownloadColumnFilter(
//         downloadRows.columns,
//         filterableColumnIds
//       ),
//       data: downloadRows.data,
//     };
//   }

//   return { columns: [], data: [] };
// };

import {
  D2Web,
  DataOrderCriteria,
  DataQueryFilter,
  EnrollmentStatus,
  EventStatus,
  OuMode,
  Pager,
  Program,
} from '@iapps/d2-web-sdk';
import { addDays, format } from 'date-fns';
import { ColumnDefinition, TableRow } from '../models/line-list.models';
import {
  projectEventExport,
  projectTrackerExport,
} from './line-list-export-projection.util';

interface LineListDownloadRowsConfig {
  d2: D2Web;
  metaData: Program | null;
  programId: string;
  programStageId?: string;
  orgUnit: string;
  ouMode?: string;
  startDate?: string;
  endDate?: string;
  dataQueryFilters: DataQueryFilter[];
  enrollmentStatus: EnrollmentStatus;
  eventStatus?: { programStage: string; status: EventStatus };
  columnNameSource: 'NAME' | 'FORM_NAME';
  resolveOrgUnitNames?: (ids: string[]) => Promise<Map<string, string>>;
}

/** Fetch every matching page, not just the currently displayed page. */
const EXPORT_PAGE_SIZE = 500;
const MAX_EXPORT_PAGES = 1000;

const responseItems = <T>(data: T | T[] | undefined | null): T[] =>
  Array.isArray(data) ? data : data ? [data] : [];

async function fetchMatchingPages<T>(
  fetchPage: (page: number) => Promise<{
    data?: T | T[];
    pagination?: { pageCount?: number; total?: number };
    responseStatus?: { status?: number };
  }>
): Promise<T[]> {
  const records: T[] = [];

  for (let page = 1; page <= MAX_EXPORT_PAGES; page += 1) {
    const response = await fetchPage(page);
    if (
      response.responseStatus?.status &&
      response.responseStatus.status !== 200
    ) {
      throw new Error(
        `Could not export records (HTTP ${response.responseStatus.status}).`
      );
    }

    const batch = responseItems(response.data);
    records.push(...batch);
    const pageCount = response.pagination?.pageCount;
    const total = response.pagination?.total;
    // Prefer the server's pagination metadata over the requested page size:
    // an instance may cap page size below EXPORT_PAGE_SIZE.
    if (typeof pageCount === 'number' && pageCount >= 1) {
      if (page >= pageCount) return records;
      if (!batch.length)
        throw new Error(
          'Export pagination stopped before the last reported page.'
        );
      continue;
    }
    if (typeof total === 'number' && total >= 0) {
      if (records.length >= total) return records;
      if (!batch.length)
        throw new Error('Export pagination stopped before the reported total.');
      continue;
    }
    if (batch.length < EXPORT_PAGE_SIZE) return records;
  }

  // Do not silently deliver a truncated export.
  throw new Error(
    'Export exceeds the configured page safety limit; reduce the filter scope.'
  );
}

/**
 * The same applied filters, dates, organisational unit, and program as the
 * list are used for the export query. Display column configuration is ignored.
 */
export async function fetchLineListDownloadRows({
  d2,
  metaData,
  programId,
  programStageId,
  orgUnit,
  ouMode,
  startDate,
  endDate,
  dataQueryFilters,
  enrollmentStatus,
  eventStatus,
  columnNameSource,
  resolveOrgUnitNames,
}: LineListDownloadRowsConfig): Promise<{
  columns: ColumnDefinition[];
  data: TableRow[];
}> {
  if (!metaData) throw new Error('Program metadata is not yet available.');

  const resolvedEndDate =
    endDate ?? format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const isEvent = metaData.programType === 'WITHOUT_REGISTRATION';

  // Resolve organisation-unit names in bounded batches, rather than creating
  // one enormous metadata URL for a large download.
  async function namesFor(
    items: Array<{ orgUnit?: string; orgUnitName?: string }>
  ) {
    const ids = [
      ...new Set(
        items
          .filter((item) => item.orgUnit && !item.orgUnitName)
          .map((item) => item.orgUnit as string)
      ),
    ];
    const names = new Map<string, string>();
    if (!resolveOrgUnitNames) return names;
    for (let index = 0; index < ids.length; index += 100) {
      const resolved = await resolveOrgUnitNames(ids.slice(index, index + 100));
      for (const [id, name] of resolved) names.set(id, name);
    }
    return names;
  }

  if (programStageId || isEvent) {
    const events = await fetchMatchingPages<any>(async (page) => {
      const query = d2.eventModule.event
        .setEndDate(resolvedEndDate)
        .setProgram(programId)
        .setOrgUnit(orgUnit)
        .setOuMode(ouMode as OuMode)
        .setPagination(new Pager({ page, pageSize: EXPORT_PAGE_SIZE }));
      if (startDate) query.setStartDate(startDate);
      if (programStageId) query.setProgramStage(programStageId);
      return query.get();
    });

    return projectEventExport(
      events,
      metaData,
      programStageId,
      columnNameSource,
      await namesFor(events)
    );
  }

  const entities = await fetchMatchingPages<any>(async (page) => {
    const query = d2.trackerModule.trackedEntity
      .setEndDate(resolvedEndDate)
      .setProgram(programId)
      .setOrgUnit(orgUnit)
      .setOuMode(ouMode as OuMode)
      .setStatus(enrollmentStatus)
      .setFilters(dataQueryFilters)
      .setPagination(new Pager({ page, pageSize: EXPORT_PAGE_SIZE }))
      .setOrderCriterias([
        new DataOrderCriteria().setField('createdAt').setOrder('desc'),
      ]);
    if (startDate) query.setStartDate(startDate);
    if (eventStatus?.status && eventStatus?.programStage) {
      query.setEventStatus(eventStatus.status, eventStatus.programStage);
    }
    return query.get();
  });

  const registeringUnits = entities.map((entity) => ({
    orgUnit:
      entity.latestEnrollment?.orgUnit ||
      entity.enrollments?.[0]?.orgUnit ||
      entity.orgUnit,
    orgUnitName:
      entity.orgUnitName &&
      (entity.latestEnrollment?.orgUnit ||
        entity.enrollments?.[0]?.orgUnit ||
        entity.orgUnit) === entity.orgUnit
        ? entity.orgUnitName
        : undefined,
  }));
  return projectTrackerExport(
    entities,
    metaData,
    programStageId,
    columnNameSource,
    await namesFor(registeringUnits)
  );
}
