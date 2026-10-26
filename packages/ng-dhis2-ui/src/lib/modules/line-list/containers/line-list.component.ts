// import {
//   Component,
//   EventEmitter,
//   inject,
//   Input,
//   OnChanges,
//   Output,
//   SimpleChanges,
//   ChangeDetectionStrategy
// } from '@angular/core';
// import { CircularLoader, colors, DropdownButton, MenuItem } from '@dhis2/ui';
// import {
//   D2Window,
//   DataFilterCondition,
//   DataOrderCriteria,
//   DataQueryFilter,
//   DHIS2Event,
//   EnrollmentStatus,
//   EventStatus,
//   LineListRowActionFilterConfig,
//   OuMode,
//   Pager,
//   Program,
//   TrackedEntityInstance,
// } from '@iapps/d2-web-sdk';
// import React, { useEffect, useRef, useState } from 'react';
// import * as ReactDOM from 'react-dom/client';
// import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
// import { FilterToolbar } from '../components/table/filterToolbar';
// import type { SelectedOrgUnit } from '../models/selected-org-unit.model';
// import { LineListTable } from '../components/table/lineListTable';
// import { ActionOptionOrientation, LineListActionOption } from '../models';
// import { AttributeFilter } from '../models/attribute-filter.model';
// import { LineListColumnMetadataDisplayModeValue } from '../models/line-list-column-metadata-display-mode.model';
// import {
//   ColumnDefinition,
//   EventsResponse,
//   TableRow,
//   TrackedEntityInstancesResponse,
// } from '../models/line-list.models';
// import { LineListService } from '../services/line-list.service';
// import {
//   addActionsColumn,
//   getTrackedEntityTableData,
// } from '../utils/tei-table-data-utils';
// import { getEvents } from '../utils/event-table-data-util';
// import {
//   downloadLineListCsv,
//   downloadLineListExcel,
// } from '../utils/line-list-download.util';
// import { fetchLineListDownloadRows } from '../utils/line-list-download-data.util';
// import { addDays, format } from 'date-fns';
// import { firstValueFrom } from 'rxjs';

// @Component({
//   selector: 'ng-dhis2-ui-line-list',
//   template: '<ng-content></ng-content>',
//   styleUrls: ['./line-list.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   standalone: false,
// })
// export class LineListTableComponent
//   extends ReactWrapperModule
//   implements OnChanges
// {
//   @Input() triggerToken!: string;
//   @Input() programId!: string;
//   @Input() orgUnit!: string;
//   @Input() allowMultipleOrgUnits = false;
//   @Input() customOrgUnitRoots?: string[];
//   @Input() programStageId?: string;
//   @Input() actionOptions?: LineListActionOption[];
//   @Input() actionOptionOrientation: ActionOptionOrientation = 'DROPDOWN';
//   @Input() attributeFilters?: AttributeFilter[];
//   @Input() useOuModeWithOlderDHIS2Instance?: boolean;
//   @Input() startDate?: string;
//   @Input() endDate?: string;
//   @Input() dataQueryFilters?: DataQueryFilter[] = [];
//   @Input() lineListRowActionFilterConfig?: LineListRowActionFilterConfig;
//   @Input() hydrateForActionFiltering = true;
//   @Input() ouMode?: string;
//   @Input() isButtonLoading = false;
//   @Input() buttonFilter!: string;
//   @Input() filterRootOrgUnit = false;
//   @Input() showFilters = false;
//   @Input() isOptionSetNameVisible = false;
//   @Input() allowRowsSelection = false;
//   @Input() enrollmentStatus!: EnrollmentStatus;
//   @Input() filterableColumnIds!: string[];
//   @Input() triggerRefetch = false;
//   @Input() eventStatus!: {
//     programStage: string;
//     status: EventStatus;
//   };
//   @Output() actionSelected = new EventEmitter<{
//     action: string;
//     data: TrackedEntityInstance | DHIS2Event;
//   }>();
//   @Output() rowsSelected = new EventEmitter<
//     TrackedEntityInstance[] | DHIS2Event[]
//   >();
//   @Input() showActionButtons = true;
//   @Input() showEnrollmentDates = true;
//   @Input() showDownloadButton = false;
//   @Input() searcheableDataElements: string[] = [];
//   @Input() columnNameSource: 'NAME' | 'FORM_NAME' = 'NAME';
//   @Input() orgUnitAndDateColumnsPosition: 'start' | 'end' = 'start';
//   @Input() customDisplayInReportsIds?: string[];
//   @Input() columnMetadataDisplayMode?: LineListColumnMetadataDisplayModeValue;
//   private reactStateUpdaters: any = null;

//   setReactStateUpdaters = (updaters: any) => {
//     this.reactStateUpdaters = updaters;
//   };

//   ngOnChanges(changes: SimpleChanges) {
//     if (this.reactStateUpdaters) {
//       if (changes['triggerToken']) {
//         this.reactStateUpdaters.setTriggerTokenState(this.triggerToken);
//         this.reactStateUpdaters.setTriggerRefetch(this.triggerRefetch);
//       }
//       if (changes['programId']) {
//         this.reactStateUpdaters.setProgramIdState(this.programId);
//       }
//       if (changes['isOptionSetNameVisible']) {
//         this.reactStateUpdaters.setOptionSetNameVisible(
//           this.isOptionSetNameVisible
//         );
//       }
//       if (changes['orgUnit']) {
//         this.reactStateUpdaters.setDefaultOrgUnit(this.orgUnit);
//         this.reactStateUpdaters.setAppliedOrgUnits([]);
//         this.reactStateUpdaters.setSelectedOrgUnits([]);
//       }
//       if (changes['programStageId']) {
//         this.reactStateUpdaters.setProgramStageIdState(this.programStageId);
//       }
//       if (changes['attributeFilters']) {
//         this.reactStateUpdaters.setAttributeFiltersState(this.attributeFilters);
//       }
//       if (changes['startDate']) {
//         this.reactStateUpdaters.setStartDateState(this.startDate);
//       }
//       if (changes['endDate']) {
//         this.reactStateUpdaters.setEndDateState(this.endDate);
//       }
//       if (changes['isButtonLoading']) {
//         this.reactStateUpdaters.setIsButtonLoading(this.isButtonLoading);
//       }
//       if (changes['allowRowsSelection']) {
//         this.reactStateUpdaters.setIsButtonLoading(this.allowRowsSelection);
//       }
//       if (changes['triggerRefetch']) {
//         this.reactStateUpdaters.setTriggerRefetch(this.triggerRefetch);
//       }
//     }
//   }

//   lineListService = inject(LineListService);

