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
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import React, { useEffect, useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { filter, take } from 'rxjs';
import { ReactWrapperModule } from '../../react-wrapper/react-wrapper.component';
import { useFieldValidation } from '../hooks';
import { IFormField } from '../interfaces';
import { FieldConfig } from '../models';
import { FileUploadField } from './file-upload-field.component';
import { OrgUnitFormField, CustomOrgUnitConfig } from './org-unit-form-field.component';

@Directive()
export class BaseFormFieldComponent extends ReactWrapperModule {
  ngZone = inject(NgZone);
  httpClient = inject(NgxDhis2HttpClientService);
  fieldType = 'textbox';
  field = input.required<IFormField<string>>();
  fieldError = input<string | undefined>();
  fieldConfig = input<FieldConfig>(new FieldConfig());
  form = model.required<FormGroup>();
  isValid = input<boolean>();
  isValueAssigned = input<boolean>();
  dataId = input<string>();
  customOrgUnitRoots = input<CustomOrgUnitConfig[]>();

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

      const checkValueUniqueness = async () => {
        if (this.field().unique || (this.field().extension?.isDataElementUnique ?? false) && value && value.length > 0 && touched) {
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
                    key={crypto.randomUUID() || option.key}
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
                    key={option.key}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </MultiSelectField>
            );
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
                  extension={this.field()?.extension}
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
