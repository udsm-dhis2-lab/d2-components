// import {
//   Button,
//   CalendarInput,
//   DataTableToolbar,
//   InputField,
//   SingleSelectField,
//   SingleSelectOption,
//   DropdownButton,
//   ButtonStrip,
//   FlyoutMenu,
// } from '@dhis2/ui';
// import React, { useState } from 'react';
// import { parseISO, format, isValid } from 'date-fns';
// import { OrgUnitFormField } from '../org-unit-form-field.component';

// import type { SelectedOrgUnit } from '../../models/selected-org-unit.model';

// export const FilterToolbar = ({
//   orgUnit: {
//     customOrgUnitRoots,
//     allowMultipleOrgUnits,
//     appliedOrgUnits: appliedOrgUnitsProp,
//     setAppliedOrgUnits,
//     selectedOrgUnits: selectedOrgUnitsProp,
//     setSelectedOrgUnits,
//     orgUnitLabel,
//     handleOrgUnitFilter,
//     appliedOrgUnitMode,
//     selectedOrgUnitMode,
//     defaultOrgUnitMode,
//     setSelectedOrgUnitMode,
//     handleOrgUnitModeReset,
//   },
//   dates: {
//     startDateState,
//     setStartDateState,
//     endDateState,
//     setEndDateState,
//     setTempStartDateState,
//     setTempEndDateState,
//     tempStartDateState,
//     tempEndDateState,
//     showEnrollmentDates,
//     handleStartDateFilter,
//     handleEndDateFilter,
//   },
//   filters: {
//     visibleFilters,
//     dateStates,
//     inputValues,
//     setInputValues,
//     handleInputChange,
//     handleInputChangeForSelectField,
//     handleDateSelect,
//     showAllFilters,
//     setShowAllFilters,
//     dataQueryFiltersState,
//     setDataQueryFiltersState,
//     handleAdditionalFilters,
//     setDateStates,
//     prevInputValues,
//     setPrevInputValues,
//     setTempDataQueryFiltersState,
//     prevDateStates,
//     setPrevDateStates,
//   },
// }: any) => {
//   const selectedOrgUnits = selectedOrgUnitsProp as SelectedOrgUnit[];
//   const appliedOrgUnits = appliedOrgUnitsProp as SelectedOrgUnit[];
//   const orgUnitsChanged =
//     selectedOrgUnits.length !== appliedOrgUnits.length ||
//     selectedOrgUnits.some(
//       (selected) =>
//         !appliedOrgUnits.some((applied) => applied.id === selected.id)
//     );
//   const canUpdateOrgUnits =
//     selectedOrgUnits.length > 0 &&
//     (orgUnitsChanged || selectedOrgUnitMode !== appliedOrgUnitMode);
//   const canResetOrgUnits =
//     selectedOrgUnits.length > 0 ||
//     appliedOrgUnits.length > 0 ||
//     selectedOrgUnitMode !== defaultOrgUnitMode ||
//     appliedOrgUnitMode !== defaultOrgUnitMode;
//   const appliedOrgUnitsLabel = appliedOrgUnits
//     .map((unit) => unit.displayName)
//     .join(', ');
//   const displayedOrgUnitNames = appliedOrgUnits.map((unit) => unit.displayName);
//   const orgUnitSelectionLabel =
//     displayedOrgUnitNames.length > 2
//       ? `${displayedOrgUnitNames.slice(0, 2).join(', ')} .....`
//       : appliedOrgUnitsLabel;

//   const updateSelectedOrgUnits = (units: typeof selectedOrgUnits) => {
//     setSelectedOrgUnits(units);
//   };

//   const [isOpen, setIsOpen] = useState(false);
//   const [isOpenOrgUnitDropdown, setIsOpenOrgUnitDropdown] = useState(false);
//   const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
//   type ClearIconProps = {
//     className?: string;
//     [key: string]: any;
//   };

