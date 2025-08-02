import {
  Button,
  CalendarInput,
  DataTableToolbar,
  InputField,
  SingleSelectField,
  SingleSelectOption,
  DropdownButton,
  ButtonStrip,
  FlyoutMenu,
} from '@dhis2/ui';
import React, { useState } from 'react';
import { parseISO, format, isValid } from 'date-fns';

export const FilterToolbar = ({
  orgUnitLabel,
  selectedOrgUnit,
  setSelectedOrgUnit,
  setOrgUnitState,
  defaultOrgUnit,
  setHide,
  startDateState,
  setStartDateState,
  endDateState,
  setEndDateState,
  visibleFilters,
  dateStates,
  inputValues,
  setInputValues,
  handleInputChange,
  handleInputChangeForSelectField,
  handleDateSelect,
  showAllFilters,
  setShowAllFilters,
  setTempStartDateState,
  setTempEndDateState,
  setTempOrgUnitState,
  tempStartDateState,
  tempEndDateState,
  tempOrgUnitState,
  dataQueryFiltersState,
  setDataQueryFiltersState,
  SetOrgUnitModalVisible,
  showEnrollmentDates,
  handleAdditionalFilters,
  handleStartDateFilter,
  handleEndDateFilter,
  handleOrgUnitFilter,
  setDateStates,
  prevInputValues,
  setPrevInputValues,
  setTempDataQueryFiltersState,
  prevDateStates,
  setPrevDateStates,
  prevSelectedOrgUnit,
  setPrevSelectedOrgUnit,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenOrgUnitDropdown, setIsOpenOrgUnitDropdown] = useState(false);
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  type ClearIconProps = {
    className?: string;
    [key: string]: any;
  };

  //TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION
  const ClearIcon = ({ className, ...props }: ClearIconProps) => (
    <svg
      className={className}
      {...props}
      viewBox="0 0 24 24"
      width={16}
      height={16}
    >
      <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
    </svg>
  );
  return (
    <DataTableToolbar className="table-top-toolbar">
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {/* default filters */}
        {/* TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <DropdownButton
            name="customDropdown"
            open={isOpenOrgUnitDropdown}
            onClick={() => setIsOpenOrgUnitDropdown(!isOpenOrgUnitDropdown)}
            component={
              <div>
                <FlyoutMenu>
                  <div style={{ padding: '16px' }}>
                    <InputField
                      key="location"
                      placeholder={
                        orgUnitLabel ? orgUnitLabel : 'Registering unit'
                      }
                      value={selectedOrgUnit}
                      onFocus={() => {
                        SetOrgUnitModalVisible(true);
                        setHide(false);
                      }}
                    />
                    <div
                      style={{
                        paddingTop: '8px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <ButtonStrip>
                        <Button
                          primary
                          disabled={!selectedOrgUnit}
                          onClick={() => {
                            setPrevSelectedOrgUnit(selectedOrgUnit);
                            handleOrgUnitFilter();
                            setIsOpenOrgUnitDropdown(false);
                          }}
                        >
                          Update
                        </Button>
                        <Button
                          disabled={!selectedOrgUnit}
                          onClick={() => {
                            setSelectedOrgUnit('');
                            setPrevSelectedOrgUnit('');
                            setOrgUnitState(defaultOrgUnit);
                            setTempOrgUnitState(defaultOrgUnit);
                            setIsOpenOrgUnitDropdown(false);
                          }}
                        >
                          Reset
                        </Button>
                      </ButtonStrip>
                    </div>
                  </div>
                </FlyoutMenu>
              </div>
            }
          >
            {orgUnitLabel ? orgUnitLabel : 'Registering unit'}{' '}
            {prevSelectedOrgUnit && ':'} {prevSelectedOrgUnit}
            {prevSelectedOrgUnit && (
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedOrgUnit('');
                  setPrevSelectedOrgUnit('');
                  setOrgUnitState(defaultOrgUnit);
                  setTempOrgUnitState(defaultOrgUnit);
                  setIsOpenOrgUnitDropdown(false);
                }}
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <ClearIcon className="my-icon-class" />
              </span>
            )}
          </DropdownButton>
          {showEnrollmentDates && (
            <>
              <DropdownButton
                name="customDropdown"
                open={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                component={
                  <div>
                    <FlyoutMenu>
                      <div style={{ padding: '16px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '16px',
                          }}
                        >
                          <CalendarInput
                            calendar="gregory"
                            locale="en-GB"
                            timeZone="Africa/Dar_es_Salaam"
                            date={formatDateForDisplay(tempStartDateState)}
                            onDateSelect={(selectedDate: any) => {
                              setTempStartDateState(
                                selectedDate.calendarDateString
                              );
                            }}
                          />
                          <span style={{ paddingBottom: '8px' }}>to</span>
                          <CalendarInput
                            calendar="gregory"
                            locale="en-GB"
                            timeZone="Africa/Dar_es_Salaam"
                            date={formatDateForDisplay(tempEndDateState)}
                            onDateSelect={(selectedDate: any) => {
                              setTempEndDateState(
                                selectedDate.calendarDateString
                              );
                            }}
                          />
                        </div>
                        <div
                          style={{
                            paddingTop: '8px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <ButtonStrip>
                            <Button
                              primary
                              onClick={() => {
                                handleStartDateFilter();
                                handleEndDateFilter();
                                setIsOpen(false);
                              }}
                            >
                              Update
                            </Button>
                            <Button
                              onClick={() => {
                                setStartDateState(null);
                                setTempEndDateState(null);
                                setTempStartDateState(null);
                                setEndDateState(null);
                                setIsOpen(false);
                              }}
                            >
                              Reset
                            </Button>
                          </ButtonStrip>
                        </div>
                      </div>
                    </FlyoutMenu>
                  </div>
                }
              >
                Enrollment dates {(startDateState || endDateState) && ':'}{' '}
                {startDateState}
                {endDateState && ` - ${endDateState}`}
                {(startDateState || endDateState) && (
                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      setStartDateState(null);
                      setTempEndDateState(null);
                      setTempStartDateState(null);
                      setEndDateState(null);
                      setIsOpen(false);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ClearIcon className="my-icon-class" />
                  </span>
                )}
              </DropdownButton>
            </>
          )}
        </div>
        {/* TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION */}
        {/*  visibleFilters */}
        {(visibleFilters ?? []).map(
          ({ label, key, valueType, options, type }: any) => {
            if (valueType === 'DATE') {
              return (
                <DropdownButton
                  name="customDropdown"
                  key={key}
                  open={openDropdownKey === key}
                  onClick={() => {
                    setOpenDropdownKey(openDropdownKey === key ? null : key);
                  }}
                  component={
                    <div>
                      <FlyoutMenu>
                        <div style={{ padding: '16px' }}>
                          <CalendarInput
                            key={key}
                            calendar="gregory"
                            locale="en-GB"
                            timeZone="Africa/Dar_es_Salaam"
                            date={dateStates[key]}
                            onDateSelect={(selectedDate: any) => {
                              handleDateSelect(key, selectedDate, type);
                            }}
                          />
                          <div
                            style={{
                              paddingTop: '8px',
                              display: 'flex',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <ButtonStrip>
                              <Button
                                primary
                                onClick={() => {
                                  setPrevDateStates((prev: any) => ({
                                    ...prev,
                                    [key]: dateStates[key],
                                  }));
                                  handleAdditionalFilters();
                                  setOpenDropdownKey(null);
                                }}
                              >
                                Update
                              </Button>
                              <Button
                                onClick={() => {
                                  setIsOpen(false);
                                }}
                              >
                                Reset
                              </Button>
                            </ButtonStrip>
                          </div>
                        </div>
                      </FlyoutMenu>
                    </div>
                  }
                >
                  {label} {prevDateStates[key] && ':'} {prevDateStates[key]}
                  {prevDateStates[key] && (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        setDateStates((prev: any) => ({
                          ...prev,
                          [key]: '',
                        }));
                        setPrevDateStates((prev: any) => ({
                          ...prev,
                          [key]: '',
                        }));
                        const filteredFilters = dataQueryFiltersState.filter(
                          (f: { attribute: any }) => f.attribute !== key
                        );
                        setDataQueryFiltersState(filteredFilters);
                        setTempDataQueryFiltersState(filteredFilters);
                        setOpenDropdownKey(null);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <ClearIcon className="my-icon-class" />
                    </span>
                  )}
                </DropdownButton>
              );
            }
            {
              /* TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION */
            }

            if (options && options.options.length > 0) {
              return (
                <DropdownButton
                  name="customDropdown"
                  key={key}
                  open={openDropdownKey === key}
                  onClick={() => {
                    setOpenDropdownKey(openDropdownKey === key ? null : key);
                  }}
                  component={
                    <div>
                      <FlyoutMenu>
                        <div style={{ padding: '16px' }}>
                          <SingleSelectField
                            key={key}
                            placeholder={`${label}`}
                            selected={inputValues[key] || ''}
                            onChange={({ selected }: { selected: string }) => {
                              setInputValues((prevValues: any) => ({
                                ...prevValues,
                                [key]: selected ?? '',
                              }));
                              handleInputChangeForSelectField(
                                key,
                                selected ?? '',
                                type
                              );
                            }}
                          >
                            {(options.options ?? []).map((opt: any) => (
                              <SingleSelectOption
                                key={opt.id}
                                label={opt.name}
                                value={opt.code}
                              />
                            ))}
                          </SingleSelectField>
                          <div
                            style={{
                              paddingTop: '8px',
                              display: 'flex',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <ButtonStrip>
                              <Button
                                primary
                                disabled={
                                  !inputValues[key] ||
                                  inputValues[key] === prevInputValues[key]
                                }
                                onClick={() => {
                                  setPrevInputValues((prev: any) => ({
                                    ...prev,
                                    [key]: inputValues[key],
                                  }));
                                  handleAdditionalFilters();
                                  setOpenDropdownKey(null);
                                }}
                              >
                                Update
                              </Button>
                              <Button
                                disabled={!inputValues[key]}
                                onClick={() => {
                                  setInputValues((prevValues: any) => ({
                                    ...prevValues,
                                    [key]: '',
                                  }));
                                  setPrevInputValues((prevValues: any) => ({
                                    ...prevValues,
                                    [key]: '',
                                  }));

                                  handleInputChangeForSelectField(
                                    key,
                                    '',
                                    type
                                  );
                                  const filteredFilters =
                                    dataQueryFiltersState.filter(
                                      (f: { attribute: any }) =>
                                        f.attribute !== key
                                    );

                                  setDataQueryFiltersState(filteredFilters);
                                  setTempDataQueryFiltersState(filteredFilters);
                                  setOpenDropdownKey(null);
                                }}
                              >
                                Reset
                              </Button>
                            </ButtonStrip>
                          </div>
                        </div>
                      </FlyoutMenu>
                    </div>
                  }
                >
                  {label} {prevInputValues[key] && ':'} {prevInputValues[key]}
                  {prevInputValues[key] && (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        setInputValues((prevValues: any) => ({
                          ...prevValues,
                          [key]: '',
                        }));
                        setPrevInputValues((prevValues: any) => ({
                          ...prevValues,
                          [key]: '',
                        }));

                        handleInputChangeForSelectField(key, '', type);
                        const filteredFilters = dataQueryFiltersState.filter(
                          (f: { attribute: any }) => f.attribute !== key
                        );

                        setDataQueryFiltersState(filteredFilters);
                        setTempDataQueryFiltersState(filteredFilters);
                        setOpenDropdownKey(null);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <ClearIcon className="my-icon-class" />
                    </span>
                  )}
                </DropdownButton>
              );
            }
            return (
              <DropdownButton
                name="customDropdown"
                open={openDropdownKey === key}
                onClick={() => {
                  setOpenDropdownKey(openDropdownKey === key ? null : key);
                }}
                component={
                  <div>
                    <FlyoutMenu>
                      <div style={{ padding: '16px' }}>
                        <InputField
                          key={key}
                          placeholder={`${label}`}
                          value={inputValues[key] || ''}
                          onChange={(e: any) => {
                            const currentValue =
                              'target' in e ? e.target.value : e.value ?? '';
                            setInputValues((prevValues: any) => ({
                              ...prevValues,
                              [key]: currentValue,
                            }));
                            handleInputChange(key, currentValue, type);
                          }}
                        />
                        <div
                          style={{
                            paddingTop: '8px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <ButtonStrip>
                            <Button
                              primary
                              disabled={
                                !inputValues[key] ||
                                inputValues[key] === prevInputValues[key]
                              }
                              onClick={() => {
                                setPrevInputValues((prev: any) => ({
                                  ...prev,
                                  [key]: inputValues[key],
                                }));
                                handleAdditionalFilters();
                                setOpenDropdownKey(null);
                              }}
                            >
                              Update
                            </Button>
                            <Button
                              disabled={!inputValues[key]}
                              onClick={() => {
                                setInputValues((prevValues: any) => ({
                                  ...prevValues,
                                  [key]: '',
                                }));
                                setPrevInputValues((prevValues: any) => ({
                                  ...prevValues,
                                  [key]: '',
                                }));
                                // Remove the filter for this key
                                const filteredFilters =
                                  dataQueryFiltersState.filter(
                                    (f: { attribute: any }) =>
                                      f.attribute !== key
                                  );
                                setDataQueryFiltersState(filteredFilters);
                                setTempDataQueryFiltersState(filteredFilters);
                                setOpenDropdownKey(null);
                              }}
                            >
                              Reset
                            </Button>
                          </ButtonStrip>
                        </div>
                      </div>
                    </FlyoutMenu>
                  </div>
                }
              >
                {label} {prevInputValues[key] && ':'} {prevInputValues[key]}
                {prevInputValues[key] && (
                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      // Clear the input value for this key
                      setInputValues((prevValues: any) => ({
                        ...prevValues,
                        [key]: '',
                      }));
                      setPrevInputValues((prevValues: any) => ({
                        ...prevValues,
                        [key]: '',
                      }));
                      // Remove the filter for this key
                      const filteredFilters = dataQueryFiltersState.filter(
                        (f: { attribute: any }) => f.attribute !== key
                      );
                      setDataQueryFiltersState(filteredFilters);
                      setTempDataQueryFiltersState(filteredFilters);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ClearIcon className="my-icon-class" />
                  </span>
                )}
              </DropdownButton>
            );
          }
        )}
        {/* </div>
      )} */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
          }}
        >
          <Button onClick={() => setShowAllFilters(!showAllFilters)}>
            {showAllFilters ? 'Less Filters' : 'More Filters'}
          </Button>
        </div>
      </div>
    </DataTableToolbar>
  );
};

export function formatDateForDisplay(
  dateString: string | null | undefined
): string {
  if (!dateString || dateString === 'dd-mm-yyyy') return 'dd-mm-yyyy';

  try {
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) return 'dd-mm-yyyy';
    return format(parsedDate, 'dd-MM-yyyy');
  } catch {
    return 'dd-mm-yyyy';
  }
}

// case 'date':
//           case 'date-time':
//             return (
//               // <InputField
//               //   error={hasError}
//               //   validationText={validationError}
//               //   type={this.field().type as any}
//               //   inputWidth={inputWidth}
//               //   required={this.field().required}
//               //   name={this.field().id}
//               //   label={this.label()}
//               //   min={this.field().min?.toString()}
//               //   max={this.field().max?.toString()}
//               //   placeholder={this.placeholder()}
//               //   value={value}
//               //   readOnly={disabled}
//               //   onChange={(event: any) => {
//               //     onValueChange(event.value);
//               //   }}
//               //   onBlur={() => {
//               //     checkValueUniqueness();
//               //   }}
//               // />
//               <CalendarInput
//                 label={this.label()}
//                 error={hasError}
//                 validationText={validationError}
//                 date={value}
//                 readOnly={disabled}
//                 min={this.field().min?.toString()}
//                 max={this.field().max?.toString()}
//                 placeholder={this.placeholder()}
//                 onDateSelect={(selectedDate: any) => {
//                   onValueChange(selectedDate.calendarDateString);
//                 }}
//                 disabled={disabled}
//                 inputWidth={inputWidth}
//                 required={this.field().required}
//                 calendar="gregory"
//                 locale="en-GB"
//                 timeZone="Africa/Dar_es_Salaam"
//               />
//             );
