import {
  D2Web,
  DataOrderCriteria,
  DataQueryFilter,
  EnrollmentStatus,
  EventStatus,
  OuMode,
  Pager,
  Program,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import { addDays, format } from 'date-fns';
import { Observable, firstValueFrom } from 'rxjs';
import {
  ColumnDefinition,
  EventsResponse,
  TableRow,
  TrackedEntityInstancesResponse,
} from '../models/line-list.models';
import { LineListColumnMetadataDisplayModeValue } from '../models/line-list-column-metadata-display-mode.model';
import { getEvents } from './event-table-data-util';
import { getTrackedEntityTableData } from './tei-table-data-utils';

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
  eventStatus?: {
    programStage: string;
    status: EventStatus;
  };
  filterableColumnIds?: string[];
  searcheableDataElements: string[];
  customDisplayInReportsIds?: string[];
  columnNameSource: 'NAME' | 'FORM_NAME';
  columnMetadataDisplayMode?: LineListColumnMetadataDisplayModeValue;
  fetchOrgUnits: (orgUnitIds: string[]) => Observable<Map<string, string>>;
}

const applyDownloadColumnFilter = (
  columns: ColumnDefinition[],
  filterableColumnIds?: string[]
) => {
  if (!Array.isArray(filterableColumnIds) || filterableColumnIds.length === 0) {
    return columns;
  }

  const filterableColumnIdsSet = new Set(filterableColumnIds);
  return columns.filter((column) => filterableColumnIdsSet.has(column.key));
};

export const fetchLineListDownloadRows = async ({
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
  filterableColumnIds,
  searcheableDataElements,
  customDisplayInReportsIds,
  columnNameSource,
  columnMetadataDisplayMode,
  fetchOrgUnits,
}: LineListDownloadRowsConfig): Promise<{
  columns: ColumnDefinition[];
  data: TableRow[];
}> => {
  if (!metaData) {
    return { columns: [], data: [] };
  }

  const isTracker = metaData.programType === 'WITH_REGISTRATION';
  const isEvent = metaData.programType === 'WITHOUT_REGISTRATION';
  const downloadPager = new Pager({ paging: false });
  const resolvedEndDate =
    endDate ?? format(addDays(new Date(), 1), 'yyyy-MM-dd');

  if (programStageId || isEvent) {
    const eventQuery = d2.eventModule.event
      .setEndDate(resolvedEndDate)
      .setProgram(programId)
      .setOrgUnit(orgUnit)
      .setOuMode(ouMode as OuMode)
      .setPagination(downloadPager);

    if (startDate) {
      eventQuery.setStartDate(startDate);
    }

    if (programStageId) {
      eventQuery.setProgramStage(programStageId);
    }

    const response = await eventQuery.get();
    const events = Array.isArray(response.data)
      ? response.data
      : response.data
      ? [response.data]
      : [];
    const eventsResponse: EventsResponse = {
      events,
      pager: new Pager({
        page: 1,
        pageSize: events.length || 1,
      }),
    };
    const downloadRows = getEvents(
      { data: eventsResponse },
      programStageId || '',
      eventsResponse.pager,
      metaData,
      columnNameSource,
      columnMetadataDisplayMode
    );

    return {
      columns: applyDownloadColumnFilter(
        downloadRows.columns,
        filterableColumnIds
      ),
      data: downloadRows.data,
    };
  }

  if (isTracker) {
    const trackerQuery = d2.trackerModule.trackedEntity
      .setEndDate(resolvedEndDate)
      .setProgram(programId)
      .setOrgUnit(orgUnit)
      .setOuMode(ouMode as OuMode)
      .setStatus(enrollmentStatus)
      .setFilters(dataQueryFilters)
      .setPagination(downloadPager)
      .setOrderCriterias([
        new DataOrderCriteria().setField('createdAt').setOrder('desc'),
      ]);

    if (startDate) {
      trackerQuery.setStartDate(startDate);
    }

    if (eventStatus?.status && eventStatus?.programStage) {
      trackerQuery.setEventStatus(eventStatus.status, eventStatus.programStage);
    }

    if (programStageId) {
      trackerQuery.setProgramStage(programStageId);
    }

    const response = await trackerQuery.get();
    const trackedEntityInstances = Array.isArray(response.data)
      ? response.data
      : response.data
      ? [response.data]
      : [];
    const uniqueOrgUnitIds = Array.from(
      new Set(
        trackedEntityInstances
          .flatMap((tei: TrackedEntityInstance) => [
            tei.latestEnrollment?.orgUnit,
            ...(tei.attributes
              ?.filter((attr: any) => attr.valueType === 'ORGANISATION_UNIT')
              .map((attr: any) => attr.value) || []),
          ])
          .filter((orgUnitId): orgUnitId is string => !!orgUnitId)
      )
    );
    const fetchedOrgUnits =
      uniqueOrgUnitIds.length > 0
        ? await firstValueFrom(fetchOrgUnits(uniqueOrgUnitIds))
        : new Map<string, string>();
    const trackedEntityResponse: TrackedEntityInstancesResponse = {
      trackedEntityInstances,
      pager: new Pager({
        page: 1,
        pageSize: trackedEntityInstances.length || 1,
      }),
      orgUnitsMap: fetchedOrgUnits,
    };
    const downloadRows = getTrackedEntityTableData(
      { data: trackedEntityResponse },
      programId,
      trackedEntityResponse.pager,
      metaData,
      searcheableDataElements,
      customDisplayInReportsIds,
      columnNameSource,
      columnMetadataDisplayMode
    );

    return {
      columns: applyDownloadColumnFilter(
        downloadRows.columns,
        filterableColumnIds
      ),
      data: downloadRows.data,
    };
  }

  return { columns: [], data: [] };
};
