// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// import {
//   computed,
//   Directive,
//   EventEmitter,
//   inject,
//   input,
//   model,
//   NgZone,
//   Output,
//   Signal,
// } from '@angular/core';
// import { toObservable } from '@angular/core/rxjs-interop';
// import { FormGroup } from '@angular/forms';
// import {
//   Checkbox,
//   CircularLoader,
//   colors,
//   InputField,
//   MultiSelectField,
//   MultiSelectOption,
//   SingleSelectField,
//   SingleSelectOption,
//   TextAreaField,
//   Transfer,
// } from '@dhis2/ui';
// import {
//   D2Window,
//   DataFilterCondition,
//   DataQueryFilter,
//   DHIS2Event,
//   TrackedEntityInstance,
// } from '@iapps/d2-web-sdk';
// import React, { useEffect, useMemo, useState } from 'react';
// import * as ReactDOM from 'react-dom/client';
// import { filter, take } from 'rxjs';
// import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
// import { useFieldValidation } from '../hooks';
// // import { IFormField } from '../interfaces';
// // import { FieldConfig } from '../models';
// import { FileUploadField } from './file-upload-field.component';
// import { OrgUnitFormField } from './org-unit-form-field.component';
// import { CustomOrgUnitConfig } from '../models/org-unit.model';
// import { IFormField } from '../interfaces/form-field.interface';
// import { FieldConfig } from '../models/field-config.model';
// import { CoordinatePickerField } from './coordinate-field-component';
// import { NoticeBox } from '@dhis2/ui';
// import { InternationalPhoneField } from './phone-number-field.component';
// import {
//   DEFAULT_OPTIONS_PATH_CASCADE,
//   OptionsPathCascadeConfig,
//   OptionsPathCascadeConfigMap,
// } from '../types/field-cascade.types';
// import { FieldCascadeUtil } from '../utils/field-cascade.util';

// @Directive()
// export class BaseFormFieldComponent extends ReactWrapperModule {
//   ngZone = inject(NgZone);
//   fieldType = 'textbox';
//   field = input.required<IFormField<string>>();
//   fieldError = input<string | undefined>();
//   fieldConfig = input<FieldConfig>(new FieldConfig());
//   form = model.required<FormGroup>();
//   isValid = input<boolean>();
//   isValueAssigned = input<boolean>();
//   dataId = input<string>();
//   customOrgUnitRoots = input<CustomOrgUnitConfig[]>();
//   optionCascadeConfigs = input<OptionsPathCascadeConfig[]>();
//   optionCascadeConfigMap = input<OptionsPathCascadeConfigMap>(
//     {} as OptionsPathCascadeConfigMap
//   );
//   //TODO: FIND BETTER WAY TO PASS PROGRAM TO FIELDS i.e field extensions
//   program = input<string>();

//   value = model<string>();
//   protected value$ = toObservable(this.value);
//   protected isValueAssigned$ = toObservable(this.isValueAssigned);
//   protected fieldError$ = toObservable(this.fieldError);

//   label: Signal<string | undefined> = computed(() => {
//     return !this.fieldConfig()?.hideLabel ? this.field().label : undefined;
//   });

//   placeholder: Signal<string> = computed(() => {
//     return (
//       this.field()?.placeholder || `Enter ${this.field()?.label || 'value'}`
//     );
//   });

//   InputField = this.#getInputField();

//   @Output() update = new EventEmitter<{ form: FormGroup; value: any }>();
//   @Output() immediateUpdate = new EventEmitter<{
//     form: FormGroup;
//     value: any;
//   }>();

//   override async ngAfterViewInit() {
//     if (!this.elementRef) throw new Error('No element ref');
//     this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

//     this.component = this.InputField;
//     this.render();
//   }

//   #getInputField() {
//     return (): React.JSX.Element => {
//       const [value, setValue] = useState(
//         this.form().get(this.field().id)?.value ||
//           this.form().get(this.field().key)?.value
//       );
//       const [selected, setSelected] = useState();
//       const [touched, setTouched] = useState(false);
//       const [disabled, setDisabled] = useState<boolean>(
//         this.field()?.disabled ?? this.field()?.generated ?? false
//       );
//       const [initialError, setInitialError] = useState<string>();
//       const [recordExistError, setRecordExistError] = useState<
//         string | undefined
//       >();
//       const [checkingUniqueness, setCheckingUniqueness] = useState<boolean>();

//       useEffect(() => {
//         const isAssignedSubscription = this.isValueAssigned$
//           .pipe(filter((isValueAssigned) => isValueAssigned === true))
//           .subscribe({
//             next: () => {
//               const value =
//                 this.form().get(this.field().id)?.value ||
//                 this.form().get(this.field().key)?.value;
//               setValue(value);
//               setDisabled(true);
//               checkValueUniqueness();
//             },
//           });

//         return () => {
//           isAssignedSubscription.unsubscribe();
//         };
//       }, []);

//       // TODO: Review error handling as take() has potential to missed any other updated error information
//       useEffect(() => {
//         const fieldErrorSubscription = this.fieldError$
//           .pipe(
//             filter((error) => error !== initialError),
//             take(1)
//           )
//           .subscribe({
//             next: (error: string | undefined) => {
//               setInitialError(error);
//             },
//           });

//         return () => {
//           fieldErrorSubscription.unsubscribe();
//         };
//       }, [initialError]); // Add initialError as a dependency to avoid stale closures

//       const arrayValue = useMemo(() => {
//         if (value && value.length > 0) {
//           return value.split(',');
//         }

//         return [];
//       }, [value]);

//       const inputWidth = useMemo(() => {
//         if (
//           this.field().controlType === 'date' ||
//           this.field().controlType === 'date-time'
//         ) {
//           return '360px';
//         }

//         return this.fieldConfig()?.inputWidth;
//       }, []);

//       const { validationError, hasError } = useFieldValidation({
//         field: this.field(),
//         form: this.form(),
//         initialError,
//         recordExistError,
//         value,
//         touched,
//       });

//       const onValueChange = (value: unknown) => {
//         this.ngZone.run(() => {
//           (
//             this.form().get(this.field().id) ||
//             this.form().get(this.field().key)
//           )?.setValue(value);

//           this.update.emit({
//             form: this.form(),
//             value,
//           });
//         });

//         setValue(value);
//         setTouched(true);
//       };