//   LineList = () => {
//     const [columns, setColumns] = useState<ColumnDefinition[]>([]);
//     const [data, setData] = useState<TableRow[]>([]);
//     const [pager, setPager] = useState<Pager>(
//       new Pager({
//         page: 1,
//         pageSize: 10,
//         total: 0,
//         pageCount: 1,
//       })
//     );
//     const [triggerTokenState, setTriggerTokenState] = useState<
//       string | undefined
//     >(this.triggerToken);
//     const [programIdState, setProgramIdState] = useState<string>(
//       this.programId
//     );
//     const [isOptionSetNameVisibleState, setOptionSetNameVisible] =
//       useState<boolean>(this.isOptionSetNameVisible);
//     const [selectedOrgUnits, setSelectedOrgUnits] = useState<SelectedOrgUnit[]>([]);
//     const defaultOrgUnitMode = (this.ouMode) as OuMode;
//     const [appliedOrgUnitMode, setAppliedOrgUnitMode] = useState<OuMode>(defaultOrgUnitMode);
//     const [selectedOrgUnitMode, setSelectedOrgUnitMode] = useState<OuMode>(defaultOrgUnitMode);
//     const [defaultOrgUnit, setDefaultOrgUnit] = useState<string>(this.orgUnit);
//     const [appliedOrgUnits, setAppliedOrgUnits] = useState<SelectedOrgUnit[]>([]);
//     const orgUnitState = appliedOrgUnits.length
//       ? appliedOrgUnits.map((unit) => unit.id).join(';')
//       : defaultOrgUnit;
//     const [programStageIdState, setProgramStageIdState] = useState<
//       string | undefined
//     >(this.programStageId);
//     const [attributeFiltersState, setAttributeFiltersState] = useState<
//       AttributeFilter[] | undefined
//     >(this.attributeFilters);
//     const [dataQueryFiltersState, setDataQueryFiltersState] = useState<
//       DataQueryFilter[]
//     >(this.dataQueryFilters as DataQueryFilter[]);
//     const [tempDataQueryFiltersState, setTempDataQueryFiltersState] = useState<
//       DataQueryFilter[]
//     >(this.dataQueryFilters as DataQueryFilter[]);

//     const [rowActionFilterConfig, setRowActionFilterConfig] =
//       useState<LineListRowActionFilterConfig>(
//         this.lineListRowActionFilterConfig as LineListRowActionFilterConfig
//       );

//     const [startDateState, setStartDateState] = useState<string | undefined>(
//       this.startDate
//     );
//     const [tempStartDateState, setTempStartDateState] = useState<
//       string | undefined
//     >(this.startDate);
//     const [endDateState, setEndDateState] = useState<string | undefined>(
//       this.endDate
//     );
//     const [tempEndDateState, setTempEndDateState] = useState<
//       string | undefined
//     >(this.endDate);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
//     const [filteredColumns, setFilteredColumns] =
//       useState<ColumnDefinition[]>();
//     const [inputValues, setInputValues] = useState<Record<string, string>>({});
//     const [orgUnitLabel, setOrgUnitLabel] = useState<string>('');
//     const [showAllFilters, setShowAllFilters] = useState(false);
//     const visibleFilters = showAllFilters
//       ? filteredColumns ?? []
//       : (filteredColumns ?? []).slice(0, 5);
//     // const visibleFilters = showAllFilters
//     //   ? filteredColumns ?? []
//     //   : filteredColumns ?? []).slice(0, 2);
//     const [dateStates, setDateStates] = useState<{ [key: string]: string }>({});
//     const [prevDateStates, setPrevDateStates] = useState<{
//       [key: string]: string;
//     }>({});
//     const [metaData, setMetaData] = useState<Program | null>(null);
//     const [selectable, setSelectable] = useState<boolean>(
//       this.allowRowsSelection
//     );
//     const [triggerRefetch, setTriggerRefetch] = useState<boolean>(
//       this.triggerRefetch
//     );
//     const [showActionButtons, setShowActionButtons] = useState<boolean>(
//       this.showActionButtons
//     );
//     const [error, setError] = useState<string | null>(null);
//     const [prevInputValues, setPrevInputValues] = useState<
//       Record<string, string>
//     >({});

//     const d2 = (window as unknown as D2Window).d2Web;

//     // Stores updaters in refs for Angular to access
//     const updateRefs = useRef({
//       setProgramIdState,
//       setDefaultOrgUnit,
//       setAppliedOrgUnits,
//       setSelectedOrgUnits,
//       setProgramStageIdState,
//       setAttributeFiltersState,
//       setStartDateState,
//       setEndDateState,
//       setOptionSetNameVisible,
//       setSelectable,
//       setTriggerRefetch,
//       setTriggerTokenState,
//     });

//     useEffect(() => {
//       this.setReactStateUpdaters?.(updateRefs.current);
//       const fetchmetaData = async () => {
//         setLoading(true);
//         if (!this.programId) {
//           setMetaData(null);
//           setLoading(false);
//           return;
//         }

//         setError(null);
//         try {
//           const trackerResponse = (await d2.trackerModule.trackedEntity
//             .setProgram(this.programId)
//             .getMetaData({ skipProgramRules: true })) as Program;
//           if (!trackerResponse || !trackerResponse.programType) {
//             throw new Error('failed to load data.');
//           }
//           const data = trackerResponse;
//           setMetaData(data);
//         } catch (error) {
//           setError(error as string);
//           setLoading(false);
//         }
//       };

//       fetchmetaData();
//     }, []);

//     useEffect(() => {
//       if (!metaData) {
//         return undefined;
//       }
//       const isTracker = metaData.programType === 'WITH_REGISTRATION';
//       const isEvent = metaData.programType === 'WITHOUT_REGISTRATION';
//       const endDate =
//         endDateState ?? format(addDays(new Date(), 1), 'yyyy-MM-dd');

//       if (this.programStageId || isEvent) {
//         const fetchEventData = async () => {
//           try {
//             setError(null);
//             setLoading(true);
//             const response = await d2.eventModule.event
//               .setEndDate(endDate)
//               .setStartDate(startDateState as string)
//               .setProgram(this.programId)
//               .setProgramStage(this.programStageId as string)
//               .setOrgUnit(orgUnitState)
//               .setOuMode(appliedOrgUnitMode)
//               .setPagination(
//                 new Pager({
//                   pageSize: pager.pageSize,
//                   page: pager.page,
//                 })
//               )
//               .get();
//             if (response.responseStatus.status !== 200) {
//               throw new Error('failed to load data.');
//             }
//             const eventsResponse: EventsResponse = {
//               events: response.data!,
//               pager: pager,
//               // orgUnitsMap: fetchedOrgUnits,
//             };
//             const { columns, data } = getEvents(
//               { data: eventsResponse },
//               this.programStageId as string,
//               pager,
//               metaData,
//               this.columnNameSource,
//               this.columnMetadataDisplayMode
//             );

//             // const filterableColumnIdsSet = new Set(
//             //   this.filterableColumnIds
//             // );

//             // const updatedFilterableColumnIds: ColumnDefinition[] =
//             //   columns.filter((column) =>
//             //     filterableColumnIdsSet.has(column.key)
//             //   );

//             // const finalColumns: ColumnDefinition[] = addActionsColumn(
//             //   [{ label: '#', key: 'index' }, ...updatedFilterableColumnIds],
//             //   this.actionOptions
//             // );

//             let updatedFilterableColumnIds: ColumnDefinition[];

//             if (
//               Array.isArray(this.filterableColumnIds) &&
//               this.filterableColumnIds.length > 0
//             ) {
//               const filterableColumnIdsSet = new Set(this.filterableColumnIds);
//               updatedFilterableColumnIds = columns.filter((column) =>
//                 filterableColumnIdsSet.has(column.key)
//               );
//             } else {
//               updatedFilterableColumnIds = columns;
//             }

//             const finalColumns: ColumnDefinition[] = addActionsColumn(
//               [{ label: '#', key: 'index' }, ...updatedFilterableColumnIds],
//               this.actionOptions
//             );

//             const pagerResponse = response.pagination;

