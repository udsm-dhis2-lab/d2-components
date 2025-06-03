import {
  Button,
  CalendarInput,
  DataTableToolbar,
  InputField,
  SingleSelectField,
  SingleSelectOption,
} from '@dhis2/ui';
import React from 'react';
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
  prevValue,
  setPrevValue,
  showAllFilters,
  setShowAllFilters,
  handleSearch,
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
}: any) => (
  <DataTableToolbar className="table-top-toolbar">
    <div
      style={{
        display: 'flex',
        // flexDirection: 'column',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      {/* Row 1: default filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <InputField
          key="location"
          label={orgUnitLabel ? orgUnitLabel : 'registering unit:'}
          value={selectedOrgUnit}
          onFocus={() => {
            SetOrgUnitModalVisible(true);
            setHide(false);
          }}
          className="custom-input"
          clearable
          onChange={(event: { value: string }) => {
            setSelectedOrgUnit(event.value);
            setOrgUnitState(defaultOrgUnit);
          }}
        />
        {showEnrollmentDates && (
          <>
            <CalendarInput
              label="Start date:"
              calendar="gregory"
              locale="en-GB"
              timeZone="Africa/Dar_es_Salaam"
              className="custom-input"
              //clearable={!!tempStartDateState}
              //date={tempStartDateState || undefined}
              //date={tempStartDateState || "yyyy-mm-dd"}
              clearable={
                !!tempStartDateState && tempStartDateState !== 'dd-mm-yyyy'
              }
              // date={tempStartDateState || 'dd-mm-yyyy'}
              date={formatDateForDisplay(tempStartDateState)}
              onDateSelect={(selectedDate: any) => {
                setTempStartDateState(selectedDate.calendarDateString);
                if (selectedDate.calendarDateString === null) {
                  setStartDateState(selectedDate.calendarDateString);
                }
              }}
            />
            <CalendarInput
              label="End date:"
              calendar="gregory"
              locale="en-GB"
              timeZone="Africa/Dar_es_Salaam"
              className="custom-input"
              clearable={
                !!tempEndDateState && tempEndDateState !== 'dd-mm-yyyy'
              }
              // date={tempEndDateState || 'dd-mm-yyyy'}
              date={formatDateForDisplay(tempEndDateState)}
              onDateSelect={(selectedDate: any) => {
                setTempEndDateState(selectedDate.calendarDateString);
                if (selectedDate.calendarDateString === null) {
                  setEndDateState(selectedDate.calendarDateString);
                }
              }}
            />
          </>
        )}

        {/* <Button onClick={handleSearch}>Search</Button>
        <Button onClick={() => setShowAllFilters(!showAllFilters)}>
          {showAllFilters ? 'Less Filters' : 'More Filters'}
        </Button> */}
      </div>

      {/* Row 2: visibleFilters appear in a new row */}
      {/* {visibleFilters?.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        > */}
      {(visibleFilters ?? []).map(({ label, key, valueType, options }: any) => {
        if (valueType === 'DATE') {
          return (
            <CalendarInput
              key={key}
              label={`${label}:`}
              calendar="gregory"
              locale="en-GB"
              timeZone="Africa/Dar_es_Salaam"
              className="custom-input"
              clearable={!!dateStates[key]}
              date={dateStates[key]}
              onDateSelect={(selectedDate: any) => {
                handleDateSelect(key, selectedDate);
                const filteredFilters = dataQueryFiltersState.filter(
                  (f: { attribute: any }) => f.attribute !== key
                );
                if (selectedDate.calendarDateString === null) {
                  setDataQueryFiltersState(filteredFilters);
                }
              }}
            />
          );
        }

        if (options && options.options.length > 0) {
          return (
            <SingleSelectField
              key={key}
              label={`${label}:`}
              selected={inputValues[key] || ''}
              className="custom-select-input"
              clearable
              onChange={({ selected }: { selected: string }) => {
                setInputValues((prevValues: any) => ({
                  ...prevValues,
                  [key]: selected ?? '',
                }));
                handleInputChangeForSelectField(key, selected ?? '');
                const filteredFilters = dataQueryFiltersState.filter(
                  (f: { attribute: any }) => f.attribute !== key
                );
                if (selected === '') {
                  setDataQueryFiltersState(filteredFilters);
                }
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
          );
        }

        return (
          <InputField
            key={key}
            label={`${label}:`}
            className="custom-input"
            value={inputValues[key] || ''}
            clearable
            onChange={(e: any) => {
              const currentValue =
                'target' in e ? e.target.value : e.value ?? '';
              setInputValues((prevValues: any) => ({
                ...prevValues,
                [key]: currentValue,
              }));
              const filteredFilters = dataQueryFiltersState.filter(
                (f: { attribute: any }) => f.attribute !== key
              );
              if (currentValue === '') {
                setDataQueryFiltersState(filteredFilters);
              }
            }}
            onBlur={(e: any) => {
              const currentValue =
                'target' in e ? e.target.value : e.value ?? '';
              if (currentValue !== '' && currentValue !== prevValue) {
                handleInputChange(key, currentValue);
                setPrevValue(currentValue);
              }
            }}
          />
        );
      })}
      {/* </div>
      )} */}
      <div
        style={{
          display: 'flex',
          // alignItems: 'center',
          gap: '10px',
          // flexWrap: 'wrap',
        }}
      >
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={() => setShowAllFilters(!showAllFilters)}>
          {showAllFilters ? 'Less Filters' : 'More Filters'}
        </Button>
      </div>
    </div>
  </DataTableToolbar>
);

export function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString || dateString === 'dd-mm-yyyy') return 'dd-mm-yyyy';

  try {
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) return 'dd-mm-yyyy';
    return format(parsedDate, 'dd-MM-yyyy');
  } catch {
    return 'dd-mm-yyyy';
  }
}