//       const generateUUID = (): string => {
//         return (
//           globalThis.crypto?.randomUUID?.() ??
//           'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//             const r = (Math.random() * 16) | 0;
//             const v = c === 'x' ? r : (r & 0x3) | 0x8;
//             return v.toString(16);
//           })
//         );
//       };

//       const checkValueUniqueness = async () => {
//         if (
//           this.field().unique ||
//           ((this.field().extension?.isDataElementUnique ?? false) &&
//             value &&
//             value.length > 0 &&
//             touched)
//         ) {
//           setCheckingUniqueness(true);
//           setRecordExistError(undefined);
//           try {
//             const isDuplicate = await this.searchForDuplicates(value);

//             setCheckingUniqueness(false);

//             if (isDuplicate) {
//               const customError = `Record with this ${this.label()} is already registered`;
//               (
//                 this.form().controls[this.field().id] ||
//                 this.form().controls[this.field().key]
//               )?.setErrors({
//                 customError,
//               });
//               setRecordExistError(customError);
//             }
//           } catch (e) {
//             setCheckingUniqueness(false);
//             setRecordExistError(undefined);
//           }
//         }
//       };

//       const formFieldContent = () => {
//         switch (this.field().controlType) {
//           case 'number':
//             return (
//               <InputField
//                 error={hasError}
//                 validationText={validationError}
//                 type={this.field().type as any}
//                 inputWidth={inputWidth}
//                 required={this.field().required}
//                 name={this.field().id}
//                 label={this.label()}
//                 min={this.field().min?.toString()}
//                 max={this.field().max?.toString()}
//                 placeholder={this.placeholder()}
//                 value={value}
//                 readOnly={disabled}
//                 onChange={(event: any) => {
//                   onValueChange(event.value);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//               />
//             );
//           case 'tel':
//             return (
//               <InternationalPhoneField
//                 name={this.field().id}
//                 label={this.label()}
//                 placeholder={this.placeholder()}
//                 value={value ?? ''}
//                 required={this.field().required}
//                 disabled={disabled}
//                 error={hasError}
//                 validationText={validationError}
//                 inputWidth={this.fieldConfig()?.inputWidth}
//                 defaultCountryIsoCode="TZ"
//                 onChange={(localNumber: string) => {
//                   onValueChange(localNumber);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//               />
//             );
//           case 'coordinate':
//             return (
//               <div
//                 style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
//               >
//                 <NoticeBox title="Location capture required">
//                   <p style={{ margin: 0 }}>
//                     This field requires selecting the exact geographic location
//                     on the map.
//                   </p>
//                   <ul
//                     style={{ margin: '6px 0 0 18px', padding: 0, fontSize: 13 }}
//                   >
//                     <li>
//                       Click <strong>“Pick location on map”</strong> to open the
//                       street map.
//                     </li>
//                     <li>
//                       Pan and zoom until you locate the correct facility,
//                       building, house or area.
//                     </li>
//                     <li>
//                       Click once on the map to place or move the marker
//                       accurately.
//                     </li>
//                     <li>
//                       Click <strong>“Use Selected Location”</strong> to save the
//                       coordinates.
//                     </li>
//                   </ul>
//                 </NoticeBox>

//                 <CoordinatePickerField
//                   error={hasError}
//                   validationText={validationError}
//                   required={this.field().required}
//                   name={this.field().id}
//                   disabled={disabled}
//                   label={this.label()}
//                   value={value}
//                   onChange={(newValue: string | null) => {
//                     onValueChange(newValue);
//                   }}
//                   onBlur={() => {
//                     checkValueUniqueness();
//                   }}
//                 />
//               </div>
//             );
//           case 'textarea':
//             return (
//               <TextAreaField
//                 error={hasError}
//                 validationText={validationError}
//                 inputWidth={this.fieldConfig()?.inputWidth}
//                 required={this.field().required}
//                 name={this.field().id}
//                 disabled={disabled}
//                 label={this.label()}
//                 rows={5}
//                 placeholder={this.placeholder()}
//                 value={value}
//                 onChange={(event: any) => {
//                   onValueChange(event.value);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//               />
//             );
//           case 'org-unit': {
//             return (
//               <OrgUnitFormField
//                 label={this.label()}
//                 key={this.field().id}
//                 field={this.field().id}
//                 required={this.field().required}
//                 disabled={disabled}
//                 customOrgUnitRoots={this.customOrgUnitRoots()}
//                 onSelectOrgUnit={(selectedOrgUnit: string) => {
//                   onValueChange(selectedOrgUnit);
//                 }}
//                 selected={value}
//               />
//             );
//           }
//           case 'transfer':
//             return (
//               <Transfer
//                 filterable
//                 filterPlaceholder="Search"
//                 selected={selected}
//                 leftHeader={
//                   <div
//                     style={{
//                       fontSize: 14,
//                       padding: '8px 4px',
//                     }}
//                   >
//                     {this.field().availableOptionsLabel}
//                   </div>
//                 }
//                 rightHeader={
//                   <div
//                     style={{
//                       fontSize: 14,
//                       padding: '8px 4px',
//                     }}
//                   >
//                     {this.field().selectedOptionsLabel}
//                   </div>
//                 }
//                 options={this.field().options}
//                 onChange={(event: any) => {
//                   onValueChange(event.selected);
//                 }}
//               />
//             );
//           case 'checkbox':
//             return (
//               <Checkbox
//                 checked={Boolean(value)}
//                 error={hasError}
//                 label={this.label()}
//                 name={this.field().id}
//                 disabled={disabled}
//                 onChange={(event: any) => {
//                   onValueChange(event.checked);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//               />
//             );
//           case 'dropdown':
//             return (
//               <SingleSelectField
//                 filterable={(this.field().options || []).length > 5}
//                 clearable
//                 error={hasError}
//                 validationText={validationError}
//                 inputWidth={this.fieldConfig()?.inputWidth}
//                 disabled={disabled}
//                 required={this.field().required}
//                 className="select"
//                 label={this.label()}
//                 selected={value}
//                 onChange={(event: any) => {
//                   onValueChange(event.selected);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//               >
//                 {(this.field().options || []).map((option) => (
//                   <SingleSelectOption
//                     key={generateUUID()}
//                     label={option.label}
//                     value={option.value}
//                   />
//                 ))}
//               </SingleSelectField>
//             );
//           case 'multi-dropdown':
//             return (
//               <MultiSelectField
//                 clearText="Clear"
//                 clearable
//                 empty="No data found"
//                 filterable={(this.field().options || []).length > 5}
//                 filterPlaceholder="Type to filter options"
//                 error={hasError}
//                 validationText={validationError}
//                 inputWidth={this.fieldConfig()?.inputWidth}
//                 disabled={disabled}
//                 label={this.label()}
//                 required={this.field().required}
//                 loadingText="Loading options"
//                 noMatchText="No options found"
//                 onChange={(event: { selected: string[] }) => {
//                   const selectedValue = (event.selected || []).join(',');
//                   onValueChange(selectedValue);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//                 selected={arrayValue}
//               >
//                 {(this.field().options || []).map((option) => (
//                   <MultiSelectOption
//                     key={generateUUID()}
//                     label={option.label}
//                     value={option.value}
//                   />
//                 ))}
//               </MultiSelectField>
//             );
//           // case 'date':
//           // case 'date-time':
//           //   return (
//           //     <InputField
//           //       error={hasError}
//           //       validationText={validationError}
//           //       type={this.field().type as any}
//           //       inputWidth={inputWidth}
//           //       required={this.field().required}
//           //       name={this.field().id}
//           //       label={this.label()}
//           //       min={this.field().min?.toString()}
//           //       max={this.field().max?.toString()}
//           //       placeholder={this.placeholder()}
//           //       value={value}
//           //       readOnly={disabled}
//           //       onChange={(event: any) => {
//           //         onValueChange(event.value);
//           //       }}
//           //       onBlur={() => {
//           //         checkValueUniqueness();
//           //       }}
//           //     />
//           //   );
//           case 'date':
//           case 'date-time': {
//             const field = this.field();
//             const isDateTimeField = field.type === 'date-time';