//             setColumns(finalColumns);
//             setData(data);
//             setPager(new Pager(pagerResponse || {}));
//           } catch {
//             console.error('Failed to fetch event data:', error);
//             setError('Could not load records. Please reload.');
//           } finally {
//             setLoading(false);
//           }
//         };
//         fetchEventData();
//       } else if (isTracker) {
//         const fetchTrackerData = async () => {
//           try {
//             setError(null);
//             setLoading(true);
//             const response = await d2.trackerModule.trackedEntity
//               .setEndDate(endDate)
//               .setStartDate(startDateState as string)
//               .setProgram(this.programId)
//               .setProgramStage(this.programStageId as string)
//               .setOrgUnit(orgUnitState)
//               .setOuMode(appliedOrgUnitMode)
//               .setStatus(this.enrollmentStatus)
//               .setEventStatus(
//                 this.eventStatus?.status,
//                 this.eventStatus?.programStage
//               )
//               .setFilters(dataQueryFiltersState)
//               .setPagination(
//                 new Pager({
//                   pageSize: pager.pageSize,
//                   page: pager.page,
//                 })
//               )
//               .setOrderCriterias([
//                 new DataOrderCriteria().setField('createdAt').setOrder('desc'),
//               ])
//               .get();
//             if (response.responseStatus.status !== 200) {
//               throw new Error('failed to load data.');
//             }

//             const trackedEntityInstances = Array.isArray(response.data)
//               ? response.data
//               : ([response.data] as TrackedEntityInstance[]);
//             const orgUnitIdsFromEnrollments = new Set(
//               trackedEntityInstances.map(
//                 (tei: TrackedEntityInstance) => tei.latestEnrollment.orgUnit
//               )
//             ) as Set<string>;

//             const orgUnitsFromAttributes = new Set(
//               trackedEntityInstances.flatMap(
//                 (tei: TrackedEntityInstance) =>
//                   tei.attributes
//                     ?.filter(
//                       (attr: any) => attr.valueType === 'ORGANISATION_UNIT'
//                     )
//                     .map((attr: any) => attr.value) || []
//               )
//             );

//             const uniqueOrgUnitIds = [
//               ...orgUnitIdsFromEnrollments,
//               ...orgUnitsFromAttributes,
//             ];

//             const fetchedOrgUnits = await firstValueFrom(
//               this.lineListService.fetchOrgUnits(uniqueOrgUnitIds)
//             );

//             const trackedEntityResponse: TrackedEntityInstancesResponse = {
//               trackedEntityInstances: response.data!,
//               pager: pager,
//               orgUnitsMap: fetchedOrgUnits,
//             };

//             const { columns, data, filteredEntityColumns, orgUnitLabel } =
//               getTrackedEntityTableData(
//                 { data: trackedEntityResponse },
//                 this.programId,
//                 pager,
//                 metaData,
//                 this.searcheableDataElements,
//                 this.customDisplayInReportsIds,
//                 this.columnNameSource,
//                 this.columnMetadataDisplayMode,
//                 this.orgUnitAndDateColumnsPosition
//               );

//             setFilteredColumns((prev) =>
//               filteredEntityColumns.length > 0 ? filteredEntityColumns : prev
//             );

//             let updatedFilterableColumnIds: ColumnDefinition[];

//             if (
//               Array.isArray(this.filterableColumnIds) &&
//               this.filterableColumnIds.length > 0
//             ) {
//               const filterableColumnIdsSet = new Set(this.filterableColumnIds);
//               updatedFilterableColumnIds = columns.filter((column) =>
//                 filterableColumnIdsSet.has(column.key)
//               );
//             } else {
//               updatedFilterableColumnIds = columns;
//             }

//             const finalColumns: ColumnDefinition[] = addActionsColumn(
//               [{ label: '#', key: 'index' }, ...updatedFilterableColumnIds],
//               this.actionOptions
//             );

//             // const finalColumns: ColumnDefinition[] = addActionsColumn(
//             //   [{ label: '#', key: 'index' }, ...columns],
//             //   this.actionOptions
//             // );

//             const pagerResponse = response.pagination;

//             setColumns(finalColumns);
//             setData(data);
//             setPager(new Pager(pagerResponse || {}));
//             setOrgUnitLabel(orgUnitLabel);
//           } catch (error) {
//             console.error('Failed to fetch tracker data:', error);
//             setError('Could not load records. Please reload.');
//           } finally {
//             setLoading(false);
//           }
//         };
//         fetchTrackerData();
//       }
//     }, [
//       metaData,
//       programIdState,
//       orgUnitState,
//       appliedOrgUnitMode,
//       programStageIdState,
//       attributeFiltersState,
//       startDateState,
//       endDateState,
//       pager.page,
//       pager.pageSize,
//       isOptionSetNameVisibleState,
//       dataQueryFiltersState,
//       triggerRefetch,
//       triggerTokenState,
//     ]);

//     //TODO: ADD DOWNLOADING SUPPORT USING ANALYTICS
//     const handleDownload = async (format: 'CSV' | 'XLSX') => {
//       try {
//         setDownloadLoading(true);
//         const { columns, data } = await fetchLineListDownloadRows({
//           d2,
//           metaData,
//           programId: programIdState,
//           programStageId: programStageIdState,
//           orgUnit: orgUnitState,
//           ouMode: appliedOrgUnitMode,
//           startDate: startDateState,
//           endDate: endDateState,
//           dataQueryFilters: dataQueryFiltersState,
//           enrollmentStatus: this.enrollmentStatus,
//           eventStatus: this.eventStatus,
//           filterableColumnIds: this.filterableColumnIds,
//           searcheableDataElements: this.searcheableDataElements,
//           customDisplayInReportsIds: this.customDisplayInReportsIds,
//           columnNameSource: this.columnNameSource,
//           columnMetadataDisplayMode: this.columnMetadataDisplayMode,
//           fetchOrgUnits: (orgUnitIds) =>
//             this.lineListService.fetchOrgUnits(orgUnitIds),
//         });

//         if (format === 'CSV') {
//           downloadLineListCsv(columns, data);
//           return;
//         }

//         downloadLineListExcel(columns, data);
//       } catch (error) {
//         console.error('Failed to download line list data:', error);
//         setError('Could not download records. Please try again.');
//       } finally {
//         setDownloadLoading(false);
//       }
//     };

//     const handleInputChange = (key: string, value: string, type: string) => {
//       setInputValues((prevValues) => ({
//         ...prevValues,
//         [key]: value ?? '',
//       }));

//       setTempDataQueryFiltersState((prevFilters) => {
//         // Removes old filter for this key
//         const filteredFilters = prevFilters.filter((f) => f.attribute !== key);

//         // adds new filter only if value is not empty
//         let updatedFilters;
//         if (type === 'dataElement') {
//           updatedFilters =
//             value && value.length
//               ? [
//                   ...filteredFilters,
//                   new DataQueryFilter()
//                     .setAttribute(key)
//                     .setCondition(DataFilterCondition.Like)
//                     .setValue(value)
//                     .setType('DATA_ELEMENT'),
//                 ]
//               : filteredFilters;
//         } else {
//           updatedFilters = value.trim()
//             ? [
//                 ...filteredFilters,
//                 new DataQueryFilter()
//                   .setAttribute(key)
//                   .setCondition(DataFilterCondition.Like)
//                   .setValue(value),
//               ]
//             : filteredFilters;
//         }

//         return updatedFilters;
//       });
//     };

//     //TODO: MERGE THIS WITH HANDLE INPUT CHANGE PUT A CHECK FOR IF ITS A SELECT FIELD TO USE EQ
//     const handleInputChangeForSelectField = (
//       key: string,
//       value: string,
//       type: string
//     ) => {
//       setInputValues((prevValues) => ({
//         ...prevValues,
//         [key]: value ?? '',
//       }));

//       setTempDataQueryFiltersState((prevFilters = []) => {
//         // Removes existing filter for the same key (attribute)
//         const filteredFilters = prevFilters.filter((f) => f.attribute !== key);

