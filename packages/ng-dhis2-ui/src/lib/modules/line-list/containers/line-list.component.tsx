// src/app/line-list-table.component.ts
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CircularLoader, colors } from '@dhis2/ui';
import {
  D2Window,
  DataFilterCondition,
  DataOrderCriteria,
  DataQueryFilter,
  DHIS2Event,
  EnrollmentStatus,
  EventStatus,
  OuMode,
  Pager,
  Program,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { OrgUnitSelector } from '../components/orgUnitSelector';
import { FilterToolbar } from '../components/table/filterToolbar';
import { LineListTable } from '../components/table/lineListTable';
import { ActionOptionOrientation, LineListActionOption } from '../models';
import { AttributeFilter } from '../models/attribute-filter.model';
import {
  ColumnDefinition,
  EventsResponse,
  TableRow,
  TrackedEntityInstancesResponse,
} from '../models/line-list.models';
import { LineListService } from '../services/line-list.service';
import {
  addActionsColumn,
  getTrackedEntityTableData,
} from '../utils/tei-table-data-utils';
import { getEvents } from '../utils/event-table-table-util';

@Component({
  selector: 'ng-dhis2-ui-line-list',
  template: '<ng-content></ng-content>',
  styleUrls: ['./line-list.component.scss'],
  standalone: false,
})
export class LineListTableComponent extends ReactWrapperModule {
  @Input() programId!: string;
  @Input() orgUnit!: string;
  @Input() programStageId?: string;
  @Input() actionOptions?: LineListActionOption[];
  @Input() actionOptionOrientation: ActionOptionOrientation = 'DROPDOWN';
  @Input() attributeFilters?: AttributeFilter[];
  @Input() useOuModeWithOlderDHIS2Instance?: boolean;
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() dataQueryFilters?: DataQueryFilter[];
  @Input() ouMode?: string;
  @Input() isButtonLoading = false;
  @Input() buttonFilter!: string;
  @Input() filterRootOrgUnit = false;
  @Input() showFilters = false;
  @Input() isOptionSetNameVisible = false;
  @Input() allowRowsSelection = false;
  @Input() enrollmentStatus!: EnrollmentStatus;
  @Input() eventStatus!: {
    programStage: string;
    status: EventStatus;
  };
  @Output() actionSelected = new EventEmitter<{
    action: string;
    data: TrackedEntityInstance | DHIS2Event;
  }>();
  @Output() rowsSelected = new EventEmitter<
    TrackedEntityInstance[] | DHIS2Event[]
  >();

  private reactStateUpdaters: any = null;

  setReactStateUpdaters = (updaters: any) => {
    this.reactStateUpdaters = updaters;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.reactStateUpdaters) {
      if (changes['programId']) {
        this.reactStateUpdaters.setProgramIdState(this.programId);
      }
      if (changes['isOptionSetNameVisible']) {
        this.reactStateUpdaters.setOptionSetNameVisible(
          this.isOptionSetNameVisible
        );
      }
      if (changes['orgUnit']) {
        this.reactStateUpdaters.setOrgUnitState(this.orgUnit);
      }
      if (changes['programStageId']) {
        this.reactStateUpdaters.setProgramStageIdState(this.programStageId);
      }
      if (changes['attributeFilters']) {
        this.reactStateUpdaters.setAttributeFiltersState(this.attributeFilters);
      }
      if (changes['startDate']) {
        this.reactStateUpdaters.setStartDateState(this.startDate);
      }
      if (changes['endDate']) {
        this.reactStateUpdaters.setEndDateState(this.endDate);
      }
      if (changes['isButtonLoading']) {
        this.reactStateUpdaters.setIsButtonLoading(this.isButtonLoading);
      }
      if (changes['allowRowsSelection']) {
        this.reactStateUpdaters.setIsButtonLoading(this.allowRowsSelection);
      }
    }
  }

  lineListService = inject(LineListService);

  LineList = () => {
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [data, setData] = useState<TableRow[]>([]);
    const [pager, setPager] = useState<Pager>(
      new Pager({
        page: 1,
        pageSize: 10,
        total: 0,
        pageCount: 1,
      })
    );
    const [programIdState, setProgramIdState] = useState<string>(
      this.programId
    );
    const [isOptionSetNameVisibleState, setOptionSetNameVisible] =
      useState<boolean>(this.isOptionSetNameVisible);
    const [orgUnitState, setOrgUnitState] = useState<string>(this.orgUnit);
    const [programStageIdState, setProgramStageIdState] = useState<
      string | undefined
    >(this.programStageId);
    const [attributeFiltersState, setAttributeFiltersState] = useState<
      AttributeFilter[] | undefined
    >(this.attributeFilters);
    const [dataQueryFiltersState, setDataQueryFiltersState] = useState<
      DataQueryFilter[]
    >(this.dataQueryFilters as DataQueryFilter[]);
    const [startDateState, setStartDateState] = useState<string | undefined>(
      this.startDate
    );
    const [endDateState, setEndDateState] = useState<string | undefined>(
      this.endDate
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [metaDataLoadng, setMetaDataLoading] = useState<boolean>(false);
    const [filteredColumns, setFilteredColumns] =
      useState<ColumnDefinition[]>();
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [orgUnitLabel, setOrgUnitLabel] = useState<string>('');
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>('');
    const [hide, setHide] = useState<boolean>(true);
    const [showAllFilters, setShowAllFilters] = useState(false);
    const visibleFilters = showAllFilters
      ? filteredColumns ?? []
      : (filteredColumns ?? []).slice(0, 2);
    const defaultOrgUnit = this.orgUnit;
    const [prevValue, setPrevValue] = useState<string>();
    const [dateStates, setDateStates] = useState<{ [key: string]: string }>({});
    const [metaData, setMetaData] = useState<Program | null>(null);
    const [selectable, setSelectable] = useState<boolean>(
      this.allowRowsSelection
    );

    const d2 = (window as unknown as D2Window).d2Web;

    // Store updaters in refs for Angular to access
    const updateRefs = useRef({
      setProgramIdState,
      setOrgUnitState,
      setProgramStageIdState,
      setAttributeFiltersState,
      setStartDateState,
      setEndDateState,
      setOptionSetNameVisible,
      setSelectable,
    });

    useEffect(() => {
      this.setReactStateUpdaters?.(updateRefs.current);
    }, []);

    useEffect(() => {
      setLoading(true);
      const fetchmetaData = async () => {
        try {
          const trackerResponse = (await d2.trackerModule.trackedEntity
            .setProgram(this.programId)
            .getMetaData()) as Program;
          const data = trackerResponse;
          setMetaData(data);
        } catch (error) {
          console.error('Failed to metadata:', error);
        }
      };

      if (this.programId) {
        fetchmetaData();
      }
    }, []);

    useEffect(() => {
      if (!metaData) {
        return undefined;
      }

      const isTracker = metaData.programType === 'WITH_REGISTRATION';
      const isEvent = metaData.programType === 'WITHOUT_REGISTRATION';
      const endDate = endDateState ?? new Date().toISOString().split('T')[0];

      if (this.programStageId || isEvent) {
        setLoading(true);
        d2.eventModule.event
          .setProgram(this.programId)
          .setProgramStage(this.programStageId as string)
          .setPagination(
            new Pager({
              pageSize: pager.pageSize,
              page: pager.page,
            })
          )
          .get()
          .then((response) => {
            const eventsResponse: EventsResponse = {
              events: response.data!,
              pager: pager,
              // orgUnitsMap: fetchedOrgUnits,
            };
            const { columns, data } = getEvents(
              { data: eventsResponse },
              this.programStageId as string,
              pager,
              metaData
            );
            const finalColumns: ColumnDefinition[] = addActionsColumn(
              [{ label: '#', key: 'index' }, ...columns],
              this.actionOptions
            );

            const pagerResponse = response.pagination;

            setLoading(false);
            setColumns(finalColumns);
            setData(data);
            setPager(new Pager(pagerResponse || {}));
          });
      } else if (isTracker) {
        setLoading(true);
        d2.trackerModule.trackedEntity
          .setEndDate(endDate)
          .setStartDate(startDateState as string)
          .setProgram(this.programId)
          .setProgramStage(this.programStageId as string)
          .setOrgUnit(orgUnitState)
          .setOuMode(this.ouMode as OuMode)
          .setStatus(this.enrollmentStatus)
          .setEventStatus(
            this.eventStatus?.status,
            this.eventStatus?.programStage
          )
          .setFilters(dataQueryFiltersState)
          .setPagination(
            new Pager({
              pageSize: pager.pageSize,
              page: pager.page,
            })
          )
          .setOrderCriterias([
            new DataOrderCriteria().setField('createdAt').setOrder('desc'),
          ])
          .get()
          .then((response) => {
            const trackedEntityInstances = Array.isArray(response.data)
              ? response.data
              : ([response.data] as TrackedEntityInstance[]);
            const orgUnitIdsFromEnrollments = new Set(
              trackedEntityInstances.map(
                (tei: TrackedEntityInstance) => tei.latestEnrollment.orgUnit
              )
            ) as Set<string>;
            const uniqueOrgUnitIds = [...orgUnitIdsFromEnrollments];

            this.lineListService.fetchOrgUnits(uniqueOrgUnitIds).subscribe({
              next: (fetchedOrgUnits) => {
                const trackedEntityResponse: TrackedEntityInstancesResponse = {
                  trackedEntityInstances: response.data!,
                  pager: pager,
                  orgUnitsMap: fetchedOrgUnits,
                };

                const { columns, data, filteredEntityColumns, orgUnitLabel } =
                  getTrackedEntityTableData(
                    { data: trackedEntityResponse },
                    this.programId,
                    pager,
                    metaData
                  );

                setFilteredColumns((prev) =>
                  filteredEntityColumns.length > 0
                    ? filteredEntityColumns
                    : prev
                );

                const finalColumns: ColumnDefinition[] = addActionsColumn(
                  [{ label: '#', key: 'index' }, ...columns],
                  this.actionOptions
                );

                const pagerResponse = response.pagination;

                setLoading(false);
                setColumns(finalColumns);
                setData(data);
                setPager(new Pager(pagerResponse || {}));
                setOrgUnitLabel(orgUnitLabel);
              },
              error: (err) => {
                console.error('Error fetching org units:', err);
                setLoading(false);
              },
            });
          });
      }
    }, [
      metaData,
      programIdState,
      orgUnitState,
      programStageIdState,
      attributeFiltersState,
      startDateState,
      endDateState,
      pager.page,
      pager.pageSize,
      isOptionSetNameVisibleState,
      dataQueryFiltersState,
    ]);

    const handleInputChange = (key: string, value: string) => {
      setInputValues((prevValues) => ({
        ...prevValues,
        [key]: value ?? '',
      }));

      setDataQueryFiltersState((prevFilters) => {
        // Remove old filter for this key
        const filteredFilters = prevFilters.filter((f) => f.attribute !== key);

        // Only add new filter if value is not empty
        const updatedFilters = value.trim()
          ? [
              ...filteredFilters,
              new DataQueryFilter()
                .setAttribute(key)
                .setCondition(DataFilterCondition.Like)
                .setValue(value),
            ]
          : filteredFilters;

        return updatedFilters;
      });
    };

    //TODO: MERGE THIS WITH HANDLE INPUT CHANGE PUT A CHECK FOR IF ITS A SELECT FIELD TO USE EQ
    const handleInputChangeForSelectField = (key: string, value: string) => {
      setInputValues((prevValues) => ({
        ...prevValues,
        [key]: value ?? '',
      }));

      setDataQueryFiltersState((prevFilters = []) => {
        // Remove existing filter for the same key (attribute)
        const filteredFilters = prevFilters.filter((f) => f.attribute !== key);

        // Only add new filter if value is not empty
        const updatedFilters = value.trim()
          ? [
              ...filteredFilters,
              new DataQueryFilter()
                .setAttribute(key)
                .setCondition(DataFilterCondition.Equal)
                .setValue(value),
            ]
          : filteredFilters;

        return updatedFilters;
      });
    };

    const handleDateSelect = (key: string, selectedDate: any) => {
      const selectedDateString = selectedDate?.calendarDateString ?? '';

      // Update dateStates
      setDateStates((prevDateStates) => ({
        ...prevDateStates,
        [key]: selectedDateString,
      }));

      // Update dataQueryFilters
      setDataQueryFiltersState((prevFilters) => {
        const filteredFilters = (prevFilters || []).filter(
          (f) => f.attribute !== key
        );

        const updatedFilters = selectedDateString.trim()
          ? [
              ...filteredFilters,
              new DataQueryFilter()
                .setAttribute(key)
                .setCondition(DataFilterCondition.Equal)
                .setValue(selectedDateString),
            ]
          : filteredFilters;

        return updatedFilters;
      });
    };

    function getTextColorFromBackGround(hex: string): string {
      // Remove the hash if present
      hex = hex.replace('#', '');

      // Convert to RGB
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // YIQ formula to calculate brightness
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;

      // Return black for light backgrounds, white for dark backgrounds
      return yiq >= 128 ? colors.grey700 : '#FFFFFF';
    }

    return (
      <div>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
            }}
          >
            <CircularLoader small />
            <div
              style={{
                fontSize: 14,
              }}
            >
              Loading
            </div>
          </div>
        ) : (
          <div>
            <OrgUnitSelector
              hide={hide}
              setHide={setHide}
              selectedOrgUnit={selectedOrgUnit}
              setSelectedOrgUnit={setSelectedOrgUnit}
              setOrgUnitState={setOrgUnitState}
            />
            {this.showFilters && (
              <FilterToolbar
                orgUnitLabel={orgUnitLabel}
                selectedOrgUnit={selectedOrgUnit}
                setSelectedOrgUnit={setSelectedOrgUnit}
                setOrgUnitState={setOrgUnitState}
                defaultOrgUnit={defaultOrgUnit}
                setHide={setHide}
                startDateState={startDateState}
                setStartDateState={setStartDateState}
                endDateState={endDateState}
                setEndDateState={setEndDateState}
                visibleFilters={visibleFilters}
                dateStates={dateStates}
                inputValues={inputValues}
                setInputValues={setInputValues}
                handleInputChange={handleInputChange}
                handleInputChangeForSelectField={
                  handleInputChangeForSelectField
                }
                handleDateSelect={handleDateSelect}
                prevValue={prevValue}
                setPrevValue={setPrevValue}
                showAllFilters={showAllFilters}
                setShowAllFilters={setShowAllFilters}
              />
            )}
            <LineListTable
              columns={columns}
              data={data}
              pager={pager}
              setPager={setPager}
              getTextColorFromBackGround={getTextColorFromBackGround}
              actionOptions={this.actionOptions}
              actionOptionOrientation={this.actionOptionOrientation}
              actionSelected={this.actionSelected}
              selectable={selectable}
              rowsSelected={this.rowsSelected}
            />
          </div>
        )}
      </div>
    );
  };

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    this.component = this.LineList;
    this.render();
  }
}

// {
//   "/api": {
//     "target": "http://41.59.227.69/tland-upgrade",
//     "secure": "false",
//     "auth": "nsajigwa:Hmis@2024",
//     "changeOrigin": "true"
//   },
//   "/": {
//     "target": "http://41.59.227.69/tland-upgrade",
//     "secure": "false",
//     "auth": "nsajigwa:Hmis@2024",
//     "changeOrigin": "true"
//   }
// }

// {
//   "/api": {
//     "target": "https://hrhis.moh.go.tz/test-hrhis",
//     "secure": "false",
//     "auth": "admin:district",
//     "changeOrigin": "true"
//   }
// }