//             const inputType: any = isDateTimeField ? 'datetime-local' : 'date';

//             // Value coming from DHIS2 store
//             const htmlValue = this.formatValueForHtmlInputFromDhis(
//               value,
//               isDateTimeField
//             );

//             const htmlMin = field.min
//               ? this.formatValueForHtmlInputFromDhis(
//                   String(field.min),
//                   isDateTimeField
//                 )
//               : undefined;

//             // Max defined in metadata (if any)
//             const metadataMax = field.max
//               ? this.formatValueForHtmlInputFromDhis(
//                   String(field.max),
//                   isDateTimeField
//                 )
//               : undefined;

//             // System max = “now” (no future allowed)
//             const systemMax = this.getNowForHtmlDateInput(isDateTimeField);

//             // Effective max = earliest of metadataMax and systemMax
//             const htmlMax = this.pickEarlierDateLimit(metadataMax, systemMax);

//             return (
//               <InputField
//                 error={hasError}
//                 validationText={validationError}
//                 type={inputType}
//                 inputWidth={inputWidth}
//                 required={field.required}
//                 name={field.id}
//                 label={this.label()}
//                 min={htmlMin}
//                 max={htmlMax}
//                 placeholder={this.placeholder()}
//                 value={htmlValue}
//                 readOnly={disabled}
//                 onChange={({ value: newValue }: { value: string }) => {
//                   const normalized = this.normalizeDateValueFromHtmlInput(
//                     newValue,
//                     isDateTimeField,
//                     true
//                   );

//                   onValueChange(normalized);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//               />
//             );
//           }

//           case 'file':
//             return (
//               <>
//                 <FileUploadField
//                   label={this.label()}
//                   id={this.field().id}
//                   hasError={hasError}
//                   required={this.field().required}
//                   validationText={validationError}
//                   performUpload={true}
//                   uploadUrl={'fileResources'}
//                   onUploadSuccess={(fileId: string) => {
//                     onValueChange(fileId);
//                   }}
//                   onRemoveFile={() => {
//                     onValueChange('');
//                   }}
//                   extension={this.field()?.extension}
//                   value={value}
//                   metaType={this.field().metaType}
//                   dataId={this.dataId()}
//                   program={this.program()}
//                 />
//               </>
//             );
//           default:
//             return (
//               <InputField
//                 error={hasError}
//                 validationText={validationError}
//                 type={this.field().type as any}
//                 inputWidth={inputWidth}
//                 required={this.field().required}
//                 name={this.field().id}
//                 label={this.label()}
//                 min={this.field().min?.toString()}
//                 max={this.field().max?.toString()}
//                 placeholder={this.placeholder()}
//                 value={value}
//                 readOnly={disabled}
//                 onChange={(event: any) => {
//                   onValueChange(event.value);
//                 }}
//                 onBlur={() => {
//                   checkValueUniqueness();
//                 }}
//               />
//             );
//         }
//       };

//       {
//         return (
//           <React.Fragment>
//             {formFieldContent()}
//             {checkingUniqueness && (
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 8,
//                   paddingTop: 8,
//                 }}
//               >
//                 <CircularLoader small />
//                 <div style={{ color: colors.grey800, fontSize: 14 }}>
//                   Checking...
//                 </div>
//               </div>
//             )}
//           </React.Fragment>
//         );
//       }
//     };
//   }

// ✅ DROP-IN REPLACEMENT: BaseFormFieldComponent (only the relevant changed parts)
// You can comment your existing #getInputField() implementation and paste this one.
//
// Notes:
// - Implements OPTIONS_PATH cascading using optionCascadeConfigMap (preferred) and falls back to optionCascadeConfigs.
// - Filters dropdown + multi-dropdown options using FieldCascadeUtil.
// - Disables child until parent selected (if configured).
// - Clears child value when parent changes (if configured) ONLY when current value is no longer valid.
// - Avoids generateUUID() for option keys (uses stable keys).
// - Keeps your existing “generated/disabled/isAssigned” semantics.

// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  computed,
  Directive,
  EventEmitter,
  inject,
  input,
  model,
  NgZone,
  Output,
  Signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import {
  Checkbox,
  CircularLoader,
  colors,
  InputField,
  MultiSelectField,
  MultiSelectOption,
  SingleSelectField,
  SingleSelectOption,
  TextAreaField,
  Transfer,
  NoticeBox,
  IconInfo16,
  Button,
} from '@dhis2/ui';
import {
  D2Window,
  DataFilterCondition,
  DataQueryFilter,
  DHIS2Event,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { filter, take } from 'rxjs';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { useFieldValidation } from '../hooks';
import {
  CoordinatePickerField,
  CoordinatePickerGeoConfig,
} from './coordinate-field-component';
import { FileUploadField } from './file-upload-field.component';
import { InternationalPhoneField } from './phone-number-field.component';
import { OrgUnitFormField } from './org-unit-form-field.component';
import { IFormField } from '../interfaces/form-field.interface';
import { FieldConfig } from '../models/field-config.model';
import { CustomOrgUnitConfig } from '../models/org-unit.model';
import {
  DEFAULT_OPTIONS_PATH_CASCADE,
  OptionsPathCascadeConfig,
  OptionsPathCascadeConfigMap,
} from '../models/field-cascade.types';
import { FieldCascadeUtil } from '../utils/field-cascade.util';
import { Legend } from '@dhis2/ui';
import { FieldSet } from '@dhis2/ui';
import { FormFieldLabel } from './form-field-label';

@Directive()
export class BaseFormFieldComponent extends ReactWrapperModule {
  private readonly ngZone = inject(NgZone);

  fieldType = 'textbox';

  field = input.required<IFormField<string>>();
  fieldError = input<string | undefined>();
  fieldConfig = input<FieldConfig>(new FieldConfig());
  programRuleOptions = input<any[] | undefined>();
  runtimeOptions = input<any[] | undefined>();
  form = model.required<FormGroup>();

  // kept for compatibility (even if not used directly here)
  isValid = input<boolean>();
  isValueAssigned = input<boolean>();
  dataId = input<string>();
  customOrgUnitRoots = input<CustomOrgUnitConfig[]>();

  // Cascade
  optionCascadeConfigs = input<OptionsPathCascadeConfig[]>([]);
  optionCascadeConfigMap = input<OptionsPathCascadeConfigMap>(
    {} as OptionsPathCascadeConfigMap
  );
  coordinatePickerGeoConfig = input<CoordinatePickerGeoConfig>();
  fieldControlKeyById = input<Record<string, string>>({});

  // kept for compatibility (used by FileUploadField)
  program = input<string>();

  value = model<string>();
  protected readonly value$ = toObservable(this.value);
  protected readonly isValueAssigned$ = toObservable(this.isValueAssigned);
  protected readonly fieldError$ = toObservable(this.fieldError);
  protected readonly programRuleOptions$ = toObservable(
    this.programRuleOptions
  );
  protected readonly runtimeOptions$ = toObservable(this.runtimeOptions);

  readonly label: Signal<string | undefined> = computed(() => {
    const cfg = this.fieldConfig();
    const f = this.field();
    return cfg?.hideLabel ? undefined : f.label;
  });

  readonly placeholder: Signal<string> = computed(() => {
    const f = this.field();
    return f?.placeholder || `Enter ${f?.label || 'value'}`;
  });

  InputField = this.#getInputField();

  @Output() update = new EventEmitter<{ form: FormGroup; value: any }>();
  @Output() immediateUpdate = new EventEmitter<{
    form: FormGroup;
    value: any;
  }>();
  @Output() runtimeOptionsChange = new EventEmitter<{
    field: IFormField<string>;
    options: any[];
  }>();

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    this.component = this.InputField;
    this.render();
  }

  // -------------------------------
  // Cascade helpers (UID -> control)
  // -------------------------------
  #resolveCascadeForCurrentField(): OptionsPathCascadeConfig | undefined {
    const f = this.field();
    const map = this.optionCascadeConfigMap?.() ?? ({} as any);

    const byId = f?.id ? map?.[f.id] : undefined;
    const byKey = f?.key ? map?.[f.key] : undefined;
    if (byId || byKey) return (byId || byKey) as OptionsPathCascadeConfig;

    const list = this.optionCascadeConfigs?.() ?? [];
    const id = f?.id;
    const key = f?.key;
    return list.find((c) => c?.fieldId === id || c?.fieldId === key);
  }

  #resolveControlName(fieldIdOrKey: string | undefined): string | null {
    if (!fieldIdOrKey) return null;
    const mapped = this.fieldControlKeyById?.()?.[fieldIdOrKey];
    return mapped ?? fieldIdOrKey;
  }

  #getControl(fg: FormGroup, fieldIdOrKey: string | undefined) {
    const name = this.#resolveControlName(fieldIdOrKey);
    return name ? fg.get(name) : null;
  }

  #getCurrentFieldControl(fg: FormGroup) {
    const f = this.field();
    return this.#getControl(fg, f?.id) || this.#getControl(fg, f?.key);
  }

  #getOptionKey(option: any): string {
    // Stable React key, avoids generateUUID re-mounting.
    return String(
      option?.value ?? option?.id ?? option?.code ?? option?.label ?? ''
    );
  }

  formatValueForHtmlInputFromDhis(
    rawValue: string | null | undefined,
    isDateTimeField: boolean
  ): string {
    if (rawValue == null) return '';

    const trimmed = String(rawValue).trim();
    if (!trimmed) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    if (!isDateTimeField) {
      // Already in HTML date format
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }

      // ISO-like datetime -> preserve calendar date portion directly
      const datePartMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T\s]/);
      if (datePartMatch) {
        return datePartMatch[1];
      }

      // Fallback parse only if needed
      const date = new Date(trimmed);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}`
      );
    }

    // Already in HTML datetime-local format
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // ISO-like datetime with optional seconds/timezone -> keep YYYY-MM-DDTHH:mm only
    const dateTimeMatch = trimmed.match(
      /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})/
    );
    if (dateTimeMatch) {
      return `${dateTimeMatch[1]}T${dateTimeMatch[2]}:${dateTimeMatch[3]}`;
    }

    const parsedDate = new Date(trimmed);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const year = parsedDate.getFullYear();
    const month = pad(parsedDate.getMonth() + 1);
    const day = pad(parsedDate.getDate());
    const hours = pad(parsedDate.getHours());
    const minutes = pad(parsedDate.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  pickEarlierDateLimit(
    metadataMax?: string,
    systemMax?: string
  ): string | undefined {
    if (!metadataMax && !systemMax) return undefined;
    if (!metadataMax) return systemMax;
    if (!systemMax) return metadataMax;

    return metadataMax < systemMax ? metadataMax : systemMax;
  }

  getNowForHtmlDateInput(isDateTimeField: boolean): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');

    const datePart =
      `${now.getFullYear()}-` +
      `${pad(now.getMonth() + 1)}-` +
      `${pad(now.getDate())}`;

    if (!isDateTimeField) {
      return datePart;
    }

    const timePart = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return `${datePart}T${timePart}`;
  }

  resolveHtmlMax(field: any, isDateTimeField: boolean): string | undefined {
    // When future dates are allowed, do not limit picker selection at all
    if (field.allowFutureDate === true) {
      return undefined;
    }

    const metadataMax = field.max
      ? this.formatValueForHtmlInputFromDhis(String(field.max), isDateTimeField)
      : undefined;

    const systemMax = this.getNowForHtmlDateInput(isDateTimeField);

    return this.pickEarlierDateLimit(metadataMax, systemMax);
  }

  #getInputField() {
    return (): React.JSX.Element | React.ReactElement | null => {
      const fg = this.form();
      const field = this.field();

      // Refs prevent stale closures in subscriptions
      const valueRef = useRef<string>('');
      const touchedRef = useRef(false);

      // State
      const [value, setValue] = useState<string>(() => {
        const ctrl = this.#getCurrentFieldControl(fg);
        const v = ctrl?.value;
        const s = v == null ? '' : String(v);
        valueRef.current = s;
        return s;
      });

      const [filteredOptions, setFilteredOptions] = useState<any[]>(
        () => field.options ?? []
      );
      const [selected, setSelected] = useState<any>();
      const [touched, setTouched] = useState(false);

      const baseDisabled =
        !!(field?.disabled ?? false) || !!(field?.generated ?? false);
      const [disabled, setDisabled] = useState<boolean>(baseDisabled);

      const [initialError, setInitialError] = useState<string>();
      const [recordExistError, setRecordExistError] = useState<
        string | undefined
      >();
      const [checkingUniqueness, setCheckingUniqueness] =
        useState<boolean>(false);

      useEffect(() => {
        const sub = this.programRuleOptions$.subscribe((options) => {
          if (!options) return;
          if (
            field.controlType !== 'dropdown' &&
            field.controlType !== 'multi-dropdown'
          ) {
            return;
          }

          const cascade = this.#resolveCascadeForCurrentField();

          if (cascade?.kind === 'OPTIONS_PATH') return;

          const nextOptions = options;
          setFilteredOptions(nextOptions);

          const currentCtrl = this.#getCurrentFieldControl(fg);
          const currentValue = String(currentCtrl?.value ?? '').trim();

          if (!currentValue) return;

          const stillValid = nextOptions.some((option: any) => {
            const optionValue = String(
              option?.value ?? option?.id ?? option?.code ?? option?.key ?? ''
            );
            return optionValue === currentValue;
          });

          if (!stillValid) {
            currentCtrl?.setValue(null, { emitEvent: true });
            setValue('');
          }
        });

        return () => sub.unsubscribe();
      }, []);

      useEffect(() => {
        const sub = this.runtimeOptions$.subscribe((options) => {
          if (!this.field().dependentField) return;
          if (!options) return;

          setFilteredOptions(options);

          const currentCtrl = this.#getCurrentFieldControl(fg);
          const currentValue = String(currentCtrl?.value ?? '').trim();

          if (!currentValue) return;

          const stillValid = options.some((option: any) => {
            const optionValue = String(
              option?.value ?? option?.code ?? option?.key ?? option?.id ?? ''
            );
            return optionValue === currentValue;
          });

          if (!stillValid) {
            currentCtrl?.setValue(null, { emitEvent: true });
            setValue('');
          }
        });

        return () => sub.unsubscribe();
      }, []);

      // Keep refs synced
      useEffect(() => {
        valueRef.current = value;
      }, [value]);

      useEffect(() => {
        touchedRef.current = touched;
      }, [touched]);

      // ----------------------------
      // Error stream: keep first new error
      // ----------------------------
      useEffect(() => {
        const sub = this.fieldError$
          .pipe(
            filter((error) => error !== initialError),
            take(1)
          )
          .subscribe({ next: (error) => setInitialError(error) });

        return () => sub.unsubscribe();
      }, [initialError]);

      // ----------------------------
      // Uniqueness checker (stable)
      // ----------------------------
      const checkValueUniqueness = async (rawValue?: string) => {
        const currentValue = (rawValue ?? valueRef.current ?? '').trim();

        const f = this.field();
        const isEligible =
          f.unique ||
          ((f.extension?.isDataElementUnique ?? false) &&
            currentValue.length > 0 &&
            touchedRef.current);

        if (!isEligible) return;

        setCheckingUniqueness(true);
        setRecordExistError(undefined);

        try {
          const isDuplicate = await this.searchForDuplicates(currentValue);
          setCheckingUniqueness(false);

          if (!isDuplicate) return;

          const customError = `Record with this ${this.label()} is already registered`;
          const ctrl =
            fg.controls[f.id] || (f.key ? fg.controls[f.key] : undefined);

          ctrl?.setErrors({ customError });
          setRecordExistError(customError);
        } catch {
          setCheckingUniqueness(false);
          setRecordExistError(undefined);
        }
      };

      // ----------------------------
      // Auto-assigned -> lock field + uniqueness check
      // ----------------------------
      useEffect(() => {
        const sub = this.isValueAssigned$
          .pipe(filter((v) => v === true))
          .subscribe({
            next: () => {
              const ctrl = this.#getCurrentFieldControl(fg);
              const v = ctrl?.value == null ? '' : String(ctrl.value);
              setValue(v);
              setDisabled(true);
              checkValueUniqueness(v);
            },
          });

        return () => sub.unsubscribe();
      }, []);

      // ----------------------------
      // Cascade wiring (parent -> child)
      // ----------------------------
      useEffect(() => {
        const cascade = this.#resolveCascadeForCurrentField();
        const dependentField = field.dependentField;

        if (dependentField) {
          const parentCtrl = this.#getControl(
            fg,
            dependentField.key || dependentField.id
          );

          if (!parentCtrl) {
            setFilteredOptions([]);
            setDisabled(baseDisabled);
            return undefined;
          }

          const parentOptions =
            dependentField.options?.length > 0
              ? dependentField.options
              : dependentField.optionSet?.options ?? [];

          const applyDependentOptions = (parentValue: any) => {
            const parentOption = parentOptions.find((option: any) => {
              const optionValue = option?.value ?? option?.code ?? option?.key;
              return optionValue === parentValue;
            });

            const nextOptions = parentOption?.options ?? [];
            const childCtrl = this.#getCurrentFieldControl(fg);
            const currentChildValue = String(childCtrl?.value ?? '').trim();

            if (currentChildValue) {
              const stillValid = nextOptions.some((option: any) => {
                const optionValue = String(
                  option?.value ?? option?.code ?? option?.key ?? ''
                );
                return optionValue === currentChildValue;
              });

              if (!stillValid) {
                childCtrl?.setValue(null, { emitEvent: true });
                setValue('');
              }
            }

            setFilteredOptions(nextOptions);
            this.ngZone.run(() => {
              this.runtimeOptionsChange.emit({
                field,
                options: nextOptions,
              });
            });
            setDisabled(baseDisabled || !parentValue);
          };

          applyDependentOptions(parentCtrl.value);

          const sub = parentCtrl.valueChanges.subscribe((value) =>
            applyDependentOptions(value)
          );

          return () => sub.unsubscribe();
        }

        if (!cascade || cascade.kind !== 'OPTIONS_PATH') {
          setFilteredOptions(field.options ?? []);
          setDisabled(baseDisabled);
          // return null;
          return undefined;
        }

        const parentCtrl = this.#getControl(fg, cascade.parentFieldId);
        const childCtrl = this.#getCurrentFieldControl(fg);

        if (!parentCtrl || !childCtrl) {
          setFilteredOptions(field.options ?? []);
          setDisabled(baseDisabled);
          // return null;
          return undefined;
        }

        const merged = { ...DEFAULT_OPTIONS_PATH_CASCADE, ...cascade };

        const applyCascade = (
          parentValue: any,
          reason: 'init' | 'parentChange'
        ) => {
          const parentStr = String(parentValue ?? '');

          // disable logic
          const cascadeDisable = FieldCascadeUtil.shouldDisableChildField(
            cascade,
            parentStr
          );
          setDisabled(baseDisabled || cascadeDisable);

          // filter options
          const nextOptions = FieldCascadeUtil.filterChildOptionsByParentPath(
            field.options ?? [],
            cascade,
            parentStr
          );

          // console.log("NOEW PARENT STR::: ", JSON.stringify(parentStr));
          // console.log("NOEW FIELD OPTIONS::: ", JSON.stringify(field.options));
          // console.log("NOEW PARENT CASCADE::: ", JSON.stringify(cascade));

          setFilteredOptions(nextOptions);

          // clear invalid child on parent change if configured
          if (merged.clearOnParentChange && reason === 'parentChange') {
            const currentChildValue = String(childCtrl.value ?? '').trim();
            if (currentChildValue) {
              const stillValid = nextOptions.some((o: any) => {
                const ov = String(o?.value ?? o?.id ?? '');
                return ov === currentChildValue;
              });

              if (!stillValid) {
                childCtrl.setValue(null, { emitEvent: true });
                setValue('');
              }
            }
          }
        };

        applyCascade(parentCtrl.value, 'init');

        const sub = parentCtrl.valueChanges.subscribe((v) =>
          applyCascade(v, 'parentChange')
        );

        return () => sub.unsubscribe();
      }, []);

      // Derived
      const arrayValue = useMemo(() => {
        const str = String(value ?? '');
        return str.length > 0 ? str.split(',') : [];
      }, [value]);

      const inputWidth = useMemo(() => {
        const f = this.field();
        if (f.controlType === 'date' || f.controlType === 'date-time') {
          return '360px';
        }
        return this.fieldConfig()?.inputWidth;
      }, []);

      const { validationError, hasError } = useFieldValidation({
        field,
        form: fg,
        initialError,
        recordExistError,
        value,
        touched,
      });

      const onValueChange = (newValue: unknown) => {
        const currentField = this.field();

        this.ngZone.run(() => {
          const ctrl = this.#getCurrentFieldControl(fg);
          ctrl?.setValue(newValue);

          this.update.emit({ form: fg, value: newValue });
          if (
            currentField.dependentField &&
            (currentField.controlType === 'dropdown' ||
              currentField.controlType === 'multi-dropdown')
          ) {
            this.runtimeOptionsChange.emit({
              field: currentField,
              options: filteredOptions ?? [],
            });
          }
        });

        setValue(
          currentField.controlType === 'checkbox'
            ? newValue
              ? 'true'
              : ''
            : newValue == null
            ? ''
            : String(newValue)
        );
        setTouched(true);
      };

      // UI renderer

      const formFieldLabel = (props: {
        field: IFormField<string>;
        fieldConfig: FieldConfig;
      }) => {
        const { field, fieldConfig } = props;

        if (fieldConfig?.hideLabel) {
          return null;
        }

        const [backgroundColor, setBackgroundColor] = useState('transparent');
        return (
          <div
            style={{
              display: 'flex',
              alignContent: 'center',
              gap: '12px',
            }}
          >
            <Legend required={this.field().required}>{this.label()}</Legend>
            <div
              style={{
                cursor: 'pointer',
                backgroundColor,
                display: 'flex',
                alignItems: 'center',
                padding: 1,
                borderRadius: 2,
                marginBottom: 2,
              }}
              onMouseEnter={() => setBackgroundColor(colors.grey200)}
              onMouseLeave={() => setBackgroundColor('transparent')}
              onClick={() => {
                console.log('Clicked here');
              }}
            >
              <IconInfo16 />
            </div>
          </div>
        );
      };
      const formFieldContent = () => {
        const f = this.field();

        switch (f.controlType) {
          case 'number':
            return (
              <InputField
                error={hasError}
                validationText={validationError}
                type={f.type as any}
                inputWidth={inputWidth}
                required={f.required}
                name={f.id}
                label={this.label()}
                min={f.min?.toString()}
                max={f.max?.toString()}
                placeholder={this.placeholder()}
                value={value}
                readOnly={disabled}
                onChange={(event: any) => onValueChange(event.value)}
                onBlur={() => checkValueUniqueness()}
              />
            );

          case 'tel':
            return (
              <InternationalPhoneField
                name={f.id}
                label={this.label()}
                placeholder={this.placeholder()}
                value={value ?? ''}
                required={f.required}
                disabled={disabled}
                error={hasError}
                validationText={validationError}
                inputWidth={this.fieldConfig()?.inputWidth}
                defaultCountryIsoCode="TZ"
                onChange={(localNumber: string) => onValueChange(localNumber)}
                onBlur={() => checkValueUniqueness()}
              />
            );

          case 'coordinate':
            return (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <NoticeBox title="Location capture required">
                  <p style={{ margin: 0 }}>
                    This field requires selecting the exact geographic location
                    on the map.
                  </p>
                  <ul
                    style={{ margin: '6px 0 0 18px', padding: 0, fontSize: 13 }}
                  >
                    <li>
                      Click <strong>“Pick location on map”</strong> to open the
                      street map.
                    </li>
                    <li>
                      Pan and zoom until you locate the correct facility,
                      building, house or area.
                    </li>
                    <li>
                      Click once on the map to place or move the marker
                      accurately.
                    </li>
                    <li>
                      Click <strong>“Use Selected Location”</strong> to save the
                      coordinates.
                    </li>
                  </ul>
                </NoticeBox>

                <CoordinatePickerField
                  error={hasError}
                  validationText={validationError}
                  required={f.required}
                  name={f.id}
                  disabled={disabled}
                  label={this.label()}
                  value={value}
                  geoConfig={this.coordinatePickerGeoConfig()}
                  onChange={(newValue: string | null) =>
                    onValueChange(newValue)
                  }
                  onBlur={() => checkValueUniqueness()}
                />
              </div>
            );

          case 'textarea':
            return (
              <FieldSet>
                <FormFieldLabel
                  field={this.field()}
                  fieldConfig={this.fieldConfig()}
                />
                <TextAreaField
                  error={hasError}
                  validationText={validationError}
                  inputWidth={this.fieldConfig()?.inputWidth}
                  required={f.required}
                  name={f.id}
                  disabled={disabled}
                  rows={5}
                  placeholder={this.placeholder()}
                  value={value}
                  onChange={(event: any) => onValueChange(event.value)}
                  onBlur={() => checkValueUniqueness()}
                />
              </FieldSet>
            );

          case 'org-unit':
            return (
              <OrgUnitFormField
                label={this.label()}
                key={f.id}
                field={f.id}
                required={f.required}
                disabled={disabled}
                customOrgUnitRoots={this.customOrgUnitRoots()}
                orgUnitRoots={f.extension?.orgUnitRoots}
                onSelectOrgUnit={(selectedOrgUnit: string) =>
                  onValueChange(selectedOrgUnit)
                }
                selected={value}
              />
            );

          case 'transfer':
            return (
              <Transfer
                filterable
                filterPlaceholder="Search"
                selected={selected}
                leftHeader={
                  <div style={{ fontSize: 14, padding: '8px 4px' }}>
                    {f.availableOptionsLabel}
                  </div>
                }
                rightHeader={
                  <div style={{ fontSize: 14, padding: '8px 4px' }}>
                    {f.selectedOptionsLabel}
                  </div>
                }
                options={f.options}
                onChange={(event: any) => onValueChange(event.selected)}
              />
            );

          case 'checkbox':
            return (
              <Checkbox
                checked={Boolean(value)}
                error={hasError}
                label={this.label()}
                name={f.id}
                disabled={disabled}
                onChange={(event: any) => onValueChange(event.checked)}
                onBlur={() => checkValueUniqueness()}
              />
            );

          case 'dropdown':
            return (
              <FieldSet>
                <FormFieldLabel
                  field={this.field()}
                  fieldConfig={this.fieldConfig()}
                />
                <SingleSelectField
                  filterable={(filteredOptions || []).length > 5}
                  clearable
                  error={hasError}
                  validationText={validationError}
                  inputWidth={this.fieldConfig()?.inputWidth}
                  disabled={disabled}
                  required={f.required}
                  className="select"
                  selected={value}
                  onChange={(event: any) => onValueChange(event.selected)}
                  onBlur={() => checkValueUniqueness()}
                >
                  {(filteredOptions || []).map((option: any) => (
                    <SingleSelectOption
                      key={this.#getOptionKey(option)}
                      label={option.label ?? option.name ?? option.displayName}
                      value={option.value ?? option.id}
                    />
                  ))}
                </SingleSelectField>
              </FieldSet>
            );

          case 'multi-dropdown':
            return (
              <FieldSet>
                <FormFieldLabel
                  field={this.field()}
                  fieldConfig={this.fieldConfig()}
                />
                <MultiSelectField
                  clearText="Clear"
                  clearable
                  empty="No data found"
                  filterable={(filteredOptions || []).length > 5}
                  filterPlaceholder="Type to filter options"
                  error={hasError}
                  validationText={validationError}
                  inputWidth={this.fieldConfig()?.inputWidth}
                  disabled={disabled}
                  required={f.required}
                  loadingText="Loading options"
                  noMatchText="No options found"
                  onChange={(event: { selected: string[] }) => {
                    const selectedValue = (event.selected || []).join(',');
                    onValueChange(selectedValue);
                  }}
                  onBlur={() => checkValueUniqueness()}
                  selected={arrayValue}
                >
                  {(filteredOptions || []).map((option: any) => (
                    <MultiSelectOption
                      key={this.#getOptionKey(option)}
                      label={option.label ?? option.name ?? option.displayName}
                      value={option.value ?? option.id}
                    />
                  ))}
                </MultiSelectField>
              </FieldSet>
            );

          case 'date':
          case 'date-time': {
            const isDateTimeField = f.type === 'date-time';
            const inputType: 'date' | 'datetime-local' = isDateTimeField
              ? 'datetime-local'
              : 'date';

            const allowFutureDate = f.allowFutureDate === true;

            const htmlValue =
              value != null && String(value).trim() !== ''
                ? this.formatValueForHtmlInputFromDhis(
                    String(value),
                    isDateTimeField
                  )
                : '';

            const htmlMin =
              f.min != null && String(f.min).trim() !== ''
                ? this.formatValueForHtmlInputFromDhis(
                    String(f.min),
                    isDateTimeField
                  )
                : undefined;

            const htmlMax = allowFutureDate
              ? undefined
              : f.max
              ? this.pickEarlierDateLimit(
                  this.formatValueForHtmlInputFromDhis(
                    String(f.max),
                    isDateTimeField
                  ),
                  this.getNowForHtmlDateInput(isDateTimeField)
                )
              : this.getNowForHtmlDateInput(isDateTimeField);

            return (
              <FieldSet>
                <FormFieldLabel
                  field={this.field()}
                  fieldConfig={this.fieldConfig()}
                />
                <InputField
                  error={hasError}
                  validationText={validationError}
                  type={inputType}
                  inputWidth={inputWidth}
                  required={f.required}
                  name={f.id}
                  min={htmlMin}
                  max={htmlMax}
                  placeholder={this.placeholder()}
                  value={htmlValue}
                  readOnly={disabled}
                  onChange={({ value: newValue }: { value: string }) => {
                    const normalized = this.normalizeDateValueFromHtmlInput(
                      newValue,
                      isDateTimeField,
                      allowFutureDate
                    );

                    onValueChange(normalized);
                  }}
                  onBlur={() => checkValueUniqueness()}
                />
              </FieldSet>
            );
          }

          case 'file':
            return (
              <FileUploadField
                label={this.label()}
                id={f.id}
                hasError={hasError}
                required={f.required}
                validationText={validationError}
                performUpload={true}
                uploadUrl={'fileResources'}
                onUploadSuccess={(fileId: string) => onValueChange(fileId)}
                onRemoveFile={() => onValueChange('')}
                extension={f?.extension}
                value={value}
                metaType={f.metaType}
                dataId={this.dataId()}
                program={this.program()}
              />
            );

          default:
            return (
              <FieldSet>
                <Legend required>Choose an option</Legend>
                <InputField
                  error={hasError}
                  validationText={validationError}
                  type={f.type as any}
                  inputWidth={inputWidth}
                  required={f.required}
                  name={f.id}
                  label={this.label()}
                  min={f.min?.toString()}
                  max={f.max?.toString()}
                  placeholder={this.placeholder()}
                  value={value}
                  readOnly={disabled}
                  onChange={(event: any) => onValueChange(event.value)}
                  onBlur={() => checkValueUniqueness()}
                />
              </FieldSet>
            );
        }
      };

      return (
        <React.Fragment>
          {formFieldContent()}
          {checkingUniqueness && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingTop: 8,
              }}
            >
              <CircularLoader small />
              <div style={{ color: colors.grey800, fontSize: 14 }}>
                Checking...
              </div>
            </div>
          )}
        </React.Fragment>
      );
    };
  }

  onChange(event: any): void {
    this.value.set(event);
  }

  formatValueForHtmlDateInput(
    rawValue: string | null | undefined,
    isDateTimeField: boolean
  ): string {
    if (!rawValue) return '';

    const trimmed = rawValue.trim();
    if (!trimmed) return '';

    if (!isDateTimeField) {
      const datePart = trimmed.split('T')[0].split(' ')[0];
      return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
      `${date.getFullYear()}-` +
      `${pad(date.getMonth() + 1)}-` +
      `${pad(date.getDate())}T` +
      `${pad(date.getHours())}:` +
      `${pad(date.getMinutes())}`
    );
  }

  /**
   * Normalizes value from the HTML input into DHIS storage format.
   *
   * For date:
   *   - Input: "YYYY-MM-DD"
   *   - Output: "YYYY-MM-DD"
   *
   * For datetime:
   *   - Input: "YYYY-MM-DDTHH:mm" (local)
   *   - Output: ISO string in UTC: "YYYY-MM-DDTHH:mm:ss.sssZ"
   *
   * If allowFutureDate = false, any value beyond "now" is clamped to now.
   */
  normalizeDateValueFromHtmlInput(
    inputValue: string | null | undefined,
    isDateTimeField: boolean,
    allowFutureDate: boolean
  ): string | null {
    const trimmed = (inputValue ?? '').trim();
    if (!trimmed) return null;

    if (!isDateTimeField) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return null;
      }

      if (!allowFutureDate) {
        const todayStr = this.getNowForHtmlDateInput(false);

        if (trimmed > todayStr) {
          return todayStr;
        }
      }

      return trimmed;
    }

    // ---- DATETIME (date-time) ----
    // HTML datetime-local gives "YYYY-MM-DDTHH:mm" (local)
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
      return null;
    }

    // Interpret selected datetime as EAT, not UTC/GMT
    const eatDateTimeValue = `${trimmed}:00.000+03:00`;

    const eatDate = new Date(eatDateTimeValue);

    if (Number.isNaN(eatDate.getTime())) {
      return null;
    }

    if (!allowFutureDate) {
      const now = new Date();

      if (eatDate.getTime() > now.getTime()) {
        return this.getNowInEatIsoString();
      }
    }

    return eatDateTimeValue;
  }

  private getNowInEatIsoString(): string {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Dar_es_Salaam',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(new Date()).reduce((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }

      return acc;
    }, {} as Record<string, string>);

    return `${parts['year']}-${parts['month']}-${parts['day']}T${parts['hour']}:${parts['minute']}:${parts['second']}.000+03:00`;
  }

  async searchForDuplicates(value: string) {
    const d2 = (window as unknown as D2Window).d2Web;

    if (!value) {
      return false;
    }

    switch (this.field().metaType) {
      case 'ATTRIBUTE': {
        const data = (
          await d2.trackerModule.trackedEntity
            .setTrackedEntityType(this.field().trackedEntityType as string)
            .setOuMode('ACCESSIBLE')
            .setFilters([
              new DataQueryFilter()
                .setAttribute(this.field().id)
                .setCondition(DataFilterCondition.Equal)
                .setValue(value),
            ])
            .get()
        )?.data as TrackedEntityInstance[];

        return (
          data?.filter(
            (trackedEntity) => trackedEntity.trackedEntity !== this.dataId()
          )?.length > 0
        );
      }

      case 'DATA_ELEMENT': {
        const data = (
          await d2.eventModule.event
            .setOuMode('ACCESSIBLE')
            .setFilters([
              new DataQueryFilter()
                .setAttribute(this.field().id)
                .setCondition(DataFilterCondition.Equal)
                .setValue(value)
                .setType('DATA_ELEMENT'),
            ])
            .get()
        )?.data as DHIS2Event[];

        return (
          data?.filter((event) => event.event !== this.dataId())?.length > 0
        );
      }

      default:
        return false;
    }
  }
}
