import {
  Button,
  CalendarInput,
  DataTableToolbar,
  InputField,
  SingleSelectField,
  SingleSelectOption,
} from '@dhis2/ui';
import React from 'react';
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
}: any) => (
  <DataTableToolbar className="table-top-toolbar">
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
        onFocus={() => setHide(false)}
        className="custom-input"
        clearable
        onChange={(event: { value: string }) => {
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
        clearable={!!startDateState}
        date={startDateState}
        onDateSelect={(selectedDate: any) => {
         // if (!(selectedDate.calendarDateString === null)) {
            setStartDateState(selectedDate.calendarDateString);
          //}
        }}
      />
      <CalendarInput
        label="End date:"
        calendar="gregory"
        locale="en-GB"
        timeZone="Africa/Dar_es_Salaam"
        className="custom-input"
        clearable={!!endDateState}
        date={endDateState}
        onDateSelect={(selectedDate: any) => {
         // if (!(selectedDate.calendarDateString === null)) {
            setEndDateState(selectedDate.calendarDateString);
          //}
        }}
      />

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
              if (currentValue === '') {
                handleInputChange(key, '');
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
      <Button onClick={() => setShowAllFilters(!showAllFilters)}>
        {showAllFilters ? 'Less Filters' : 'More Filters'}
      </Button>
    </div>
  </DataTableToolbar>
);