//   //TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION
//   const ClearIcon = ({ className, ...props }: ClearIconProps) => (
//     <svg
//       className={className}
//       {...props}
//       viewBox="0 0 24 24"
//       width={16}
//       height={16}
//     >
//       <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
//     </svg>
//   );
//   return (
//     <DataTableToolbar className="table-top-toolbar">
//       <div
//         style={{
//           display: 'flex',
//           gap: '10px',
//           flexWrap: 'wrap',
//         }}
//       >
//         {/* default filters */}
//         {/* TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION */}
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '10px',
//             flexWrap: 'wrap',
//           }}
//         >
//           <DropdownButton
//             name="customDropdown"
//             open={isOpenOrgUnitDropdown}
//             onClick={() => setIsOpenOrgUnitDropdown(!isOpenOrgUnitDropdown)}
//             component={
//               <div>
//                 <FlyoutMenu maxWidth="90vw">
//                   <div style={{ padding: '16px' }}>
//                     {isOpenOrgUnitDropdown && (
//                       <div style={{ width: '400px', maxWidth: '80vw' }}>
//                         <OrgUnitFormField
//                           key="registering-unit"
//                           customOrgUnitRoots={customOrgUnitRoots}
//                           multiple={allowMultipleOrgUnits}
//                           selectedPaths={selectedOrgUnits.map((unit) => unit.path)}
//                           onSelectOrgUnit={(unit: any) => {
//                             if (!allowMultipleOrgUnits) {
//                               updateSelectedOrgUnits([unit]);
//                               return;
//                             }
//                             const paths: string[] = unit.selected;
//                             const units = selectedOrgUnits.filter((chosen) => paths.includes(chosen.path));
//                             if (paths.includes(unit.path) && !units.some((chosen) => chosen.id === unit.id)) {
//                               units.push(unit);
//                             }
//                             updateSelectedOrgUnits(units);
//                           }}
//                         />
//                         <div role="group" aria-label="Mode" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 12px' }}>
//                           <span style={{ fontSize: '14px', fontWeight: 400 }}>Mode:</span>
//                           <div style={{ flex: 1, minWidth: 0 }}>
//                           <SingleSelectField
//                             selected={selectedOrgUnitMode}
//                             helpText={`If no mode is selected, the default mode will be ${defaultOrgUnitMode}.`}
//                             onChange={({ selected }: { selected: string }) =>
//                               setSelectedOrgUnitMode(selected)
//                             }
//                           >
//                             {(['DESCENDANTS', 'SELECTED', 'CHILDREN'] as const).map((mode) => (
//                               <SingleSelectOption
//                                 key={mode}
//                                 label={mode}
//                                 value={mode}
//                               />
//                             ))}
//                           </SingleSelectField>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                     <div
//                       style={{
//                         paddingTop: '8px',
//                         display: 'flex',
//                         justifyContent: 'flex-end',
//                       }}
//                     >
//                       <ButtonStrip>
//                         <Button
//                           primary
//                           disabled={!canUpdateOrgUnits}
//                           onClick={() => {
//                             handleOrgUnitFilter();
//                             setIsOpenOrgUnitDropdown(false);
//                           }}
//                         >
//                           Update
//                         </Button>
//                         <Button
//                           disabled={!canResetOrgUnits}
//                           onClick={() => {
//                             setSelectedOrgUnits([]);
//                             setAppliedOrgUnits([]);
//                             handleOrgUnitModeReset();
//                             setIsOpenOrgUnitDropdown(false);
//                           }}
//                         >
//                           Reset
//                         </Button>
//                       </ButtonStrip>
//                     </div>
//                   </div>
//                 </FlyoutMenu>
//               </div>
//             }
//           >
//             {orgUnitLabel ? orgUnitLabel : 'Registering unit'}{' '}
//             {appliedOrgUnitsLabel && (
//               <span title={appliedOrgUnitsLabel}>
//                 : {orgUnitSelectionLabel}
//               </span>
//             )}
//             {appliedOrgUnitsLabel && (
//               <span
//                 onClick={(event) => {
//                   event.stopPropagation();
//                   setSelectedOrgUnits([]);
//                   setAppliedOrgUnits([]);
//                   handleOrgUnitModeReset();
//                   setIsOpenOrgUnitDropdown(false);
//                 }}
//                 style={{ display: 'inline-flex', alignItems: 'center' }}
//               >
//                 <ClearIcon className="my-icon-class" />
//               </span>
//             )}
//           </DropdownButton>
//           {showEnrollmentDates && (
//             <>
//               <DropdownButton
//                 name="customDropdown"
//                 open={isOpen}
//                 onClick={() => setIsOpen(!isOpen)}
//                 component={
//                   <div>
//                     <FlyoutMenu>
//                       <div style={{ padding: '16px' }}>
//                         <div
//                           style={{
//                             display: 'flex',
//                             alignItems: 'flex-end',
//                             gap: '16px',
//                           }}
//                         >
//                           <CalendarInput
//                             calendar="gregory"
//                             locale="en-GB"
//                             timeZone="Africa/Dar_es_Salaam"
//                             date={formatDateForDisplay(tempStartDateState)}
//                             onDateSelect={(selectedDate: any) => {
//                               setTempStartDateState(
//                                 selectedDate.calendarDateString
//                               );
//                             }}
//                           />
//                           <span style={{ paddingBottom: '8px' }}>to</span>
//                           <CalendarInput
//                             calendar="gregory"
//                             locale="en-GB"
//                             timeZone="Africa/Dar_es_Salaam"
//                             date={formatDateForDisplay(tempEndDateState)}
//                             onDateSelect={(selectedDate: any) => {
//                               setTempEndDateState(
//                                 selectedDate.calendarDateString
//                               );
//                             }}
//                           />
//                         </div>
//                         <div
//                           style={{
//                             paddingTop: '8px',
//                             display: 'flex',
//                             justifyContent: 'flex-end',
//                           }}
//                         >
//                           <ButtonStrip>
//                             <Button
//                               primary
//                               onClick={() => {
//                                 handleStartDateFilter();
//                                 handleEndDateFilter();
//                                 setIsOpen(false);
//                               }}
//                             >
//                               Update
//                             </Button>
//                             <Button
//                               onClick={() => {
//                                 setStartDateState(null);
//                                 setTempEndDateState(null);
//                                 setTempStartDateState(null);
//                                 setEndDateState(null);
//                                 setIsOpen(false);
//                               }}
//                             >
//                               Reset
//                             </Button>
//                           </ButtonStrip>
//                         </div>
//                       </div>
//                     </FlyoutMenu>
//                   </div>
//                 }
//               >
//                 Enrollment dates {(startDateState || endDateState) && ':'}{' '}
//                 {startDateState}
//                 {endDateState && ` - ${endDateState}`}
//                 {(startDateState || endDateState) && (
//                   <span
//                     onClick={(event) => {
//                       event.stopPropagation();
//                       setStartDateState(null);
//                       setTempEndDateState(null);
//                       setTempStartDateState(null);
//                       setEndDateState(null);
//                       setIsOpen(false);
//                     }}
//                     style={{ display: 'inline-flex', alignItems: 'center' }}
//                   >
//                     <ClearIcon className="my-icon-class" />
//                   </span>
//                 )}
//               </DropdownButton>
//             </>
//           )}
//         </div>
//         {/* TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION */}
//         {/*  visibleFilters */}
//         {(visibleFilters ?? []).map(
//           ({ label, key, valueType, options, type }: any) => {
//             if (valueType === 'DATE') {
//               return (
//                 <DropdownButton
//                   name="customDropdown"
//                   key={key}
//                   open={openDropdownKey === key}
//                   onClick={() => {
//                     setOpenDropdownKey(openDropdownKey === key ? null : key);
//                   }}
//                   component={
//                     <div>
//                       <FlyoutMenu>
//                         <div style={{ padding: '16px' }}>
//                           <CalendarInput
//                             key={key}
//                             calendar="gregory"
//                             locale="en-GB"
//                             timeZone="Africa/Dar_es_Salaam"
//                             date={dateStates[key]}
//                             onDateSelect={(selectedDate: any) => {
//                               handleDateSelect(key, selectedDate, type);
//                             }}
//                           />
//                           <div
//                             style={{
//                               paddingTop: '8px',
//                               display: 'flex',
//                               justifyContent: 'flex-end',
//                             }}
//                           >
//                             <ButtonStrip>
//                               <Button
//                                 primary
//                                 onClick={() => {
//                                   setPrevDateStates((prev: any) => ({
//                                     ...prev,
//                                     [key]: dateStates[key],
//                                   }));
//                                   handleAdditionalFilters();
//                                   setOpenDropdownKey(null);
//                                 }}
//                               >
//                                 Update
//                               </Button>
//                               <Button
//                                 onClick={() => {
//                                   setIsOpen(false);
//                                 }}
//                               >
//                                 Reset
//                               </Button>
//                             </ButtonStrip>
//                           </div>
//                         </div>
//                       </FlyoutMenu>
//                     </div>
//                   }
//                 >
//                   {label} {prevDateStates[key] && ':'} {prevDateStates[key]}
//                   {prevDateStates[key] && (
//                     <span
//                       onClick={(event) => {
//                         event.stopPropagation();
//                         setDateStates((prev: any) => ({
//                           ...prev,
//                           [key]: '',
//                         }));
//                         setPrevDateStates((prev: any) => ({
//                           ...prev,
//                           [key]: '',
//                         }));
//                         const filteredFilters = dataQueryFiltersState.filter(
//                           (f: { attribute: any }) => f.attribute !== key
//                         );
//                         setDataQueryFiltersState(filteredFilters);
//                         setTempDataQueryFiltersState(filteredFilters);
//                         setOpenDropdownKey(null);
//                       }}
//                       style={{ display: 'inline-flex', alignItems: 'center' }}
//                     >
//                       <ClearIcon className="my-icon-class" />
//                     </span>
//                   )}
//                 </DropdownButton>
//               );
//             }
//             {
//               /* TODO: I HAVE DUPLICATED DROPDOWN AND CLEAR ICON IN MULTIPLE PLACES REQUIRED TO CREATE A REUSABLE DROPDOWN COMPONENT WITH THE CLEAR ICON TO AVOID DUPLICATION */
//             }