//         // adds new filter only if value is not empty
//         let updatedFilters;
//         if (type === 'dataElement') {
//           updatedFilters =
//             value && value.length
//               ? [
//                   ...filteredFilters,
//                   new DataQueryFilter()
//                     .setAttribute(key)
//                     .setCondition(DataFilterCondition.Equal)
//                     .setValue(value)
//                     .setType('DATA_ELEMENT'),
//                 ]
//               : filteredFilters;
//         } else {
//           updatedFilters = value.trim()
//             ? [
//                 ...filteredFilters,
//                 new DataQueryFilter()
//                   .setAttribute(key)
//                   .setCondition(DataFilterCondition.Equal)
//                   .setValue(value),
//               ]
//             : filteredFilters;
//         }

//         return updatedFilters;
//       });
//     };

//     const handleDateSelect = (key: string, selectedDate: any, type: string) => {
//       const selectedDateString = selectedDate?.calendarDateString ?? '';

//       // Updates dateStates
//       setDateStates((prevDateStates) => ({
//         ...prevDateStates,
//         [key]: selectedDateString,
//       }));

//       // Updates dataQueryFilters
//       setTempDataQueryFiltersState((prevFilters) => {
//         const filteredFilters = (prevFilters || []).filter(
//           (f) => f.attribute !== key
//         );

//         // const updatedFilters = selectedDateString.trim()
//         //   ? [
//         //       ...filteredFilters,
//         //       new DataQueryFilter()
//         //         .setAttribute(key)
//         //         .setCondition(DataFilterCondition.Equal)
//         //         .setValue(selectedDateString),
//         //     ]
//         //   : filteredFilters;
//         let updatedFilters;
//         if (type === 'dataElement') {
//           updatedFilters = selectedDateString.trim()
//             ? [
//                 ...filteredFilters,
//                 new DataQueryFilter()
//                   .setAttribute(key)
//                   .setCondition(DataFilterCondition.Equal)
//                   .setValue(selectedDateString)
//                   .setType('DATA_ELEMENT'),
//               ]
//             : filteredFilters;
//         } else {
//           updatedFilters = selectedDateString.trim()
//             ? [
//                 ...filteredFilters,
//                 new DataQueryFilter()
//                   .setAttribute(key)
//                   .setCondition(DataFilterCondition.Equal)
//                   .setValue(selectedDateString),
//               ]
//             : filteredFilters;
//         }

//         return updatedFilters;
//       });
//     };

//     const handleAdditionalFilters = () =>
//       setDataQueryFiltersState(tempDataQueryFiltersState);
//     const handleStartDateFilter = () => setStartDateState(tempStartDateState);
//     const handleEndDateFilter = () => setEndDateState(tempEndDateState);
//     const handleOrgUnitFilter = () => {
//       setAppliedOrgUnits([...selectedOrgUnits]);
//       setAppliedOrgUnitMode(selectedOrgUnitMode);
//       setPager((previous) => new Pager({ ...previous, page: 1 }));
//     };
//     const handleOrgUnitModeReset = () => {
//       setAppliedOrgUnitMode(defaultOrgUnitMode);
//       setSelectedOrgUnitMode(defaultOrgUnitMode);
//       setPager((previous) => new Pager({ ...previous, page: 1 }));
//     };

//     function getTextColorFromBackGround(hex: string): string {
//       hex = hex.replace('#', '');

//       const r = parseInt(hex.substr(0, 2), 16);
//       const g = parseInt(hex.substr(2, 2), 16);
//       const b = parseInt(hex.substr(4, 2), 16);

//       const yiq = (r * 299 + g * 587 + b * 114) / 1000;

//       // Returns black for light backgrounds, white for dark backgrounds
//       return yiq >= 128 ? colors.grey700 : '#FFFFFF';
//     }

//     return React.createElement(
//       'div',
//       { className: 'line-list-root' },
//       loading
//         ? React.createElement(
//             'div',
//             {
//               style: {
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 8,
//                 padding: 8,
//               },
//             },
//             React.createElement(CircularLoader, { small: true }),
//             React.createElement(
//               'div',
//               {
//                 style: {
//                   fontSize: 14,
//                 },
//               },
//               'Loading'
//             )
//           )
//         : React.createElement(
//             'div',
//             null,
//             this.showDownloadButton &&
//               React.createElement(
//                 'div',
//                 {
//                   className: 'line-list-download-toolbar',
//                   style: {
//                     paddingBottom: '1rem',
//                   },
//                 },
//                 React.createElement(
//                   DropdownButton,
//                   {
//                     name: 'Download',
//                     disabled: downloadLoading,
//                     component: React.createElement(
//                       'span',
//                       null,
//                       ' ',
//                       React.createElement(MenuItem, {
//                         label: 'CSV',
//                         disabled: downloadLoading,
//                         onClick: () => handleDownload('CSV'),
//                       }),
//                       React.createElement(MenuItem, {
//                         label: 'Excel',
//                         disabled: downloadLoading,
//                         onClick: () => handleDownload('XLSX'),
//                       })
//                     ),
//                     value: 'Download',
//                   },
//                   downloadLoading
//                     ? React.createElement(CircularLoader, { small: true })
//                     : 'Download'
//                 )
//               ),
//             this.showFilters &&
//               React.createElement(FilterToolbar, {
//                 orgUnit: {
//                   allowMultipleOrgUnits: this.allowMultipleOrgUnits,
//                   appliedOrgUnits,
//                   setAppliedOrgUnits,
//                   selectedOrgUnits,
//                   setSelectedOrgUnits,
//                   customOrgUnitRoots: this.customOrgUnitRoots,
//                   orgUnitLabel,
//                   handleOrgUnitFilter,
//                   appliedOrgUnitMode,
//                   selectedOrgUnitMode,
//                   defaultOrgUnitMode,
//                   setSelectedOrgUnitMode,
//                   handleOrgUnitModeReset,
//                 },
//                 dates: {
//                   startDateState,
//                   setStartDateState,
//                   endDateState,
//                   setEndDateState,
//                   setTempStartDateState,
//                   setTempEndDateState,
//                   tempStartDateState,
//                   tempEndDateState,
//                   showEnrollmentDates: this.showEnrollmentDates,
//                   handleStartDateFilter,
//                   handleEndDateFilter,
//                 },
//                 filters: {
//                   visibleFilters,
//                   dateStates,
//                   inputValues,
//                   setInputValues,
//                   handleInputChange,
//                   handleInputChangeForSelectField,
//                   handleDateSelect,
//                   showAllFilters,
//                   setShowAllFilters,
//                   dataQueryFiltersState,
//                   setDataQueryFiltersState,
//                   handleAdditionalFilters,
//                   setDateStates,
//                   prevInputValues,
//                   setPrevInputValues,
//                   setTempDataQueryFiltersState,
//                   prevDateStates,
//                   setPrevDateStates,
//                 },
//               }),
//             React.createElement(
//               'div',
//               { className: 'line-list-table-scroll' },
//               React.createElement(LineListTable, {
//                 columns: columns,
//                 data: data,
//                 pager: pager,
//                 setPager: setPager,
//                 getTextColorFromBackGround: getTextColorFromBackGround,
//                 actionOptions: this.actionOptions,
//                 rowActionFilterConfig: this.lineListRowActionFilterConfig,
//                 actionOptionOrientation: this.actionOptionOrientation,
//                 actionSelected: this.actionSelected,
//                 selectable: selectable,
//                 rowsSelected: this.rowsSelected,
//                 showActionButtons: showActionButtons,
//                 error: error,
//               })
//             )
//           )
//     );
//   };

//   override async ngAfterViewInit() {
//     if (!this.elementRef) throw new Error('No element ref');
//     this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

//     this.component = this.LineList;
//     this.render();
//   }
// }

