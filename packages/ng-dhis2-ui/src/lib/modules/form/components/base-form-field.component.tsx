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
} from '@dhis2/ui';
import {
  D2Window,
  DataFilterCondition,
  DataQueryFilter,
  DHIS2Event,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { filter, take } from 'rxjs';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { useFieldValidation } from '../hooks';
// import { IFormField } from '../interfaces';
// import { FieldConfig } from '../models';
import { FileUploadField } from './file-upload-field.component';
import { OrgUnitFormField } from './org-unit-form-field.component';
import { CustomOrgUnitConfig } from '../models/org-unit.model';
import { IFormField } from '../interfaces/form-field.interface';
import { FieldConfig } from '../models/field-config.model';
import { CoordinatePickerField } from './coordinate-field-component';
import { NoticeBox } from '@dhis2/ui';

@Directive()
export class BaseFormFieldComponent extends ReactWrapperModule {
  ngZone = inject(NgZone);
  fieldType = 'textbox';
  field = input.required<IFormField<string>>();
  fieldError = input<string | undefined>();
  fieldConfig = input<FieldConfig>(new FieldConfig());
  form = model.required<FormGroup>();
  isValid = input<boolean>();
  isValueAssigned = input<boolean>();
  dataId = input<string>();
  customOrgUnitRoots = input<CustomOrgUnitConfig[]>();
  //TODO: FIND BETTER WAY TO PASS PROGRAM TO FIELDS i.e field extensions
  program = input<string>();

  value = model<string>();
  protected value$ = toObservable(this.value);
  protected isValueAssigned$ = toObservable(this.isValueAssigned);
  protected fieldError$ = toObservable(this.fieldError);

  label: Signal<string | undefined> = computed(() => {
    return !this.fieldConfig()?.hideLabel ? this.field().label : undefined;
  });

  placeholder: Signal<string> = computed(() => {
    return (
      this.field()?.placeholder || `Enter ${this.field()?.label || 'value'}`
    );
  });

  InputField = this.#getInputField();

  @Output() update = new EventEmitter<{ form: FormGroup; value: any }>();
  @Output() immediateUpdate = new EventEmitter<{
    form: FormGroup;
    value: any;
  }>();

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);

    this.component = this.InputField;
    this.render();
  }

  #getInputField() {
    return (): React.JSX.Element => {
      const [value, setValue] = useState(
        this.form().get(this.field().id)?.value ||
        this.form().get(this.field().key)?.value
      );

      const [selected, setSelected] = useState();
      const [touched, setTouched] = useState(false);
      const [disabled, setDisabled] = useState<boolean>(
        this.field()?.disabled ?? this.field()?.generated ?? false
      );
      const [initialError, setInitialError] = useState<string>();
      const [recordExistError, setRecordExistError] = useState<
        string | undefined
      >();
      const [checkingUniqueness, setCheckingUniqueness] = useState<boolean>();

      useEffect(() => {
        const isAssignedSubscription = this.isValueAssigned$
          .pipe(filter((isValueAssigned) => isValueAssigned === true))
          .subscribe({
            next: () => {
              const value =
                this.form().get(this.field().id)?.value ||
                this.form().get(this.field().key)?.value;
              setValue(value);
              setDisabled(true);
              checkValueUniqueness();
            },
          });

        return () => {
          isAssignedSubscription.unsubscribe();
        };
      }, []);

      // TODO: Review error handling as take() has potential to missed any other updated error information
      useEffect(() => {
        const fieldErrorSubscription = this.fieldError$
          .pipe(
            filter((error) => error !== initialError),
            take(1)
          )
          .subscribe({
            next: (error: string | undefined) => {
              setInitialError(error);
            },
          });

        return () => {
          fieldErrorSubscription.unsubscribe();
        };
      }, [initialError]); // Add initialError as a dependency to avoid stale closures

      const arrayValue = useMemo(() => {
        if (value && value.length > 0) {
          return value.split(',');
        }

        return [];
      }, [value]);

      const inputWidth = useMemo(() => {
        if (
          this.field().controlType === 'date' ||
          this.field().controlType === 'date-time'
        ) {
          return '360px';
        }

        return this.fieldConfig()?.inputWidth;
      }, []);

      const { validationError, hasError } = useFieldValidation({
        field: this.field(),
        form: this.form(),
        initialError,
        recordExistError,
        value,
        touched,
      });

      const onValueChange = (value: unknown) => {
        this.ngZone.run(() => {
          (
            this.form().get(this.field().id) ||
            this.form().get(this.field().key)
          )?.setValue(value);

          this.update.emit({
            form: this.form(),
            value,
          });
        });

        setValue(value);
        setTouched(true);
      };

      const generateUUID = (): string => {
        return (
          globalThis.crypto?.randomUUID?.() ??
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          })
        );
      };

      const checkValueUniqueness = async () => {
        if (
          this.field().unique ||
          ((this.field().extension?.isDataElementUnique ?? false) &&
            value &&
            value.length > 0 &&
            touched)
        ) {
          //  if (this.field().unique && value && value.length > 0 && touched) {
          setCheckingUniqueness(true);
          setRecordExistError(undefined);
          try {
            const isDuplicate = await this.searchForDuplicates(value);

            setCheckingUniqueness(false);

            if (isDuplicate) {
              const customError = `Record with this ${this.label()} is already registered`;
              (
                this.form().controls[this.field().id] ||
                this.form().controls[this.field().key]
              )?.setErrors({
                customError,
              });
              setRecordExistError(customError);
            }
          } catch (e) {
            setCheckingUniqueness(false);
            setRecordExistError(undefined);
          }
        }
      };

      const formFieldContent = () => {
        switch (this.field().controlType) {
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
                  required={this.field().required}
                  name={this.field().id}
                  disabled={disabled}
                  label={this.label()}
                  value={value}
                  onChange={(newValue: string | null) => {
                    onValueChange(newValue);
                  }}
                  onBlur={() => {
                    checkValueUniqueness();
                  }}
                />
              </div>
            );

          case 'textarea':
            return (
              <TextAreaField
                error={hasError}
                validationText={validationError}
                inputWidth={this.fieldConfig()?.inputWidth}
                required={this.field().required}
                name={this.field().id}
                disabled={disabled}
                label={this.label()}
                rows={5}
                placeholder={this.placeholder()}
                value={value}
                onChange={(event: any) => {
                  onValueChange(event.value);
                }}
                onBlur={() => {
                  checkValueUniqueness();
                }}
              />
            );

          case 'org-unit': {
            return (
              <OrgUnitFormField
                label={this.label()}
                key={this.field().id}
                field={this.field().id}
                required={this.field().required}
                disabled={disabled}
                customOrgUnitRoots={this.customOrgUnitRoots()}
                onSelectOrgUnit={(selectedOrgUnit: string) => {
                  onValueChange(selectedOrgUnit);
                }}
                selected={value}
              />
            );
          }
          case 'transfer':
            return (
              <Transfer
                filterable
                filterPlaceholder="Search"
                selected={selected}
                leftHeader={
                  <div
                    style={{
                      fontSize: 14,
                      padding: '8px 4px',
                    }}
                  >
                    {this.field().availableOptionsLabel}
                  </div>
                }
                rightHeader={
                  <div
                    style={{
                      fontSize: 14,
                      padding: '8px 4px',
                    }}
                  >
                    {this.field().selectedOptionsLabel}
                  </div>
                }
                options={this.field().options}
                onChange={(event: any) => {
                  onValueChange(event.selected);
                }}
              />
            );
          case 'checkbox':
            return (
              <Checkbox
                checked={Boolean(value)}
                error={hasError}
                label={this.label()}
                name={this.field().id}
                disabled={disabled}
                onChange={(event: any) => {
                  onValueChange(event.checked);
                }}
                onBlur={() => {
                  checkValueUniqueness();
                }}
              />
            );
          case 'dropdown':
            return (
              <SingleSelectField
                filterable={(this.field().options || []).length > 5}
                clearable
                error={hasError}
                validationText={validationError}
                inputWidth={this.fieldConfig()?.inputWidth}
                disabled={disabled}
                required={this.field().required}
                className="select"
                label={this.label()}
                selected={value}
                onChange={(event: any) => {
                  onValueChange(event.selected);
                }}
                onBlur={() => {
                  checkValueUniqueness();
                }}
              >
                {(this.field().options || []).map((option) => (
                  <SingleSelectOption
                    key={generateUUID()}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </SingleSelectField>
            );
          case 'multi-dropdown':
            return (
              <MultiSelectField
                clearText="Clear"
                clearable
                empty="No data found"
                filterable={(this.field().options || []).length > 5}
                filterPlaceholder="Type to filter options"
                error={hasError}
                validationText={validationError}
                inputWidth={this.fieldConfig()?.inputWidth}
                disabled={disabled}
                label={this.label()}
                required={this.field().required}
                loadingText="Loading options"
                noMatchText="No options found"
                onChange={(event: { selected: string[] }) => {
                  const selectedValue = (event.selected || []).join(',');
                  onValueChange(selectedValue);
                }}
                onBlur={() => {
                  checkValueUniqueness();
                }}
                selected={arrayValue}
              >
                {(this.field().options || []).map((option) => (
                  <MultiSelectOption
                    key={generateUUID()}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </MultiSelectField>
            );
          // case 'date':
          // case 'date-time':
          //   return (
          //     <InputField
          //       error={hasError}
          //       validationText={validationError}
          //       type={this.field().type as any}
          //       inputWidth={inputWidth}
          //       required={this.field().required}
          //       name={this.field().id}
          //       label={this.label()}
          //       min={this.field().min?.toString()}
          //       max={this.field().max?.toString()}
          //       placeholder={this.placeholder()}
          //       value={value}
          //       readOnly={disabled}
          //       onChange={(event: any) => {
          //         onValueChange(event.value);
          //       }}
          //       onBlur={() => {
          //         checkValueUniqueness();
          //       }}
          //     />
          //   );
          case 'date':
          case 'date-time': {
            const field = this.field();
            const isDateTimeField = field.type === 'date-time';

            const inputType: React.HTMLInputTypeAttribute = isDateTimeField
              ? 'datetime-local'
              : 'date';

            // Value coming from DHIS2 store
            const htmlValue = this.formatValueForHtmlInputFromDhis(
              value,
              isDateTimeField
            );

            const htmlMin = field.min
              ? this.formatValueForHtmlInputFromDhis(
                String(field.min),
                isDateTimeField
              )
              : undefined;

            // Max defined in metadata (if any)
            const metadataMax = field.max
              ? this.formatValueForHtmlInputFromDhis(
                String(field.max),
                isDateTimeField
              )
              : undefined;

            // System max = “now” (no future allowed)
            const systemMax = this.getNowForHtmlDateInput(isDateTimeField);

            // Effective max = earliest of metadataMax and systemMax
            const htmlMax = this.pickEarlierDateLimit(metadataMax, systemMax);

            return (
              <InputField
                error={hasError}
                validationText={validationError}
                type={inputType}
                inputWidth={inputWidth}
                required={field.required}
                name={field.id}
                label={this.label()}
                min={htmlMin}
                max={htmlMax}
                placeholder={this.placeholder()}
                value={htmlValue}
                readOnly={disabled}
                onChange={({ value: newValue }: { value: string }) => {
                  const normalized = this.normalizeDateValueFromHtmlInput(
                    newValue,
                    isDateTimeField,
                    true
                  );

                  onValueChange(normalized);
                }}
                onBlur={() => {
                  checkValueUniqueness();
                }}
              />
            );
          }

          case 'file':
            return (
              <>
                <FileUploadField
                  label={this.label()}
                  id={this.field().id}
                  hasError={hasError}
                  required={this.field().required}
                  validationText={validationError}
                  performUpload={true}
                  uploadUrl={'fileResources'}
                  onUploadSuccess={(fileId: string) => {
                    onValueChange(fileId);
                  }}
                  onRemoveFile={() => {
                    onValueChange('');
                  }}
                  extension={this.field()?.extension}
                  value={value}
                  metaType={this.field().metaType}
                  dataId={this.dataId()}
                  program={this.program()}
                />
              </>
            );
          default:
            return (
              <InputField
                error={hasError}
                validationText={validationError}
                type={this.field().type as any}
                inputWidth={inputWidth}
                required={this.field().required}
                name={this.field().id}
                label={this.label()}
                min={this.field().min?.toString()}
                max={this.field().max?.toString()}
                placeholder={this.placeholder()}
                value={value}
                readOnly={disabled}
                onChange={(event: any) => {
                  onValueChange(event.value);
                }}
                onBlur={() => {
                  checkValueUniqueness();
                }}
              />
            );
        }
      };

      {
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
      }
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

  formatValueForHtmlInputFromDhis(
    rawValue: string | null | undefined,
    isDateTimeField: boolean
  ): string {
    if (!rawValue) return '';

    const trimmed = rawValue.trim();
    if (!trimmed) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    if (!isDateTimeField) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }

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

    const timePart = `${pad(now.getHours())}:` + `${pad(now.getMinutes())}`;

    return `${datePart}T${timePart}`;
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
   * If disallowFuture = true, any value beyond "now" is clamped to now.
   */
  normalizeDateValueFromHtmlInput(
    inputValue: string | null | undefined,
    isDateTimeField: boolean,
    disallowFuture: boolean
  ): string | null {
    const trimmed = (inputValue ?? '').trim();
    if (!trimmed) return null;

    if (!isDateTimeField) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return null;
      }

      if (disallowFuture) {
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

    // Interpret as LOCAL time
    const localDate = new Date(trimmed);
    if (Number.isNaN(localDate.getTime())) {
      return null;
    }

    if (disallowFuture) {
      const now = new Date();
      if (localDate.getTime() > now.getTime()) {
        // Option A: clamp to now
        return now.toISOString();
        // Option B: reject:
        // return null;
      }
    }

    // Store as UTC ISO string with millis, e.g. "2025-11-26T21:01:00.000Z"
    return localDate.toISOString();
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