//             if (options && options.options.length > 0) {
//               return (
//                 <DropdownButton
//                   name="customDropdown"
//                   key={key}
//                   open={openDropdownKey === key}
//                   onClick={() => {
//                     setOpenDropdownKey(openDropdownKey === key ? null : key);
//                   }}
//                   component={
//                     <div>
//                       <FlyoutMenu>
//                         <div style={{ padding: '16px' }}>
//                           <SingleSelectField
//                             key={key}
//                             placeholder={`${label}`}
//                             selected={inputValues[key] || ''}
//                             onChange={({ selected }: { selected: string }) => {
//                               setInputValues((prevValues: any) => ({
//                                 ...prevValues,
//                                 [key]: selected ?? '',
//                               }));
//                               handleInputChangeForSelectField(
//                                 key,
//                                 selected ?? '',
//                                 type
//                               );
//                             }}
//                           >
//                             {(options.options ?? []).map((opt: any) => (
//                               <SingleSelectOption
//                                 key={crypto.randomUUID() || opt.key}
//                                 label={opt.name}
//                                 value={opt.code}
//                               />
//                             ))}
//                           </SingleSelectField>
//                           <div
//                             style={{
//                               paddingTop: '8px',
//                               display: 'flex',
//                               justifyContent: 'flex-end',
//                             }}
//                           >
//                             <ButtonStrip>
//                               <Button
//                                 primary
//                                 disabled={
//                                   !inputValues[key] ||
//                                   inputValues[key] === prevInputValues[key]
//                                 }
//                                 onClick={() => {
//                                   setPrevInputValues((prev: any) => ({
//                                     ...prev,
//                                     [key]: inputValues[key],
//                                   }));
//                                   handleAdditionalFilters();
//                                   setOpenDropdownKey(null);
//                                 }}
//                               >
//                                 Update
//                               </Button>
//                               <Button
//                                 disabled={!inputValues[key]}
//                                 onClick={() => {
//                                   setInputValues((prevValues: any) => ({
//                                     ...prevValues,
//                                     [key]: '',
//                                   }));
//                                   setPrevInputValues((prevValues: any) => ({
//                                     ...prevValues,
//                                     [key]: '',
//                                   }));