import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Button, CircularLoader, colors, NoticeBox } from '@dhis2/ui';
import {
  D2Window,
  DataFilterCondition,
  DataOrderCriteria,
  DataQueryFilter,
  DHIS2Event,
  EnrollmentStatus,
  EventStatus,
  LineListRowActionFilterConfig,
  OuMode,
  Pager,
  Program,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { FilterToolbar } from '../components/table/filterToolbar';
import type { SelectedOrgUnit } from '../models/selected-org-unit.model';
import { LineListTable } from '../components/table/lineListTable';
import { ActionOptionOrientation, LineListActionOption } from '../models';
import { AttributeFilter } from '../models/attribute-filter.model';
import { LineListColumnMetadataDisplayModeValue } from '../models/line-list-column-metadata-display-mode.model';
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
import { getEvents } from '../utils/event-table-data-util';
import {
  downloadLineListCsv,
  downloadLineListExcel,
} from '../utils/line-list-download.util';
import { fetchLineListDownloadRows } from '../utils/line-list-download-data.util';
import { createLineListFileName } from '../utils/line-list-file-name.util';
import { addDays, format } from 'date-fns';
import { firstValueFrom } from 'rxjs';
import {
  escapeTrackerFilterValue,
  isValidFilterValue,
  normalizeDateTimeFilterValue,
} from '../utils/filter-value-utils';

function getTextColorFromBackGround(hex: string): string {
  hex = hex.replace('#', '');

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Returns black for light backgrounds, white for dark backgrounds
  return yiq >= 128 ? colors.grey700 : '#FFFFFF';
}

function getRequestErrorMessage(error: unknown, context: string): string {
  const e = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  } | null;
  const status = e?.response?.status;
  const detail = e?.response?.data?.message || e?.message;
  return detail
    ? `Could not load ${context}${status ? ` (HTTP ${status})` : ''}: ${detail}`
    : `Could not load ${context}. Please try again.`;
}

