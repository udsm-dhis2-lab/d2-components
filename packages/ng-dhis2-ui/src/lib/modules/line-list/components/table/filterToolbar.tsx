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
        flexDirection: 'column',
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
                !!tempStartDateState && tempStartDateState !== 'yyyy-mm-dd'
              }
              date={tempStartDateState || 'yyyy-mm-dd'}
              onDateSelect={(selectedDate: any) => {
                setTempStartDateState(selectedDate.calendarDateString);
                console.log('selectedDate', selectedDate);
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
                !!tempEndDateState && tempEndDateState !== 'yyyy-mm-dd'
              }
              date={tempEndDateState || 'yyyy-mm-dd'}
              onDateSelect={(selectedDate: any) => {
                setTempEndDateState(selectedDate.calendarDateString);
                if (selectedDate.calendarDateString === null) {
                  setEndDateState(selectedDate.calendarDateString);
                }
              }}
            />
          </>
        )}

        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={() => setShowAllFilters(!showAllFilters)}>
          {showAllFilters ? 'Less Filters' : 'More Filters'}
        </Button>
      </div>

      {/* Row 2: visibleFilters appear in a new row */}
      {visibleFilters?.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {(visibleFilters ?? []).map(
            ({ label, key, valueType, options }: any) => {
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
                      console.log('filteredFilters', selectedDate);
                      if (selectedDate.calendarDateString === null) {
                        console.log('selectedDate', selectedDate);
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
            }
          )}
        </div>
      )}
    </div>
  </DataTableToolbar>

  // <DataTableToolbar className="table-top-toolbar">
  //   <div
  //     style={{
  //       display: 'flex',
  //       alignItems: 'center',
  //       gap: '10px',
  //       flexWrap: 'wrap',
  //     }}
  //   >
  //     <InputField
  //       key="location"
  //       label={orgUnitLabel ? orgUnitLabel : 'registering unit:'}
  //       value={selectedOrgUnit}
  //       onFocus={() => setHide(false)}
  //       className="custom-input"
  //       clearable
  //       onChange={(event: { value: string }) => {
  //         setSelectedOrgUnit(event.value);
  //         setOrgUnitState(defaultOrgUnit);
  //       }}
  //     />
  //     <CalendarInput
  //       label="Start date:"
  //       calendar="gregory"
  //       locale="en-GB"
  //       timeZone="Africa/Dar_es_Salaam"
  //       className="custom-input"
  //       clearable={!!tempStartDateState}
  //       date={tempStartDateState}
  //       onDateSelect={(selectedDate: any) => {
  //         // if (!(selectedDate.calendarDateString === null)) {
  //         setTempStartDateState(selectedDate.calendarDateString);
  //         //}
  //         if (selectedDate.calendarDateString === null) {
  //           setStartDateState(selectedDate.calendarDateString);
  //         }
  //       }}
  //     />
  //     <CalendarInput
  //       label="End date:"
  //       calendar="gregory"
  //       locale="en-GB"
  //       timeZone="Africa/Dar_es_Salaam"
  //       className="custom-input"
  //       clearable={!!tempEndDateState}
  //       date={tempEndDateState}
  //       onDateSelect={(selectedDate: any) => {
  //         // if (!(selectedDate.calendarDateString === null)) {
  //         setTempEndDateState(selectedDate.calendarDateString);
  //         //}
  //         if (selectedDate.calendarDateString === null) {
  //           setEndDateState(selectedDate.calendarDateString);
  //         }
  //       }}
  //     />
  //     <Button onClick={() => handleSearch()}>Search</Button>
  //     <Button onClick={() => setShowAllFilters(!showAllFilters)}>
  //       {showAllFilters ? 'Less Filters' : 'More Filters'}
  //     </Button>

  //     {(visibleFilters ?? []).map(({ label, key, valueType, options }: any) => {
  //       if (valueType === 'DATE') {
  //         return (
  //           <CalendarInput
  //             key={key}
  //             label={`${label}:`}
  //             calendar="gregory"
  //             locale="en-GB"
  //             timeZone="Africa/Dar_es_Salaam"
  //             className="custom-input"
  //             clearable={!!dateStates[key]}
  //             date={dateStates[key]}
  //             onDateSelect={(selectedDate: any) => {
  //               handleDateSelect(key, selectedDate);
  //               const filteredFilters = dataQueryFiltersState.filter(
  //                 (f: { attribute: any }) => f.attribute !== key
  //               );

  //               if (selectedDate === null) {
  //                 setDataQueryFiltersState(filteredFilters);
  //               }
  //             }}
  //           />
  //         );
  //       }
  //       // const filteredFilters = prevFilters.filter((f) => f.attribute !== key);
  //       if (options && options.options.length > 0) {
  //         return (
  //           <SingleSelectField
  //             key={key}
  //             label={`${label}:`}
  //             selected={inputValues[key] || ''}
  //             className="custom-select-input"
  //             clearable
  //             onChange={({ selected }: { selected: string }) => {
  //               setInputValues((prevValues: any) => ({
  //                 ...prevValues,
  //                 [key]: selected ?? '',
  //               }));
  //               handleInputChangeForSelectField(key, selected ?? '');
  //               const filteredFilters = dataQueryFiltersState.filter(
  //                 (f: { attribute: any }) => f.attribute !== key
  //               );
  //               if (selected === '') {
  //                 setDataQueryFiltersState(filteredFilters);
  //               }
  //             }}
  //           >
  //             {(options.options ?? []).map((opt: any) => (
  //               <SingleSelectOption
  //                 key={opt.id}
  //                 label={opt.name}
  //                 value={opt.code}
  //               />
  //             ))}
  //           </SingleSelectField>
  //         );
  //       }

  //       return (
  //         <InputField
  //           key={key}
  //           label={`${label}:`}
  //           className="custom-input"
  //           value={inputValues[key] || ''}
  //           clearable
  //           onChange={(e: any) => {
  //             const currentValue =
  //               'target' in e ? e.target.value : e.value ?? '';
  //             setInputValues((prevValues: any) => ({
  //               ...prevValues,
  //               [key]: currentValue,
  //             }));
  //             // if (currentValue === '') {
  //             //   handleInputChange(key, '');
  //             // }
  //             const filteredFilters = dataQueryFiltersState.filter(
  //               (f: { attribute: any }) => f.attribute !== key
  //             );

  //             if (currentValue === '') {
  //               setDataQueryFiltersState(filteredFilters);
  //             }
  //           }}
  //           onBlur={(e: any) => {
  //             const currentValue =
  //               'target' in e ? e.target.value : e.value ?? '';
  //             if (currentValue !== '' && currentValue !== prevValue) {
  //               handleInputChange(key, currentValue);
  //               setPrevValue(currentValue);
  //             }
  //           }}
  //         />
  //       );
  //     })}
  //     <div>
  //       {/* <p>hello</p> */}
  //     </div>
  //   </div>
  // </DataTableToolbar>
);