//                                   handleInputChangeForSelectField(
//                                     key,
//                                     '',
//                                     type
//                                   );
//                                   const filteredFilters =
//                                     dataQueryFiltersState.filter(
//                                       (f: { attribute: any }) =>
//                                         f.attribute !== key
//                                     );

//                                   setDataQueryFiltersState(filteredFilters);
//                                   setTempDataQueryFiltersState(filteredFilters);
//                                   setOpenDropdownKey(null);
//                                 }}
//                               >
//                                 Reset
//                               </Button>
//                             </ButtonStrip>
//                           </div>
//                         </div>
//                       </FlyoutMenu>
//                     </div>
//                   }
//                 >
//                   {label} {prevInputValues[key] && ':'} {prevInputValues[key]}
//                   {prevInputValues[key] && (
//                     <span
//                       onClick={(event) => {
//                         event.stopPropagation();
//                         setInputValues((prevValues: any) => ({
//                           ...prevValues,
//                           [key]: '',
//                         }));
//                         setPrevInputValues((prevValues: any) => ({
//                           ...prevValues,
//                           [key]: '',
//                         }));

//                         handleInputChangeForSelectField(key, '', type);
//                         const filteredFilters = dataQueryFiltersState.filter(
//                           (f: { attribute: any }) => f.attribute !== key
//                         );

//                         setDataQueryFiltersState(filteredFilters);
//                         setTempDataQueryFiltersState(filteredFilters);
//                         setOpenDropdownKey(null);
//                       }}
//                       style={{ display: 'inline-flex', alignItems: 'center' }}
//                     >
//                       <ClearIcon className="my-icon-class" />
//                     </span>
//                   )}
//                 </DropdownButton>
//               );
//             }
//             return (
//               <DropdownButton
//                 name="customDropdown"
//                 open={openDropdownKey === key}
//                 onClick={() => {
//                   setOpenDropdownKey(openDropdownKey === key ? null : key);
//                 }}
//                 component={
//                   <div>
//                     <FlyoutMenu>
//                       <div style={{ padding: '16px' }}>
//                         <InputField
//                           key={key}
//                           placeholder={`${label}`}
//                           value={inputValues[key] || ''}
//                           onChange={(e: any) => {
//                             const currentValue =
//                               'target' in e ? e.target.value : e.value ?? '';
//                             setInputValues((prevValues: any) => ({
//                               ...prevValues,
//                               [key]: currentValue,
//                             }));
//                             handleInputChange(key, currentValue, type);
//                           }}
//                         />
//                         <div
//                           style={{
//                             paddingTop: '8px',
//                             display: 'flex',
//                             justifyContent: 'flex-end',
//                           }}
//                         >
//                           <ButtonStrip>
//                             <Button
//                               primary
//                               disabled={
//                                 !inputValues[key] ||
//                                 inputValues[key] === prevInputValues[key]
//                               }
//                               onClick={() => {
//                                 setPrevInputValues((prev: any) => ({
//                                   ...prev,
//                                   [key]: inputValues[key],
//                                 }));
//                                 handleAdditionalFilters();
//                                 setOpenDropdownKey(null);
//                               }}
//                             >
//                               Update
//                             </Button>
//                             <Button
//                               disabled={!inputValues[key]}
//                               onClick={() => {
//                                 setInputValues((prevValues: any) => ({
//                                   ...prevValues,
//                                   [key]: '',
//                                 }));
//                                 setPrevInputValues((prevValues: any) => ({
//                                   ...prevValues,
//                                   [key]: '',
//                                 }));
//                                 // Remove the filter for this key
//                                 const filteredFilters =
//                                   dataQueryFiltersState.filter(
//                                     (f: { attribute: any }) =>
//                                       f.attribute !== key
//                                   );
//                                 setDataQueryFiltersState(filteredFilters);
//                                 setTempDataQueryFiltersState(filteredFilters);
//                                 setOpenDropdownKey(null);
//                               }}
//                             >
//                               Reset
//                             </Button>
//                           </ButtonStrip>
//                         </div>
//                       </div>
//                     </FlyoutMenu>
//                   </div>
//                 }
//               >
//                 {label} {prevInputValues[key] && ':'} {prevInputValues[key]}
//                 {prevInputValues[key] && (
//                   <span
//                     onClick={(event) => {
//                       event.stopPropagation();
//                       // Clear the input value for this key
//                       setInputValues((prevValues: any) => ({
//                         ...prevValues,
//                         [key]: '',
//                       }));
//                       setPrevInputValues((prevValues: any) => ({
//                         ...prevValues,
//                         [key]: '',
//                       }));
//                       // Remove the filter for this key
//                       const filteredFilters = dataQueryFiltersState.filter(
//                         (f: { attribute: any }) => f.attribute !== key
//                       );
//                       setDataQueryFiltersState(filteredFilters);
//                       setTempDataQueryFiltersState(filteredFilters);
//                     }}
//                     style={{ display: 'inline-flex', alignItems: 'center' }}
//                   >
//                     <ClearIcon className="my-icon-class" />
//                   </span>
//                 )}
//               </DropdownButton>
//             );
//           }
//         )}
//         {/* </div>
//       )} */}
//         <div
//           style={{
//             display: 'flex',
//             gap: '10px',
//           }}
//         >
//           <Button onClick={() => setShowAllFilters(!showAllFilters)}>
//             {showAllFilters ? 'Less Filters' : 'More Filters'}
//           </Button>
//         </div>
//       </div>
//     </DataTableToolbar>
//   );
// };

