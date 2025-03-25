// src/app/line-list-table.component.ts
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  CircularLoader,
  DataTable,
  DataTableCell,
  DataTableColumnHeader,
  DataTableRow,
  Pagination,
  TableBody,
  TableFoot,
  TableHead,
  Button,
  InputField,
  IconFilter16,
  DataTableToolbar,
  CalendarInput,
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  ButtonStrip,
} from '@dhis2/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';
import { AttributeFilter } from '../models/attribute-filter.model';
import { FilterConfig } from '../models/filter-config.model';
import {
  ColumnDefinition,
  EventsResponse,
  LineListResponse,
  Pager,
  TableRow,
  TrackedEntityInstancesResponse,
  TrackedEntityResponse,
} from '../models/line-list.models';
import { LineListService } from '../services/line-list.service';
import {
  addActionsColumn,
  getEventData,
  getProgramStageData,
  getTrackedEntityData,
} from '../utils/line-list-utils';
import debounce from 'lodash/debounce';
import { OrgUnitFormField } from '../components/org-unit-form-field.component';
@Component({
  selector: 'app-line-list',
  template: '<ng-content></ng-content>',
  styleUrls: ['./line-list.component.scss'],
  standalone: false,
})
export class LineListTableComponent extends ReactWrapperModule {
  @Input() programId!: string;
  @Input() orgUnit!: string;
  @Input() programStageId?: string;
  @Input() actionOptions?: DropdownMenuOption[];
  @Input() attributeFilters?: AttributeFilter[];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() filters?: FilterConfig[];
  @Input() ouMode?: string;
  @Input() dispatchTeis: boolean = false;
  @Output() actionSelected = new EventEmitter<{
    action: string;
    row: TableRow;
  }>();
  private reactStateUpdaters: any = null;
  @Output() approvalSelected = new EventEmitter<
    { teiId: string; enrollmentId: string }[]
  >();
  @Input() isButtonLoading: boolean = false;
  @Input() buttonLabel: string = '';
  @Output() firstValue = new EventEmitter<string>();
  @Input() buttonFilter!: string;
  @Input() filterRootOrgUnit: boolean = false;
  @Input() showFilters: boolean = false;

  setReactStateUpdaters = (updaters: any) => {
    this.reactStateUpdaters = updaters;
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.reactStateUpdaters) {
      if (changes['programId']) {
        this.reactStateUpdaters.setProgramIdState(this.programId);
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
    }
  }

  lineListService = inject(LineListService);