@Component({
  selector: 'ng-dhis2-ui-line-list',
  template: '<ng-content></ng-content>',
  styleUrls: ['./line-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LineListTableComponent
  extends ReactWrapperModule
  implements OnChanges
{
  @Input() triggerToken!: string;
  @Input() programId!: string;
  @Input() orgUnit!: string;
  @Input() allowMultipleOrgUnits = false;
  @Input() customOrgUnitRoots?: string[];
  @Input() programStageId?: string;
  @Input() actionOptions?: LineListActionOption[];
  @Input() actionOptionOrientation: ActionOptionOrientation = 'DROPDOWN';
  @Input() attributeFilters?: AttributeFilter[];
  @Input() useOuModeWithOlderDHIS2Instance?: boolean;
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() dataQueryFilters?: DataQueryFilter[] = [];
  @Input() lineListRowActionFilterConfig?: LineListRowActionFilterConfig;
  @Input() hydrateForActionFiltering = true;
  @Input() ouMode?: string;
  @Input() isButtonLoading = false;
  @Input() buttonFilter!: string;
  @Input() filterRootOrgUnit = false;
  @Input() showFilters = false;
  @Input() isOptionSetNameVisible = false;
  @Input() allowRowsSelection = false;
  @Input() enrollmentStatus!: EnrollmentStatus;
  @Input() filterableColumnIds!: string[];
  @Input() triggerRefetch = false;
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
  @Input() showActionButtons = true;
  @Input() showEnrollmentDates = true;
  @Input() showDownloadButton = false;
  /** Custom heading for the result summary; defaults to 'Records'. */
  @Input() recordsLabel = 'Records';
  @Input() searcheableDataElements: string[] = [];
  @Input() columnNameSource: 'NAME' | 'FORM_NAME' = 'NAME';
  @Input() orgUnitAndDateColumnsPosition: 'start' | 'end' = 'start';
  @Input() customDisplayInReportsIds?: string[];
  @Input() columnMetadataDisplayMode?: LineListColumnMetadataDisplayModeValue;
  private reactStateUpdaters: any = null;

  setReactStateUpdaters = (updaters: any) => {
    this.reactStateUpdaters = updaters;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.reactStateUpdaters) {
      if (changes['triggerToken']) {
        this.reactStateUpdaters.setTriggerTokenState(this.triggerToken);
        this.reactStateUpdaters.setTriggerRefetch(this.triggerRefetch);
      }
      if (changes['programId']) {
        this.reactStateUpdaters.setProgramIdState(this.programId);
      }
      if (changes['isOptionSetNameVisible']) {
        this.reactStateUpdaters.setOptionSetNameVisible(
          this.isOptionSetNameVisible
        );
      }
      if (changes['orgUnit']) {
        this.reactStateUpdaters.setDefaultOrgUnit(this.orgUnit);
        this.reactStateUpdaters.setAppliedOrgUnits([]);
        this.reactStateUpdaters.setSelectedOrgUnits([]);
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
      if (changes['showActionButtons']) {
        this.reactStateUpdaters.setShowActionButtons(this.showActionButtons);
      }
      if (changes['showDownloadButton']) {
        this.reactStateUpdaters.setShowDownloadButton(this.showDownloadButton);
      }
      if (changes['recordsLabel']) {
        this.reactStateUpdaters.setRecordsLabel(this.recordsLabel);
      }
      if (changes['isButtonLoading']) {
        // Download-button loading is an Angular input; React reads it on render.
      }
      if (changes['allowRowsSelection']) {
        this.reactStateUpdaters.setSelectable(this.allowRowsSelection);
      }
      if (changes['triggerRefetch']) {
        this.reactStateUpdaters.setTriggerRefetch(this.triggerRefetch);
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
    const [triggerTokenState, setTriggerTokenState] = useState<
      string | undefined
    >(this.triggerToken);
    const [programIdState, setProgramIdState] = useState<string>(
      this.programId
    );
    const [, setOptionSetNameVisible] = useState<boolean>(
      this.isOptionSetNameVisible
    );
    const [selectedOrgUnits, setSelectedOrgUnits] = useState<SelectedOrgUnit[]>(
      []
    );
    const defaultOrgUnitMode = this.ouMode as OuMode;
    const [appliedOrgUnitMode, setAppliedOrgUnitMode] =
      useState<OuMode>(defaultOrgUnitMode);
    const [selectedOrgUnitMode, setSelectedOrgUnitMode] =
      useState<OuMode>(defaultOrgUnitMode);
    const [defaultOrgUnit, setDefaultOrgUnit] = useState<string>(this.orgUnit);
    const [appliedOrgUnits, setAppliedOrgUnits] = useState<SelectedOrgUnit[]>(
      []
    );
    const orgUnitState = appliedOrgUnits.length
      ? appliedOrgUnits.map((unit) => unit.id).join(';')
      : defaultOrgUnit;
    const [programStageIdState, setProgramStageIdState] = useState<
      string | undefined
    >(this.programStageId);
    const [, setAttributeFiltersState] = useState<
      AttributeFilter[] | undefined
    >(this.attributeFilters);
    const [dataQueryFiltersState, setDataQueryFiltersState] = useState<
      DataQueryFilter[]
    >(this.dataQueryFilters as DataQueryFilter[]);

    const [startDateState, setStartDateState] = useState<string | undefined>(
      this.startDate
    );
    const [tempStartDateState, setTempStartDateState] = useState<
      string | undefined
    >(this.startDate);
    const [endDateState, setEndDateState] = useState<string | undefined>(
      this.endDate
    );
    const [tempEndDateState, setTempEndDateState] = useState<
      string | undefined
    >(this.endDate);
    const [loading, setLoading] = useState<boolean>(false);
    const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
    const requestSequence = useRef(0);
    const [showDownloadButton, setShowDownloadButton] = useState<boolean>(
      this.showDownloadButton
    );
    const [recordsLabel, setRecordsLabel] = useState<string>(this.recordsLabel);
    const [downloadLoading, setDownloadLoading] = useState<
      'CSV' | 'XLSX' | null
    >(null);
    const downloadInFlightRef = useRef<'CSV' | 'XLSX' | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);
    const [filteredColumns, setFilteredColumns] =
      useState<ColumnDefinition[]>();
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [orgUnitLabel, setOrgUnitLabel] = useState<string>('');
    const [showAllFilters, setShowAllFilters] = useState(false);
    const visibleFilters = React.useMemo(
      () =>
        showAllFilters
          ? filteredColumns ?? []
          : (filteredColumns ?? []).slice(0, 5),
      [showAllFilters, filteredColumns]
    );
    // const visibleFilters = showAllFilters
    //   ? filteredColumns ?? []
    //   : filteredColumns ?? []).slice(0, 2);
    const [dateStates, setDateStates] = useState<{ [key: string]: string }>({});
    const [prevDateStates, setPrevDateStates] = useState<{
      [key: string]: string;
    }>({});
    const [metaData, setMetaData] = useState<Program | null>(null);
    const [selectable, setSelectable] = useState<boolean>(
      this.allowRowsSelection
    );
    const [triggerRefetch, setTriggerRefetch] = useState<boolean>(
      this.triggerRefetch
    );
    const [showActionButtons, setShowActionButtons] = useState<boolean>(
      this.showActionButtons
    );
    const [error, setError] = useState<string | null>(null);
    const [prevInputValues, setPrevInputValues] = useState<
      Record<string, string>
    >({});

    const d2 = (window as unknown as D2Window).d2Web;

    // Stores updaters in refs for Angular to access
    const updateRefs = useRef({
      setProgramIdState,
      setDefaultOrgUnit,
      setAppliedOrgUnits,
      setSelectedOrgUnits,
      setProgramStageIdState,
      setAttributeFiltersState,
      setStartDateState,
      setEndDateState,
      setOptionSetNameVisible,
      setSelectable,
      setTriggerRefetch,
      setTriggerTokenState,
      setShowDownloadButton,
      setRecordsLabel,
      setShowActionButtons,
    });

    useEffect(() => {
      this.setReactStateUpdaters?.(updateRefs.current);
      let active = true;
      requestSequence.current += 1;
      setMetaData(null);
      setFilteredColumns(undefined);
      setInputValues({});
      setDateStates({});
      setPrevInputValues({});
      setPrevDateStates({});
      setDataQueryFiltersState(this.dataQueryFilters ?? []);
      const fetchmetaData = async () => {
        setMetadataLoading(true);
        if (!programIdState) {
          setMetaData(null);
          setMetadataLoading(false);
          return;
        }

        setError(null);
        try {
          const trackerResponse = (await d2.trackerModule.trackedEntity
            .setProgram(programIdState)
            .getMetaData({ skipProgramRules: true })) as Program;
          if (!trackerResponse || !trackerResponse.programType) {
            throw new Error('failed to load data.');
          }
          const data = trackerResponse;
          if (active) {
            setLoading(true); // No stale results while the newly selected program loads.
            setMetaData(data);
          }
        } catch (error) {
          if (active)
            setError(error instanceof Error ? error.message : String(error));
        } finally {
          if (active) setMetadataLoading(false);
        }
      };

      fetchmetaData();
      return () => {
        active = false;
      };
    }, [programIdState]);

    useEffect(() => {
      if (!metaData) {
        return undefined;
      }
      const currentRequest = ++requestSequence.current;
      const isTracker = metaData.programType === 'WITH_REGISTRATION';
      const isEvent = metaData.programType === 'WITHOUT_REGISTRATION';
      const endDate =
        endDateState ?? format(addDays(new Date(), 1), 'yyyy-MM-dd');

      if (programStageIdState || isEvent) {
        const fetchEventData = async () => {
          try {
            setError(null);
            setLoading(true);
            const response = await d2.eventModule.event
              .setEndDate(endDate)
              .setStartDate(startDateState as string)
              .setProgram(programIdState)
              .setProgramStage(programStageIdState as string)
              .setOrgUnit(orgUnitState)
              .setOuMode(appliedOrgUnitMode)
              .setPagination(
                new Pager({
                  pageSize: pager.pageSize,
                  page: pager.page,
                })
              )
              .get();
            if (response.responseStatus.status !== 200) {
              throw new Error('failed to load data.');
            }
            const eventsResponse: EventsResponse = {
              events: response.data!,
              pager: pager,
              // orgUnitsMap: fetchedOrgUnits,
            };
            const { columns, data } = getEvents(
              { data: eventsResponse },
              programStageIdState as string,
              pager,
              metaData,
              this.columnNameSource,
              this.columnMetadataDisplayMode
            );

            // const updatedFilterableColumnIds: ColumnDefinition[] =
            //   columns.filter((column) =>
            //     filterableColumnIdsSet.has(column.key)
            //   );

            // const finalColumns: ColumnDefinition[] = addActionsColumn(
            //   [{ label: '#', key: 'index' }, ...updatedFilterableColumnIds],
            //   this.actionOptions
            // );

            let updatedFilterableColumnIds: ColumnDefinition[];

            if (
              Array.isArray(this.filterableColumnIds) &&
              this.filterableColumnIds.length > 0
            ) {
              const filterableColumnIdsSet = new Set(this.filterableColumnIds);
              updatedFilterableColumnIds = columns.filter((column) =>
                filterableColumnIdsSet.has(column.key)
              );
            } else {
              updatedFilterableColumnIds = columns;
            }

            const finalColumns: ColumnDefinition[] = addActionsColumn(
              [{ label: '#', key: 'index' }, ...updatedFilterableColumnIds],
              this.actionOptions
            );

            const pagerResponse = response.pagination;

            if (currentRequest !== requestSequence.current) return;
            setColumns(finalColumns);
            setData(data);
            if (pagerResponse) {
              const next = new Pager(pagerResponse);
              setPager((previous) =>
                previous.page === next.page &&
                previous.pageSize === next.pageSize &&
                previous.total === next.total &&
                previous.pageCount === next.pageCount
                  ? previous
                  : next
              );
            }
          } catch (error) {
            console.error('Failed to fetch event data:', error);
            if (currentRequest === requestSequence.current)
              setError(getRequestErrorMessage(error, 'event records'));
          } finally {
            if (currentRequest === requestSequence.current) setLoading(false);
          }
        };
        fetchEventData();
      } else if (isTracker) {
        const fetchTrackerData = async () => {
          try {
            setError(null);
            setLoading(true);
            const response = await d2.trackerModule.trackedEntity
              .setEndDate(endDate)
              .setStartDate(startDateState as string)
              .setProgram(programIdState)
              .setProgramStage(programStageIdState as string)
              .setOrgUnit(orgUnitState)
              .setOuMode(appliedOrgUnitMode)
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
              .get();
            if (response.responseStatus.status !== 200) {
              throw new Error('failed to load data.');
            }

            const trackedEntityInstances: TrackedEntityInstance[] =
              Array.isArray(response.data)
                ? response.data
                : response.data
                ? [response.data as TrackedEntityInstance]
                : [];
            const orgUnitIdsFromEnrollments = new Set(
              trackedEntityInstances.map(
                (tei: TrackedEntityInstance) => tei.latestEnrollment?.orgUnit
              )
            ) as Set<string>;

            const orgUnitsFromAttributes = new Set(
              trackedEntityInstances.flatMap(
                (tei: TrackedEntityInstance) =>
                  tei.attributes
                    ?.filter(
                      (attr: any) => attr.valueType === 'ORGANISATION_UNIT'
                    )
                    .map((attr: any) => attr.value) || []
              )
            );

            const uniqueOrgUnitIds = [
              ...orgUnitIdsFromEnrollments,
              ...orgUnitsFromAttributes,
            ].filter((id): id is string => Boolean(id));

            const fetchedOrgUnits =
              uniqueOrgUnitIds.length > 0
                ? await firstValueFrom(
                    this.lineListService.fetchOrgUnits(uniqueOrgUnitIds)
                  )
                : new Map<string, string>();

            const trackedEntityResponse: TrackedEntityInstancesResponse = {
              trackedEntityInstances: response.data!,
              pager: pager,
              orgUnitsMap: fetchedOrgUnits,
            };

            const { columns, data, filteredEntityColumns, orgUnitLabel } =
              getTrackedEntityTableData(
                { data: trackedEntityResponse },
                programIdState,
                pager,
                metaData,
                this.searcheableDataElements,
                this.customDisplayInReportsIds,
                this.columnNameSource,
                this.columnMetadataDisplayMode,
                this.orgUnitAndDateColumnsPosition
              );

            if (currentRequest !== requestSequence.current) return;
            setFilteredColumns((previous) => {
              if (filteredEntityColumns.length === 0) return previous;
              // Preserve stable metadata column references across pagination.
              const signature = (list: ColumnDefinition[] = []) =>
                JSON.stringify(
                  list.map((column) => [
                    column.key,
                    column.label,
                    column.valueType,
                  ])
                );
              return signature(previous) === signature(filteredEntityColumns)
                ? previous
                : filteredEntityColumns;
            });

            let updatedFilterableColumnIds: ColumnDefinition[];

            if (
              Array.isArray(this.filterableColumnIds) &&
              this.filterableColumnIds.length > 0
            ) {
              const filterableColumnIdsSet = new Set(this.filterableColumnIds);
              updatedFilterableColumnIds = columns.filter((column) =>
                filterableColumnIdsSet.has(column.key)
              );
            } else {
              updatedFilterableColumnIds = columns;
            }

            const finalColumns: ColumnDefinition[] = addActionsColumn(
              [{ label: '#', key: 'index' }, ...updatedFilterableColumnIds],
              this.actionOptions
            );

            const pagerResponse = response.pagination;

            if (currentRequest !== requestSequence.current) return;
            setColumns(finalColumns);
            setData(data);
            if (pagerResponse) {
              const next = new Pager(pagerResponse);
              setPager((previous) =>
                previous.page === next.page &&
                previous.pageSize === next.pageSize &&
                previous.total === next.total &&
                previous.pageCount === next.pageCount
                  ? previous
                  : next
              );
            }
            setOrgUnitLabel(orgUnitLabel);
          } catch (error) {
            console.error('Failed to fetch tracker data:', error);
            if (currentRequest === requestSequence.current)
              setError(getRequestErrorMessage(error, 'records'));
          } finally {
            if (currentRequest === requestSequence.current) setLoading(false);
          }
        };
        fetchTrackerData();
      }
    }, [
      metaData,
      programIdState,
      orgUnitState,
      appliedOrgUnitMode,
      programStageIdState,
      startDateState,
      endDateState,
      pager.page,
      pager.pageSize,
      dataQueryFiltersState,
      triggerRefetch,
      triggerTokenState,
    ]);

    // Exports use independent, metadata-complete projections of the same filters.
    const handleDownload = async (format: 'CSV' | 'XLSX') => {
      try {
        if (downloadInFlightRef.current) return;
        downloadInFlightRef.current = format;
        setDownloadLoading(format);
        setExportError(null);
        const { columns, data } = await fetchLineListDownloadRows({
          d2,
          metaData,
          programId: programIdState,
          programStageId: programStageIdState,
          orgUnit: orgUnitState,
          ouMode: appliedOrgUnitMode,
          startDate: startDateState,
          endDate: endDateState,
          dataQueryFilters: dataQueryFiltersState,
          enrollmentStatus: this.enrollmentStatus,
          eventStatus: this.eventStatus,
          columnNameSource: this.columnNameSource,
          resolveOrgUnitNames: (ids) =>
            firstValueFrom(this.lineListService.fetchOrgUnits(ids)),
        });

        // Use the selected organisation unit's name (not a record-level name)
        // so exports remain identifiable when results include descendants.
        let organisationUnitName: string;
        if (appliedOrgUnits.length) {
          const labels = appliedOrgUnits.map(
            (unit) => unit.displayName || unit.id
          );
          organisationUnitName =
            labels.length > 2
              ? `${labels.slice(0, 2).join('_')}_and_${labels.length - 2}_more`
              : labels.join('_');
        } else {
          const ids = orgUnitState.split(';').filter(Boolean);
          organisationUnitName = ids.join('_') || 'All_Organisation_Units';
          if (ids.length) {
            try {
              const names = await firstValueFrom(
                this.lineListService.fetchOrgUnits(ids)
              );
              organisationUnitName = ids
                .map((id) => names.get(id) || id)
                .join('_');
            } catch (lookupError) {
              // An optional name lookup must never prevent a valid export.
              console.warn(
                'Unable to resolve organisation unit name for export filename:',
                lookupError
              );
            }
          }
        }

        const metadata = metaData as
          | (Program & {
              displayName?: string;
              name?: string;
            })
          | null;
        const fileName = createLineListFileName({
          recordsLabel: recordsLabel?.trim() || 'Records',
          organisationUnitName,
          programName:
            metadata?.displayName || metadata?.name || programIdState,
          startDate: startDateState,
          endDate: endDateState,
        });

        if (format === 'CSV') {
          downloadLineListCsv(columns, data, fileName);
          return;
        }

        downloadLineListExcel(columns, data, fileName);
      } catch (error) {
        console.error('Failed to download line list data:', error);
        setExportError(getRequestErrorMessage(error, 'export records'));
      } finally {
        downloadInFlightRef.current = null;
        setDownloadLoading(null);
      }
    };

    // Commit only complete, validated values. DHIS2's filter grammar reserves
    // ':' and ',' and uses '/' as its escape character. URL encoding ALONE
    // is insufficient because DHIS2 splits the decoded filter expression.
    const handleApplyFilter = (
      key: string,
      value: string,
      type: string,
      valueType: string,
      hasOptions: boolean
    ) => {
      if (!isValidFilterValue(value, valueType ?? 'TEXT')) return;
      const condition =
        hasOptions ||
        ['DATE', 'DATETIME', 'TIME', 'INTEGER', 'NUMBER'].includes(valueType)
          ? DataFilterCondition.Equal
          : DataFilterCondition.Like;
      const filter = new DataQueryFilter()
        .setAttribute(key)
        .setCondition(condition)
        .setValue(
          escapeTrackerFilterValue(
            normalizeDateTimeFilterValue(value, valueType)
          )
        );
      if (type === 'dataElement') filter.setType('DATA_ELEMENT');
      const updated = [
        ...dataQueryFiltersState.filter((item) => item.attribute !== key),
        filter,
      ];
      if (JSON.stringify(dataQueryFiltersState) === JSON.stringify(updated))
        return;
      setDataQueryFiltersState(updated);
      setLoading(true);
      setPager((previous) =>
        previous.page === 1 ? previous : new Pager({ ...previous, page: 1 })
      );
    };

    const handleClearFilter = (key: string) => {
      if (dataQueryFiltersState.some((item) => item.attribute === key))
        setLoading(true);
      setDataQueryFiltersState((previous) => {
        if (!previous.some((item) => item.attribute === key)) return previous;
        return previous.filter((item) => item.attribute !== key);
      });
      setPager((previous) =>
        previous.page === 1 ? previous : new Pager({ ...previous, page: 1 })
      );
    };

    const handleEnrollmentDatesApply = (start?: string, end?: string) => {
      if (
        (start && !isValidFilterValue(start, 'DATE')) ||
        (end && !isValidFilterValue(end, 'DATE')) ||
        (start && end && start > end)
      )
        return;
      if (start !== startDateState || end !== endDateState) setLoading(true);
      setStartDateState((previous) => (previous === start ? previous : start));
      setEndDateState((previous) => (previous === end ? previous : end));
      setPager((previous) =>
        previous.page === 1 ? previous : new Pager({ ...previous, page: 1 })
      );
    };

    const handleOrgUnitFilter = () => {
      setAppliedOrgUnits([...selectedOrgUnits]);
      setAppliedOrgUnitMode(selectedOrgUnitMode);
      setPager((previous) => new Pager({ ...previous, page: 1 }));
    };
    const handleOrgUnitModeReset = () => {
      setAppliedOrgUnitMode(defaultOrgUnitMode);
      setSelectedOrgUnitMode(defaultOrgUnitMode);
      setPager((previous) => new Pager({ ...previous, page: 1 }));
    };

    const effectiveRecordsLabel = recordsLabel?.trim() || 'Records';
    const fetchingStatusText = metadataLoading
      ? `Preparing ${effectiveRecordsLabel.toLowerCase()}…`
      : `Fetching ${effectiveRecordsLabel.toLowerCase()}…`;

    return React.createElement(
      'div',
      { className: 'line-list-root' },
      React.createElement(
        'div',
        null,
        metadataLoading &&
          React.createElement(
            'div',
            { className: 'line-list-loading', role: 'status' },
            React.createElement(CircularLoader, { small: true }),
            'Loading metadata…'
          ),
        error &&
          React.createElement(
            'div',
            { className: 'line-list-notice', role: 'alert' },
            React.createElement(
              NoticeBox,
              { error: true, title: 'Unable to complete request' },
              error
            )
          ),
        exportError &&
          React.createElement(
            'div',
            { className: 'line-list-notice', role: 'alert' },
            React.createElement(
              NoticeBox,
              { error: true, title: 'Export failed' },
              exportError
            )
          ),
        this.showFilters &&
          React.createElement(FilterToolbar, {
            orgUnit: {
              allowMultipleOrgUnits: this.allowMultipleOrgUnits,
              appliedOrgUnits,
              setAppliedOrgUnits,
              selectedOrgUnits,
              setSelectedOrgUnits,
              customOrgUnitRoots: this.customOrgUnitRoots,
              orgUnitLabel,
              handleOrgUnitFilter,
              appliedOrgUnitMode,
              selectedOrgUnitMode,
              defaultOrgUnitMode,
              setSelectedOrgUnitMode,
              handleOrgUnitModeReset,
            },
            dates: {
              startDateState,
              setStartDateState,
              endDateState,
              setEndDateState,
              setTempStartDateState,
              setTempEndDateState,
              tempStartDateState,
              tempEndDateState,
              showEnrollmentDates: this.showEnrollmentDates,
              handleEnrollmentDatesApply,
            },
            filters: {
              visibleFilters,
              dateStates,
              inputValues,
              setInputValues,
              handleApplyFilter,
              handleClearFilter,
              showAllFilters,
              setShowAllFilters,

              setDateStates,
              prevInputValues,
              setPrevInputValues,

              prevDateStates,
              setPrevDateStates,
            },
          }),
        React.createElement(
          'div',
          {
            className: 'line-list-results',
            role: 'group',
            'aria-label': 'Line list summary and export actions',
          },
          React.createElement(
            'div',
            { className: 'line-list-results-summary', 'aria-live': 'polite' },
            React.createElement('strong', null, effectiveRecordsLabel),
            (loading || metadataLoading) &&
              React.createElement(
                'span',
                { className: 'line-list-fetch-status', role: 'status' },
                React.createElement(CircularLoader, { small: true }),
                React.createElement('span', null, fetchingStatusText)
              ),
            !loading &&
              !metadataLoading &&
              !error &&
              React.createElement(
                'span',
                null,
                '  ·  ',
                typeof pager.total === 'number' && Number.isFinite(pager.total)
                  ? pager.total.toLocaleString()
                  : '—',
                ' total'
              ),
            !loading &&
              !metadataLoading &&
              !error &&
              React.createElement(
                'span',
                null,
                '  ·  Page ',
                pager.page || 1,
                ' of ',
                Math.max(
                  1,
                  Math.ceil((pager.total || 0) / (pager.pageSize || 10)) ||
                    pager.pageCount ||
                    1
                )
              ),
            error &&
              !loading &&
              !metadataLoading &&
              React.createElement('span', null, ' · Results unavailable')
          ),
          React.createElement(
            'div',
            { className: 'line-list-results-actions' },
            showDownloadButton &&
              React.createElement(
                'div',
                {
                  className: 'line-list-download-toolbar',
                  role: 'group',
                  'aria-label': 'Download filtered results',
                },
                React.createElement(
                  Button,
                  {
                    disabled:
                      Boolean(downloadLoading) ||
                      loading ||
                      metadataLoading ||
                      !metaData ||
                      Boolean(error),
                    onClick: () => handleDownload('CSV'),
                    small: true,
                    secondary: true,
                  },
                  downloadLoading === 'CSV'
                    ? React.createElement(
                        'span',
                        {
                          className: 'line-list-export-progress',
                          role: 'status',
                        },
                        React.createElement(CircularLoader, { small: true }),
                        React.createElement('span', null, 'Exporting CSV…')
                      )
                    : 'Download CSV'
                ),
                React.createElement(
                  Button,
                  {
                    disabled:
                      Boolean(downloadLoading) ||
                      loading ||
                      metadataLoading ||
                      !metaData ||
                      Boolean(error),
                    onClick: () => handleDownload('XLSX'),
                    small: true,
                    secondary: true,
                  },
                  downloadLoading === 'XLSX'
                    ? React.createElement(
                        'span',
                        {
                          className: 'line-list-export-progress',
                          role: 'status',
                        },
                        React.createElement(CircularLoader, { small: true }),
                        React.createElement('span', null, 'Exporting Excel…')
                      )
                    : 'Download Excel'
                )
              )
          )
        ),
        React.createElement(
          'div',
          { className: 'line-list-table-scroll', 'aria-busy': loading },
          loading || metadataLoading
            ? React.createElement(
                'div',
                {
                  className: 'line-list-table-loading',
                  role: 'status',
                  'aria-live': 'polite',
                },
                React.createElement(CircularLoader, { small: false }),
                React.createElement(
                  'span',
                  null,
                  `Loading ${effectiveRecordsLabel.toLowerCase()}…`
                )
              )
            : error
            ? React.createElement(
                'div',
                { className: 'line-list-table-error' },
                'Results are unavailable. Adjust the filters or try again.'
              )
            : React.createElement(LineListTable, {
                columns: columns,
                data: data,
                pager: pager,
                setPager: setPager,
                getTextColorFromBackGround: getTextColorFromBackGround,
                actionOptions: this.actionOptions,
                rowActionFilterConfig: this.lineListRowActionFilterConfig,
                actionOptionOrientation: this.actionOptionOrientation,
                actionSelected: this.actionSelected,
                selectable: selectable,
                rowsSelected: this.rowsSelected,
                showActionButtons: showActionButtons,
                error: null,
              })
        )
      )
    );
  };

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    this.component = this.LineList;
    this.render();
  }
}