// export function formatDateForDisplay(
//   dateString: string | null | undefined
// ): string {
//   if (!dateString || dateString === 'dd-mm-yyyy') return 'dd-mm-yyyy';

//   try {
//     const parsedDate = parseISO(dateString);
//     if (!isValid(parsedDate)) return 'dd-mm-yyyy';
//     return format(parsedDate, 'dd-MM-yyyy');
//   } catch {
//     return 'dd-mm-yyyy';
//   }
// }

import {
  Button,
  ButtonStrip,
  Calendar,
  DataTableToolbar,
  DropdownButton,
  FlyoutMenu,
  InputField,
  SingleSelectField,
  SingleSelectOption,
} from '@dhis2/ui';
import React, { memo, useState } from 'react';
import { OrgUnitFormField } from '../org-unit-form-field.component';
import type { SelectedOrgUnit } from '../../models/selected-org-unit.model';
import {
  calendarSelectionValue,
  isValidCalendarDate,
  isValidFilterValue,
} from '../../utils/filter-value-utils';

type FilterDefinition = {
  key: string;
  label: string;
  valueType?: string;
  type?: string;
  options?: { options?: Array<{ key?: string; code: string; name: string }> };
};

type ActiveMenu = 'orgUnit' | 'enrollment' | string | null;

// Each menu is controlled. Only inner clicks are stopped: global keyboard,
// focus and calendar navigation events should continue to work normally.
const MenuContent = ({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) => (
  <div
    onClick={(event) => event.stopPropagation()}
    onMouseDown={(event) => event.stopPropagation()}
  >
    <FlyoutMenu maxWidth="90vw">
      <div
        className={`line-list-filter-menu${
          wide ? ' line-list-filter-menu--datetime' : ''
        }`}
      >
        {children}
      </div>
    </FlyoutMenu>
  </div>
);

/** Keep the calendar embedded in the flyout to avoid nested popover dismissal. */
const CalendarSelection = ({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (value: string) => void;
}) => (
  <Calendar
    calendar="gregory"
    locale="en-GB"
    timeZone="Africa/Dar_es_Salaam"
    date={value && isValidCalendarDate(value) ? value : undefined}
    onDateSelect={(selection: any) => {
      const selected = calendarSelectionValue(selection);
      if (selected) onSelect(selected);
    }}
  />
);

const ReadOnlyCalendarSelection = ({
  label,
  value,
  onSelect,
}: {
  label: string;
  value?: string;
  onSelect: (value: string) => void;
}) => (
  <div className="line-list-readonly-date">
    <InputField
      label={label}
      value={value ?? ''}
      readOnly
      helpText="Choose a date from the calendar below."
    />
    <CalendarSelection value={value} onSelect={onSelect} />
  </div>
);

// Stable option arrays avoid recreating 84 select options whenever a filter renders.
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, value) =>
  String(value).padStart(2, '0')
);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, value) =>
  String(value).padStart(2, '0')
);

/** A focusable clear action that does not toggle its parent DropdownButton. */
const ClearControl = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => (
  <span
    className="line-list-filter-clear"
    role="button"
    tabIndex={0}
    title={`Clear ${label} filter`}
    aria-label={`Clear ${label} filter`}
    onMouseDown={(event) => event.stopPropagation()}
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    }}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }
    }}
  >
    <span aria-hidden="true">×</span>
  </span>
);

/** Visible values are human-readable; raw option codes still drive the query. */
const displayDate = (value: string): string => {
  const date = value.slice(0, 10);
  if (!isValidCalendarDate(date)) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
};

const displayAppliedValue = (
  definition: FilterDefinition,
  applied: string
): string => {
  if (definition.options?.options?.length) {
    return (
      definition.options.options.find((option) => option.code === applied)
        ?.name ?? applied
    );
  }
  if (definition.valueType === 'DATE') return displayDate(applied);
  if (definition.valueType === 'DATETIME') {
    const time = /^\d{2}:\d{2}$/.test(applied.slice(11, 16))
      ? applied.slice(11, 16)
      : '';
    return `${displayDate(applied)}${time ? ` · ${time}` : ''}`;
  }
  return applied;
};

const AppliedFilterLabel = ({
  label,
  value,
  tooltip,
  onClear,
}: {
  label: string;
  value?: string;
  tooltip?: string;
  onClear: () => void;
}) => (
  <span
    className={`line-list-filter-trigger${
      value ? ' line-list-filter-trigger--applied' : ''
    }`}
  >
    <span className="line-list-filter-trigger-label" title={label}>
      {label}
    </span>
    {value && (
      <>
        <span
          className="line-list-filter-value"
          title={tooltip ?? `${label}: ${value}`}
        >
          {value}
        </span>
        <ClearControl label={label} onClick={onClear} />
      </>
    )}
  </span>
);