  LineList = () => {
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [data, setData] = useState<TableRow[]>([]);
    const [pager, setPager] = useState<Pager>({
      page: 1,
      pageSize: 10,
      total: 0,
      pageCount: 1,
    });
    const paginationRef = useRef<HTMLDivElement>(null);
    const [programIdState, setProgramIdState] = useState<string>(
      this.programId
    );
    const [orgUnitState, setOrgUnitState] = useState<string>(this.orgUnit);
    const [programStageIdState, setProgramStageIdState] = useState<
      string | undefined
    >(this.programStageId);
    const [attributeFiltersState, setAttributeFiltersState] = useState<
      AttributeFilter[] | undefined
    >(this.attributeFilters);
    const [startDateState, setStartDateState] = useState<string | undefined>(
      this.startDate
    );
    const [endDateState, setEndDateState] = useState<string | undefined>(
      this.endDate
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(
      this.isButtonLoading
    );
    const [filteredColumns, setFilteredColumns] =
      useState<ColumnDefinition[]>();
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [filters, setFilters] = useState<boolean>(false);

    //TODO: this will be migrated on the parent component
    const [checkValue, setCheckValue] = useState<string[]>([]);
    const [valueMatch, setValuesMatch] = useState<boolean>(false);
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>(''); // for testing purposes to be removed
    const [hide, setHide] = useState<boolean>(true);
    const [showAllFilters, setShowAllFilters] = useState(false);
    const visibleFilters = showAllFilters
      ? filteredColumns ?? []
      : (filteredColumns ?? []).slice(0, 2);

    // Store updaters in refs for Angular to access
    const updateRefs = useRef({
      setProgramIdState,
      setOrgUnitState,
      setProgramStageIdState,
      setAttributeFiltersState,
      setStartDateState,
      setEndDateState,
      setIsButtonLoading,
    });

    useEffect(() => {
      this.setReactStateUpdaters?.(updateRefs.current);
    }, []);

    useEffect(() => {
      if (!loading) {
        setTimeout(() => {
          const paginationContainer = document.querySelector(
            '[data-test="dhis2-uiwidgets-pagination"]'
          ) as HTMLElement;

          if (paginationContainer) {
            paginationContainer.style.display = 'flex';
            paginationContainer.style.flexDirection = 'row';
            paginationContainer.style.justifyContent = 'space-between';
            paginationContainer.style.alignItems = 'center';
          }
        }, 500); // Short delay to ensure styles apply after data renders
      }
    }, [loading]);

    useEffect(() => {
      setLoading(true);
      this.lineListService
        .getLineListData(
          this.programId,
          orgUnitState,
          this.programStageId,
          pager.page,
          pager.pageSize,
          attributeFiltersState,
          startDateState,
          endDateState,
          this.ouMode,
          this.filterRootOrgUnit
        )
        .subscribe((response: LineListResponse) => {
          let entityColumns: ColumnDefinition[] = [];
          let responsePager: Pager;
          let entityData: TableRow[] = [];
          let filteredDataColumns: ColumnDefinition[] = [];

          if (this.programStageId) {
            responsePager = (response.data as EventsResponse).pager;
            const { columns, data } = getProgramStageData(
              response,
              this.programStageId,
              pager
            );
            entityColumns = columns;
            entityData = data;
          } else if ('trackedEntities' in response.data) {
            responsePager = (response.data as TrackedEntityResponse).pager;

            const { columns, data, filteredEntityColumns } =
              getTrackedEntityData(
                response,
                this.programId,
                pager,
                this.filters
              );
            entityColumns = columns;
            entityData = data;
            //TODO: Should be done on the parent
            let checkValues = [
              ...new Set(
                (
                  response.data as TrackedEntityResponse
                )?.trackedEntities?.[0]?.enrollments?.[0]?.events?.flatMap(
                  (event) =>
                    event.dataValues
                      .filter((dataValue) =>
                        /^[A-Za-z]{3}$/.test(dataValue.value)
                      )
                      .map((dataValue) => dataValue.value)
                )
              ),
            ];

            if (checkValues) {
              // this.firstValue.emit(firstTei);
              setCheckValue(checkValues);
              setValuesMatch(!checkValues.includes(this.buttonFilter));
            }
            //  setFilteredColumns(filteredEntityColumns);
            // Ensure filter inputs do not disappear when no data is returned
            // If filteredEntityColumns is empty, keep the previous columns instead of clearing them
            setFilteredColumns((prev) =>
              filteredEntityColumns.length > 0 ? filteredEntityColumns : prev
            );
            filteredDataColumns = filteredEntityColumns;
          } else {
            responsePager = (response.data as EventsResponse).pager;
            const { columns, data } = getEventData(response, pager);
            entityColumns = columns;
            entityData = data;
          }

          const finalColumns: ColumnDefinition[] = addActionsColumn(
            [{ label: '#', key: 'index' }, ...entityColumns],
            this.actionOptions
          );

          setLoading(false);
          setColumns(...[finalColumns]);
          setData(...[entityData]);
          setPager(...[responsePager]);
        });
    }, [
      programIdState,
      orgUnitState,
      programStageIdState,
      attributeFiltersState,
      startDateState,
      endDateState,
      pager.page,
      pager.pageSize,
    ]);

    const getDropdownOptions = (row: TableRow): DropdownMenuOption[] => {
      return (this.actionOptions || []).map((option) => ({
        ...option,
        onClick: () => {
          option.onClick?.(row);
          this.actionSelected.emit({ action: option.label, row });
        },
      }));
    };

    const handleApprovalClick = () => {
      setIsButtonLoading(true);
      this.lineListService
        .getLineListData(
          this.programId,
          this.orgUnit,
          this.programStageId,
          pager.page,
          1000,
          this.attributeFilters,
          this.startDate,
          this.endDate,
          this.ouMode
        )
        .subscribe((response: LineListResponse) => {
          if ('trackedEntities' in response.data) {
            const trackedEntityInstances = (
              response.data as TrackedEntityResponse
            ).trackedEntities;

            // Map TEIs to objects with teiId and enrollmentId
            const teiEnrollmentList = trackedEntityInstances
              .map((tei) => {
                // Find the enrollment where program matches this.programId
                const matchingEnrollment = tei.enrollments?.find(
                  (enrollment) => enrollment.program === this.programId
                );

                // Return object with teiId and enrollmentId (if found)
                return matchingEnrollment
                  ? {
                      teiId: tei.trackedEntity,
                      enrollmentId: matchingEnrollment.enrollment,
                    }
                  : null;
              })
              .filter((item) => item !== null); // Remove null entries (no matching enrollment)

            this.approvalSelected.emit(teiEnrollmentList);
          } else {
            this.approvalSelected.emit([]); // Emit empty array if no TEIs
          }
        });
    };

    const handleInputChange = (key: string, value: string) => {
      setInputValues((prevValues) => ({
        ...prevValues,
        [key]: value ?? '',
      }));

      setAttributeFiltersState((prevFilters = []) => {
        // Remove old filter for this key
        const filteredFilters = prevFilters.filter((f) => f.attribute !== key);

        // Only add new filter if value is not empty
        const updatedFilters = value.trim()
          ? [...filteredFilters, { attribute: key, operator: 'like', value }]
          : filteredFilters;

        return updatedFilters;
      });
    };

    return (
      <div>
        <div
        // style={{
        //   width: '100%',
        //   display: 'flex',
        //   justifyContent: 'flex-end',
        //   alignItems: 'center',
        //   gap: 8,
        //   padding: 8,
        //   marginBottom: 16,
        // }}
        >
          {valueMatch &&
            this.dispatchTeis &&
            (isButtonLoading ? (
              <CircularLoader small />
            ) : (
              //TODO: this implementation should be done where the library will be consumed
              <Button
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={handleApprovalClick}
                primary
              >
                {this.buttonLabel}
              </Button>
            ))}
        </div>

        {/* {filters && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              paddingBottom: '16px',
            }}
          >
            
          </div>
        )} */}

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
          // <div>
          //   <div/>
          <div>
            <Modal hide={hide}>
              <ModalTitle>Select organization unit</ModalTitle>

              <ModalContent>
                <OrgUnitFormField
                  //  label="Select organization unit"
                  key={selectedOrgUnit}
                  onSelectOrgUnit={(selectedOrgUnit: any) => {
                    // console.log(
                    //   'this is the selected org unit key',
                    //   selectedOrgUnit
                    // );
                    setSelectedOrgUnit(selectedOrgUnit.displayName);
                    setOrgUnitState(selectedOrgUnit.id);
                    setHide(true);
                  }}
                />
              </ModalContent>

              <ModalActions>
                <ButtonStrip end>
                  {/* <Button onClick={() => setHide(false)} secondary>
                Close modal
            </Button> */}

                  <Button onClick={() => setHide(true)} secondary>
                    Close
                  </Button>
                </ButtonStrip>
              </ModalActions>
            </Modal>
            {this.showFilters && (
              <DataTableToolbar
                style={{
                  backgroundColor: 'var(--colors-grey100)',
                  color: 'var(--colors-grey900)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <InputField
                    key="location"
                    label="Location:"
                    value={selectedOrgUnit}
                    onFocus={() => setHide(false)}
                    className="custom-input"
                  />
                  <CalendarInput
                    label="Start Date:"
                    calendar="gregory"
                    locale="en-GB"
                    timeZone="Africa/Dar_es_Salaam"
                    className="custom-input"
                    date={startDateState}
                    onDateSelect={(selectedDate: any) => {
                      setStartDateState(selectedDate.calendarDateString);
                    }}
                  />
                  <CalendarInput
                    label="End Date:"
                    calendar="gregory"
                    locale="en-GB"
                    timeZone="Africa/Dar_es_Salaam"
                    className="custom-input"
                    date={endDateState}
                    onDateSelect={(selectedDate: any) => {
                      setEndDateState(selectedDate.calendarDateString);
                    }}
                  />
                  {(visibleFilters ?? []).map(({ label, key }) => (
                    <InputField
                      key={key}
                      label={`${label}:`}
                      className="custom-input"
                      value={inputValues[key] || ''}
                      onChange={(
                        e:
                          | React.ChangeEvent<HTMLInputElement>
                          | { value?: string }
                      ) => {
                        if ('target' in e && e.target) {
                          setInputValues((prevValues) => ({
                            ...prevValues,
                            [key]: (e as React.ChangeEvent<HTMLInputElement>)
                              .target.value,
                          }));
                        } else if ('value' in e) {
                          setInputValues((prevValues) => ({
                            ...prevValues,
                            [key]: e.value ?? '',
                          }));
                        }
                      }}
                      onBlur={(
                        e:
                          | React.ChangeEvent<HTMLInputElement>
                          | { value?: string }
                      ) => {
                        let currentValue = '';

                        if ('target' in e && e.target) {
                          currentValue = e.target.value;
                        } else if ('value' in e) {
                          currentValue = e.value ?? '';
                        }

                        handleInputChange(key, currentValue);
                      }}
                    />
                  ))}
                  <Button
                    onClick={() => setShowAllFilters(!showAllFilters)}
                    className="custom-button"
                    secondary
                  >
                    {showAllFilters ? 'Less Filters' : 'More Filters'}
                  </Button>
                </div>
              </DataTableToolbar>
            )}

            <DataTable>
              <TableHead>
                <DataTableRow>
                  {columns.map((col) => (
                    <DataTableColumnHeader key={col.key}>
                      {col.label}
                    </DataTableColumnHeader>
                  ))}
                </DataTableRow>
              </TableHead>

              <TableBody>
                {data.length > 0 ? (
                  data.map((row) => (
                    <DataTableRow key={row.index}>
                      {columns.map((col) => (
                        <DataTableCell key={col.key}>
                          {col.key === 'actions' ? (
                            <DropdownMenu
                              dropdownOptions={getDropdownOptions(row)}
                              onClick={(option) => option.onClick?.()}
                            />
                          ) : (
                            row[col.key] || '--' // Display '--' if value is undefined or null
                          )}
                        </DataTableCell>
                      ))}
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableRow>
                    <DataTableCell
                      colSpan={columns.length?.toString()}
                      style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: 'grey',
                        padding: '20px',
                      }}
                    >
                      No data found
                    </DataTableCell>
                  </DataTableRow>
                )}
              </TableBody>

              <TableFoot>
                <DataTableRow>
                  {/* <DataTableCell colSpan={columns.length}> */}
                  <DataTableCell colSpan={columns.length.toString()}>
                    <div>
                      <Pagination
                        page={pager.page}
                        pageCount={pager.pageCount}
                        pageSize={pager.pageSize}
                        total={pager.total}
                        onPageChange={(page: number) =>
                          setPager((prev) => ({ ...prev, page }))
                        }
                        onPageSizeChange={(pageSize: number) => {
                          const newPageSize = Number(pageSize);
                          setPager((prev) => ({
                            ...prev,
                            page: 1,
                            pageSize: newPageSize,
                          }));
                        }}
                        pageSizes={['10', '20', '50', '100', '500']}
                      />
                    </div>
                  </DataTableCell>
                </DataTableRow>
              </TableFoot>
            </DataTable>
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
