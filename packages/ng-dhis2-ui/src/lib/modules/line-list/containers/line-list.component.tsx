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
  Button,
  ButtonStrip,
  CalendarInput,
  CircularLoader,
  DataTable,
  DataTableCell,
  DataTableColumnHeader,
  DataTableRow,
  DataTableToolbar,
  InputField,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
  Pagination,
  TableBody,
  TableFoot,
  TableHead,
} from '@dhis2/ui';
import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { take } from 'rxjs';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { DropdownMenu, DropdownMenuOption } from '../components/dropdown-menu';
import { DataTableActions } from '../components/data-table-actions';
import { OrgUnitFormField } from '../components/org-unit-form-field.component';
import { AttributeFilter } from '../models/attribute-filter.model';
import { FilterConfig } from '../models/filter-config.model';
import {
  ColumnDefinition,
  EventsResponse,
  LineListResponse,
  Pager,
  TableRow,
  TrackedEntityResponse,
} from '../models/line-list.models';
import { LineListService } from '../services/line-list.service';
import {
  addActionsColumn,
  getEventData,
  getProgramStageData,
  getTrackedEntityData,
} from '../utils/line-list-utils';
import { ActionOptionOrientation } from '../models';
import { SingleSelectField } from '@dhis2/ui';
import { SingleSelectOption } from '@dhis2/ui';
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
  @Input() actionOptions?: DropdownMenuOption[];
  @Input() actionOptionOrientation: ActionOptionOrientation = 'DROPDOWN';
  @Input() attributeFilters?: AttributeFilter[];
  @Input() useOuModeWithOlderDHIS2Instance?: boolean;
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() filters?: FilterConfig[];
  @Input() ouMode?: string;
  @Input() dispatchTeis = false;
  @Output() actionSelected = new EventEmitter<{
    action: string;
    row: TableRow;
  }>();
  private reactStateUpdaters: any = null;
  @Output() approvalSelected = new EventEmitter<
    { teiId: string; enrollmentId: string }[]
  >();
  @Input() isButtonLoading = false;
  @Input() buttonLabel = '';
  @Output() firstValue = new EventEmitter<string>();
  @Input() buttonFilter!: string;
  @Input() filterRootOrgUnit = false;
  @Input() showFilters = false;
  @Input() isOptionSetNameVisible = false;

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
    const [isOptionSetNameVisibleState, setOptionSetNameVisible] =
      useState<boolean>(this.isOptionSetNameVisible);
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
    const [orgUnitLabel, setOrgUnitLabel] = useState<string>('');

    //TODO: this will be migrated on the parent component
    const [checkValue, setCheckValue] = useState<string[]>([]);
    const [valueMatch, setValuesMatch] = useState<boolean>(false);
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>('');
    const [hide, setHide] = useState<boolean>(true);
    const [showAllFilters, setShowAllFilters] = useState(false);
    const visibleFilters = showAllFilters
      ? filteredColumns ?? []
      : (filteredColumns ?? []).slice(0, 2);
    const defaultOrgUnit = this.orgUnit;
    const [prevValue, setPrevValue] = useState<string>();
    const [dateStates, setDateStates] = useState<{ [key: string]: string }>({});

    // Store updaters in refs for Angular to access
    const updateRefs = useRef({
      setProgramIdState,
      setOrgUnitState,
      setProgramStageIdState,
      setAttributeFiltersState,
      setStartDateState,
      setEndDateState,
      setIsButtonLoading,
      setOptionSetNameVisible,
    });

    useEffect(() => {
      this.setReactStateUpdaters?.(updateRefs.current);
    }, []);

    useEffect(() => {
      setLoading(true);

      const subscription = this.lineListService
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
          this.filterRootOrgUnit,
          this.useOuModeWithOlderDHIS2Instance,
          this.filters
        )
        .pipe(take(1)) // Automatically unsubscribe after the first emission
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
              pager,
              this.isOptionSetNameVisible
            );
            entityColumns = columns;
            entityData = data;
          } else if (
            'trackedEntities' in response.data ||
            'instances' in response.data
          ) {
            const responseData: any = response.data as TrackedEntityResponse;

            responsePager = responseData.pager || {
              page: responseData.page,
              pageSize: responseData.pageSize,
              total: responseData.total,
              pageCount: responseData.pageCount,
            };

            const { columns, data, filteredEntityColumns, orgUnitLabel } =
              getTrackedEntityData(
                response,
                this.programId,
                pager,
                this.isOptionSetNameVisible,
                this.filters
              );
            entityColumns = columns;
            entityData = data;
            setOrgUnitLabel(orgUnitLabel);

            const checkValues = [
              ...new Set(
                responseData?.trackedEntities?.[0]?.enrollments?.[0]?.events?.flatMap(
                  (event: any) =>
                    event.dataValues
                      .filter((dataValue: any) =>
                        /^[A-Za-z]{3}$/.test(dataValue.value)
                      )
                      .map((dataValue: any) => dataValue.value)
                ) ??
                  responseData?.instances?.[0]?.enrollments?.[0]?.events?.flatMap(
                    (event: any) =>
                      event.dataValues
                        .filter((dataValue: any) =>
                          /^[A-Za-z]{3}$/.test(dataValue.value)
                        )
                        .map((dataValue: any) => dataValue.value)
                  )
              ),
            ];

            if (checkValues.length > 0) {
              setCheckValue(checkValues as any);
              setValuesMatch(!checkValues.includes(this.buttonFilter));
            }

            setFilteredColumns((prev) =>
              filteredEntityColumns.length > 0 ? filteredEntityColumns : prev
            );
            filteredDataColumns = filteredEntityColumns;
          } else {
            responsePager = (response.data as EventsResponse).pager;
            const { columns, data } = getEventData(
              response,
              pager,
              this.isOptionSetNameVisible
            );
            entityColumns = columns;
            entityData = data;
          }

          const finalColumns: ColumnDefinition[] = addActionsColumn(
            [{ label: '#', key: 'index' }, ...entityColumns],
            this.actionOptions
          );

          setLoading(false);
          setColumns(finalColumns);
          setData(entityData);
          setPager(responsePager);
        });

      return () => {
        subscription.unsubscribe(); // Ensure cleanup on unmount
      };
    }, [
      programIdState,
      orgUnitState,
      programStageIdState,
      attributeFiltersState,
      startDateState,
      endDateState,
      pager.page,
      pager.pageSize,
      isOptionSetNameVisibleState,
    ]);

    const handleApprovalClick = () => {
      setIsButtonLoading(true);

      const subscription = this.lineListService
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
        .pipe(take(1))
        .subscribe((response: LineListResponse) => {
          if (
            'trackedEntities' in response.data ||
            'instances' in response.data
          ) {
            const trackedEntityInstances = (
              response.data as TrackedEntityResponse
            ).trackedEntities;

            // Map TEIs to objects with teiId and enrollmentId
            const teiEnrollmentList = trackedEntityInstances
              .map((tei) => {
                const matchingEnrollment = tei.enrollments?.find(
                  (enrollment) => enrollment.program === this.programId
                );

                return matchingEnrollment
                  ? {
                      teiId: tei.trackedEntity,
                      enrollmentId: matchingEnrollment.enrollment,
                    }
                  : null;
              })
              .filter(Boolean);

            this.approvalSelected.emit(teiEnrollmentList as any);
          } else {
            this.approvalSelected.emit([]);
          }

          setIsButtonLoading(false);
        });

      return () => {
        subscription.unsubscribe();
      };
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

    const handleDateSelect = (key: string, selectedDate: any) => {
      const selectedDateString = selectedDate?.calendarDateString ?? ''; // Default to empty string if null

      // Update dateStates
      setDateStates((prevDateStates) => ({
        ...prevDateStates,
        [key]: selectedDateString, // Will set it to empty if date is cleared
      }));

      // Update attributeFiltersState to remove filter if date is cleared
      setAttributeFiltersState((prevFilters = []) => {
        // Remove old filter for this key if the date is empty
        const filteredFilters = prevFilters.filter((f) => f.attribute !== key);

        // Only add a filter if the date is not empty
        const updatedFilters = selectedDateString.trim()
          ? [
              ...filteredFilters,
              { attribute: key, operator: 'like', value: selectedDateString },
            ]
          : filteredFilters; // If empty, just keep the filteredFilters as they are

        return updatedFilters;
      });
    };

    return (
      <div>
        <div>
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
                  key={selectedOrgUnit}
                  onSelectOrgUnit={(selectedOrgUnit: any) => {
                    setSelectedOrgUnit(selectedOrgUnit.displayName);
                    setOrgUnitState(selectedOrgUnit.id);
                    setHide(true);
                  }}
                />
              </ModalContent>

              <ModalActions>
                <ButtonStrip end>
                  <Button onClick={() => setHide(true)} secondary>
                    Close
                  </Button>
                </ButtonStrip>
              </ModalActions>
            </Modal>
            {this.showFilters && (
              <DataTableToolbar className="table-top-toolbar">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* <InputField
                    key="location"
                    label="Registraring unit:"
                    value={selectedOrgUnit}
                    clearable
                    onFocus={() => setHide(false)}
                    className="custom-input"
                    onChange={(event: { value: React.SetStateAction<string>; }) => setSelectedOrgUnit(event.value)}
                  /> */}
                  <InputField
                    key="location"
                    //label={orgUnitLabel}
                    label={orgUnitLabel ? orgUnitLabel : 'registering unit'}
                    value={selectedOrgUnit}
                    clearable
                    onFocus={() => setHide(false)}
                    className="custom-input"
                    onChange={(event: {
                      value: React.SetStateAction<string>;
                    }) => {
                      setSelectedOrgUnit(event.value);
                      setOrgUnitState(defaultOrgUnit);
                    }}
                  />
                  <CalendarInput
                    label="Start date:"
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
                    label="End date:"
                    calendar="gregory"
                    locale="en-GB"
                    timeZone="Africa/Dar_es_Salaam"
                    className="custom-input"
                    date={endDateState}
                    onDateSelect={(selectedDate: any) => {
                      setEndDateState(selectedDate.calendarDateString);
                    }}
                  />
                  {/* {(visibleFilters ?? []).map(
                    ({ label, key, valueType, options }) =>
                      valueType === 'DATE' ? (
                        <CalendarInput
                          key={key}
                          label={`${label}:`}
                          calendar="gregory"
                          locale="en-GB"
                          timeZone="Africa/Dar_es_Salaam"
                          className="custom-input"
                          date={dateStates[key] || ''} // Use the specific date for this field
                          onDateSelect={(selectedDate: any) =>
                            handleDateSelect(key, selectedDate)
                          } 
                        />
                      ) : (
                        <InputField
                          key={key}
                          label={`${label}:`}
                          className="custom-input"
                          value={inputValues[key] || ''}
                          clearable
                          onChange={(
                            e:
                              | React.ChangeEvent<HTMLInputElement>
                              | { value?: string }
                          ) => {
                            let currentValue = '';

                            if ('target' in e && e.target) {
                              currentValue = (
                                e as React.ChangeEvent<HTMLInputElement>
                              ).target.value;
                            } else if ('value' in e) {
                              currentValue = e.value ?? '';
                            }

                            setInputValues((prevValues) => ({
                              ...prevValues,
                              [key]: currentValue,
                            }));

                            // Trigger change immediately if the input is cleared
                            if (currentValue === '') {
                              handleInputChange(key, '');
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
                            if (
                              currentValue !== '' &&
                              currentValue !== prevValue
                            ) {
                              handleInputChange(key, currentValue);
                              setPrevValue(currentValue);
                            }
                          }}
                        />
                      )
                  )} */}
                  {(visibleFilters ?? []).map(
                    ({ label, key, valueType, options }) => {
                      // Render CalendarInput for DATE fields
                      if (valueType === 'DATE') {
                        return (
                          <CalendarInput
                            key={key}
                            label={`${label}:`}
                            calendar="gregory"
                            locale="en-GB"
                            timeZone="Africa/Dar_es_Salaam"
                            className="custom-input"
                            date={dateStates[key] || ''}
                            onDateSelect={(selectedDate: any) =>
                              handleDateSelect(key, selectedDate)
                            }
                          />
                        );
                      }

                      // Render SingleSelectField if options exist
                      if (options && options.options.length > 0) {
                        return (
                          <SingleSelectField
                            key={key}
                            label={`${label}:`}
                            selected={inputValues[key] || ''}
                            className="custom-select-input" 
                            clearable
                            onChange={({ selected }: { selected: string }) => {
                              setInputValues((prevValues) => ({
                                ...prevValues,
                                [key]: selected ?? '',
                              }));

                              handleInputChange(key, selected ?? '');
                            }}
                            // onClear={() => {
                            //   setInputValues((prevValues) => ({
                            //     ...prevValues,
                            //     [key]: '',
                            //   }));
                            //   handleInputChange(key, '');
                            // }}
                          >
                            {(options.options ?? []).map((opt: any) => (
                              <SingleSelectOption
                                key={opt.id}
                                label={opt.name}
                                value={opt.code} 
                              />
                            ))}
                          </SingleSelectField>
                        );
                      }

                      // Fallback: default InputField
                      return (
                        <InputField
                          key={key}
                          label={`${label}:`}
                          className="custom-input"
                          value={inputValues[key] || ''}
                          clearable
                          onChange={(
                            e:
                              | React.ChangeEvent<HTMLInputElement>
                              | { value?: string }
                          ) => {
                            let currentValue = '';

                            if ('target' in e && e.target) {
                              currentValue = (
                                e as React.ChangeEvent<HTMLInputElement>
                              ).target.value;
                            } else if ('value' in e) {
                              currentValue = e.value ?? '';
                            }

                            setInputValues((prevValues) => ({
                              ...prevValues,
                              [key]: currentValue,
                            }));

                            if (currentValue === '') {
                              handleInputChange(key, '');
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

                            if (
                              currentValue !== '' &&
                              currentValue !== prevValue
                            ) {
                              handleInputChange(key, currentValue);
                              setPrevValue(currentValue);
                            }
                          }}
                        />
                      );
                    }
                  )}

                  {/* {(visibleFilters ?? []).map(({ label, key, valueType, options }) => (
                   
                    <InputField
                      key={key}
                      label={`${label}:`}
                      className="custom-input"
                      value={inputValues[key] || ''}
                      clearable
                      onChange={(
                        e:
                          | React.ChangeEvent<HTMLInputElement>
                          | { value?: string }
                      ) => {
                        let currentValue = '';

                        if ('target' in e && e.target) {
                          currentValue = (
                            e as React.ChangeEvent<HTMLInputElement>
                          ).target.value;
                        } else if ('value' in e) {
                          currentValue = e.value ?? '';
                        }

                        setInputValues((prevValues) => ({
                          ...prevValues,
                          [key]: currentValue,
                        }));

                        // Trigger change immediately if the input is cleared
                        if (currentValue === '') {
                          handleInputChange(key, '');
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
                        if (currentValue !== '' && currentValue !== prevValue) {
                          handleInputChange(key, currentValue);
                          setPrevValue(currentValue);
                        }
                      }}
                    />
                  ))} */}
                  <Button onClick={() => setShowAllFilters(!showAllFilters)}>
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
                          {
                            col.key === 'actions'
                              ? this.actionOptions && (
                                  <DataTableActions
                                    actionOptions={this.actionOptions}
                                    actionOptionOrientation={
                                      this.actionOptionOrientation
                                    }
                                    onClick={(option) => {
                                      this.actionSelected.emit({
                                        action: option.label,
                                        row,
                                      });
                                    }}
                                  />
                                )
                              : row[col.key] || '--' // Display '--' if value is undefined or null
                          }
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