export const FilterToolbar = memo(
  ({ orgUnit, dates, filters }: any) => {
    const {
      customOrgUnitRoots,
      allowMultipleOrgUnits,
      appliedOrgUnits: appliedOrgUnitsProp,
      selectedOrgUnits: selectedOrgUnitsProp,
      setAppliedOrgUnits,
      setSelectedOrgUnits,
      orgUnitLabel,
      handleOrgUnitFilter,
      appliedOrgUnitMode,
      selectedOrgUnitMode,
      defaultOrgUnitMode,
      setSelectedOrgUnitMode,
      handleOrgUnitModeReset,
    } = orgUnit;
    const {
      startDateState,
      endDateState,
      tempStartDateState,
      tempEndDateState,
      setTempStartDateState,
      setTempEndDateState,
      showEnrollmentDates,
      handleEnrollmentDatesApply,
    } = dates;
    const {
      visibleFilters,
      dateStates,
      setDateStates,
      inputValues,
      setInputValues,
      prevDateStates,
      setPrevDateStates,
      prevInputValues,
      setPrevInputValues,
      handleApplyFilter,
      handleClearFilter,
      showAllFilters,
      setShowAllFilters,
    } = filters;

    const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
    const toggle = (key: string) =>
      setActiveMenu((current) => (current === key ? null : key));
    const selectedOrgUnits = (selectedOrgUnitsProp ?? []) as SelectedOrgUnit[];
    const appliedOrgUnits = (appliedOrgUnitsProp ?? []) as SelectedOrgUnit[];
    const orgUnitsChanged =
      selectedOrgUnits.length !== appliedOrgUnits.length ||
      selectedOrgUnits.some(
        (selected) =>
          !appliedOrgUnits.some((applied) => applied.id === selected.id)
      );
    const canUpdateOrgUnits =
      selectedOrgUnits.length > 0 &&
      (orgUnitsChanged || selectedOrgUnitMode !== appliedOrgUnitMode);
    const canResetOrgUnits =
      selectedOrgUnits.length > 0 ||
      appliedOrgUnits.length > 0 ||
      selectedOrgUnitMode !== defaultOrgUnitMode ||
      appliedOrgUnitMode !== defaultOrgUnitMode;
    const orgLabel = appliedOrgUnits.map((unit) => unit.displayName).join(', ');

    const clearFilter = (key: string) => {
      setDateStates((previous: Record<string, string>) => ({
        ...previous,
        [key]: '',
      }));
      setInputValues((previous: Record<string, string>) => ({
        ...previous,
        [key]: '',
      }));
      setPrevDateStates((previous: Record<string, string>) => ({
        ...previous,
        [key]: '',
      }));
      setPrevInputValues((previous: Record<string, string>) => ({
        ...previous,
        [key]: '',
      }));
      handleClearFilter(key);
      setActiveMenu(null);
    };

    const applyFilter = (definition: FilterDefinition, value: string) => {
      if (!isValidFilterValue(value, definition.valueType ?? 'TEXT')) return;
      handleApplyFilter(
        definition.key,
        value,
        definition.type,
        definition.valueType,
        Boolean(definition.options?.options?.length)
      );
      if (
        definition.valueType === 'DATE' ||
        definition.valueType === 'DATETIME'
      ) {
        setPrevDateStates((previous: Record<string, string>) => ({
          ...previous,
          [definition.key]: value,
        }));
      } else {
        setPrevInputValues((previous: Record<string, string>) => ({
          ...previous,
          [definition.key]: value,
        }));
      }
      setActiveMenu(null);
    };

    const renderFilter = (definition: FilterDefinition) => {
      const { key, label, valueType = 'TEXT', options } = definition;
      const isDate = valueType === 'DATE';
      const isDateTime = valueType === 'DATETIME';
      const hasOptions = Boolean(options?.options?.length);
      const value =
        (isDate || isDateTime ? dateStates[key] : inputValues[key]) ?? '';
      const applied =
        (isDate || isDateTime ? prevDateStates[key] : prevInputValues[key]) ??
        '';
      const changed = value !== applied;
      const valid = isValidFilterValue(value, valueType);
      const filterHasValue = Boolean(applied);
      const update = (
        <div className="line-list-filter-actions">
          <ButtonStrip>
            <Button
              primary
              disabled={!valid || !changed}
              onClick={() => applyFilter(definition, value)}
            >
              Update
            </Button>
            <Button
              disabled={!value && !applied}
              onClick={() => clearFilter(key)}
            >
              Reset
            </Button>
          </ButtonStrip>
        </div>
      );

      return (
        <DropdownButton
          key={key}
          name={`filter-${key}`}
          open={activeMenu === key}
          onClick={() => toggle(key)}
          component={
            <MenuContent wide={isDateTime}>
              {isDate || isDateTime ? (
                <>
                  {isDateTime ? (
                    <div className="line-list-datetime-layout">
                      <div className="line-list-datetime-calendar">
                        <span className="line-list-datetime-section-label">
                          Choose a date
                        </span>
                        <CalendarSelection
                          value={value.slice(0, 10)}
                          onSelect={(selected) => {
                            const time = `${value.slice(11, 16) || '00:00'}:00`;
                            setDateStates(
                              (previous: Record<string, string>) => ({
                                ...previous,
                                [key]: `${selected}T${time}`,
                              })
                            );
                          }}
                        />
                      </div>
                      <div className="line-list-datetime-details">
                        <InputField
                          label="Selected date"
                          value={
                            isValidCalendarDate(value.slice(0, 10))
                              ? value.slice(0, 10)
                              : ''
                          }
                          readOnly
                          placeholder="Select from calendar"
                        />
                        <div className="line-list-time-control">
                          <span className="line-list-time-label">
                            Time (24-hour clock)
                          </span>
                          <div className="line-list-time-selectors">
                            <SingleSelectField
                              selected={value.slice(11, 13) || '00'}
                              disabled={
                                !isValidCalendarDate(value.slice(0, 10))
                              }
                              onChange={({
                                selected,
                              }: {
                                selected: string;
                              }) => {
                                if (!/^([01]\d|2[0-3])$/.test(selected)) return;
                                setDateStates(
                                  (previous: Record<string, string>) => ({
                                    ...previous,
                                    [key]: `${value.slice(0, 10)}T${selected}:${
                                      value.slice(14, 16) || '00'
                                    }:00`,
                                  })
                                );
                              }}
                            >
                              {HOUR_OPTIONS.map((hour) => (
                                <SingleSelectOption
                                  key={hour}
                                  label={hour}
                                  value={hour}
                                />
                              ))}
                            </SingleSelectField>
                            <span aria-hidden="true">:</span>
                            <SingleSelectField
                              selected={value.slice(14, 16) || '00'}
                              disabled={
                                !isValidCalendarDate(value.slice(0, 10))
                              }
                              onChange={({
                                selected,
                              }: {
                                selected: string;
                              }) => {
                                if (!/^[0-5]\d$/.test(selected)) return;
                                setDateStates(
                                  (previous: Record<string, string>) => ({
                                    ...previous,
                                    [key]: `${value.slice(0, 10)}T${
                                      value.slice(11, 13) || '00'
                                    }:${selected}:00`,
                                  })
                                );
                              }}
                            >
                              {MINUTE_OPTIONS.map((minute) => (
                                <SingleSelectOption
                                  key={minute}
                                  label={minute}
                                  value={minute}
                                />
                              ))}
                            </SingleSelectField>
                          </div>
                        </div>
                        <p className="line-list-datetime-hint">
                          <strong>Search uses the date only.</strong> Time is
                          retained for display, but is not sent to DHIS2.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ReadOnlyCalendarSelection
                      label={label}
                      value={
                        isValidCalendarDate(value.slice(0, 10))
                          ? value.slice(0, 10)
                          : ''
                      }
                      onSelect={(selected) => {
                        setDateStates((previous: Record<string, string>) => ({
                          ...previous,
                          [key]: selected,
                        }));
                      }}
                    />
                  )}
                </>
              ) : hasOptions ? (
                <SingleSelectField
                  selected={value}
                  placeholder={label}
                  onChange={({ selected }: { selected: string }) =>
                    setInputValues((previous: Record<string, string>) => ({
                      ...previous,
                      [key]: selected ?? '',
                    }))
                  }
                >
                  {(options?.options ?? []).map((option) => (
                    <SingleSelectOption
                      key={option.key ?? option.code}
                      label={option.name}
                      value={option.code}
                    />
                  ))}
                </SingleSelectField>
              ) : (
                <InputField
                  placeholder={label}
                  value={value}
                  type={
                    valueType === 'INTEGER' || valueType === 'NUMBER'
                      ? 'number'
                      : 'text'
                  }
                  onChange={({ value: nextValue }: { value: string }) =>
                    setInputValues((previous: Record<string, string>) => ({
                      ...previous,
                      [key]: nextValue ?? '',
                    }))
                  }
                />
              )}
              {update}
            </MenuContent>
          }
        >
          <AppliedFilterLabel
            label={label}
            value={
              filterHasValue
                ? displayAppliedValue(definition, applied)
                : undefined
            }
            tooltip={
              isDateTime && filterHasValue
                ? `${label}: ${applied}. Only the date is used in the DHIS2 search.`
                : undefined
            }
            onClear={() => clearFilter(key)}
          />
        </DropdownButton>
      );
    };

    return (
      <DataTableToolbar className="table-top-toolbar">
        <div className="line-list-toolbar-content">
          <DropdownButton
            name="org-unit-filter"
            open={activeMenu === 'orgUnit'}
            onClick={() => toggle('orgUnit')}
            component={
              <MenuContent>
                {activeMenu === 'orgUnit' && (
                  <div className="line-list-org-unit-picker">
                    <OrgUnitFormField
                      customOrgUnitRoots={customOrgUnitRoots}
                      multiple={allowMultipleOrgUnits}
                      selectedPaths={selectedOrgUnits.map((unit) => unit.path)}
                      onSelectOrgUnit={(unit: any) => {
                        if (!allowMultipleOrgUnits) {
                          setSelectedOrgUnits([unit]);
                          return;
                        }
                        const paths: string[] = unit.selected ?? [];
                        const units = selectedOrgUnits.filter((chosen) => paths.includes(chosen.path)
                        );
                        if (paths.includes(unit.path) &&
                          !units.some((chosen) => chosen.id === unit.id))
                          units.push(unit);
                        setSelectedOrgUnits(units);
                      } } key={''}                    />
                    <span>Mode:</span>
                    <SingleSelectField
                      selected={selectedOrgUnitMode}
                      helpText={`Default mode: ${defaultOrgUnitMode}`}
                      onChange={({ selected }: { selected: string }) =>
                        setSelectedOrgUnitMode(selected)
                      }
                    >
                      {(['DESCENDANTS', 'SELECTED', 'CHILDREN'] as const).map(
                        (mode) => (
                          <SingleSelectOption
                            key={mode}
                            label={mode}
                            value={mode}
                          />
                        )
                      )}
                    </SingleSelectField>
                  </div>
                )}
                <div className="line-list-filter-actions">
                  <ButtonStrip>
                    <Button
                      primary
                      disabled={!canUpdateOrgUnits}
                      onClick={() => {
                        handleOrgUnitFilter();
                        setActiveMenu(null);
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      disabled={!canResetOrgUnits}
                      onClick={() => {
                        setSelectedOrgUnits([]);
                        setAppliedOrgUnits([]);
                        handleOrgUnitModeReset();
                        setActiveMenu(null);
                      }}
                    >
                      Reset
                    </Button>
                  </ButtonStrip>
                </div>
              </MenuContent>
            }
          >
            <AppliedFilterLabel
              label={orgUnitLabel || 'Registering unit'}
              value={orgLabel || undefined}
              onClear={() => {
                setSelectedOrgUnits([]);
                setAppliedOrgUnits([]);
                handleOrgUnitModeReset();
                setActiveMenu(null);
              }}
            />
          </DropdownButton>

          {showEnrollmentDates && (
            <DropdownButton
              name="enrollment-date-filter"
              open={activeMenu === 'enrollment'}
              onClick={() => toggle('enrollment')}
              component={
                <MenuContent>
                  <div className="line-list-enrollment-dates">
                    <ReadOnlyCalendarSelection
                      label="Start date"
                      value={tempStartDateState}
                      onSelect={setTempStartDateState}
                    />
                    <span aria-hidden="true">to</span>
                    <ReadOnlyCalendarSelection
                      label="End date"
                      value={tempEndDateState}
                      onSelect={setTempEndDateState}
                    />
                  </div>
                  <div className="line-list-filter-actions">
                    <ButtonStrip>
                      <Button
                        primary
                        disabled={
                          Boolean(
                            (tempStartDateState &&
                              !isValidCalendarDate(tempStartDateState)) ||
                              (tempEndDateState &&
                                !isValidCalendarDate(tempEndDateState)) ||
                              (tempStartDateState &&
                                tempEndDateState &&
                                tempStartDateState > tempEndDateState)
                          ) ||
                          (tempStartDateState === startDateState &&
                            tempEndDateState === endDateState)
                        }
                        onClick={() => {
                          handleEnrollmentDatesApply(
                            tempStartDateState,
                            tempEndDateState
                          );
                          setActiveMenu(null);
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        disabled={
                          !startDateState &&
                          !endDateState &&
                          !tempStartDateState &&
                          !tempEndDateState
                        }
                        onClick={() => {
                          setTempStartDateState(undefined);
                          setTempEndDateState(undefined);
                          handleEnrollmentDatesApply(undefined, undefined);
                          setActiveMenu(null);
                        }}
                      >
                        Reset
                      </Button>
                    </ButtonStrip>
                  </div>
                </MenuContent>
              }
            >
              <AppliedFilterLabel
                label="Enrollment dates"
                value={
                  startDateState || endDateState
                    ? `${
                        startDateState ? displayDate(startDateState) : 'Any'
                      } – ${endDateState ? displayDate(endDateState) : 'Any'}`
                    : undefined
                }
                onClear={() => {
                  setTempStartDateState(undefined);
                  setTempEndDateState(undefined);
                  handleEnrollmentDatesApply(undefined, undefined);
                  setActiveMenu(null);
                }}
              />
            </DropdownButton>
          )}

          {(visibleFilters ?? []).map((definition: FilterDefinition) =>
            renderFilter(definition)
          )}
          <Button onClick={() => setShowAllFilters(!showAllFilters)}>
            {showAllFilters ? 'Less Filters' : 'More Filters'}
          </Button>
        </div>
      </DataTableToolbar>
    );
  },
  (before, after) => {
    // Parent recreates its three configuration objects on each render. Compare
    // their visual dependencies instead of their object/function identities so
    // loading-state changes do not rerender every input and its date-picker DOM.
    const same = (a: any, b: any, fields: string[]) =>
      fields.every((field) => a[field] === b[field]);
    return (
      same(before['orgUnit'], after['orgUnit'], [
        'selectedOrgUnits',
        'appliedOrgUnits',
        'selectedOrgUnitMode',
        'appliedOrgUnitMode',
        'customOrgUnitRoots',
        'allowMultipleOrgUnits',
        'defaultOrgUnitMode',
        'orgUnitLabel',
      ]) &&
      same(before['dates'], after['dates'], [
        'startDateState',
        'endDateState',
        'tempStartDateState',
        'tempEndDateState',
        'showEnrollmentDates',
      ]) &&
      same(before['filters'], after['filters'], [
        'visibleFilters',
        'dateStates',
        'inputValues',
        'prevDateStates',
        'prevInputValues',
        'showAllFilters',
      ])
    );
  }
);

// Keep existing utility export for consumers; presentation only, never use for CalendarInput.date.
export function formatDateForDisplay(
  dateString: string | null | undefined
): string {
  if (!dateString || !isValidCalendarDate(dateString.slice(0, 10)))
    return 'dd-mm-yyyy';
  const [y, m, d] = dateString.slice(0, 10).split('-');
  return `${d}-${m}-${y}`;
}
