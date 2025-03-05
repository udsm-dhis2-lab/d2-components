// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  Directive,
  EventEmitter,
  NgZone,
  OnChanges,
  Output,
  Signal,
  SimpleChanges,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import {
  Checkbox,
  FileInputField,
  FileListItem,
  InputField,
  SingleSelectField,
  SingleSelectOption,
  TextAreaField,
  Transfer,
} from '@dhis2/ui';
import React, { useMemo, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReactWrapperComponent } from '../../react-wrapper/react-wrapper.component';
import { FieldConfig, FormField } from '../models';

@Directive()
export class BaseFormFieldComponent
  extends ReactWrapperComponent
  implements OnChanges
{
  ngZone = inject(NgZone);
  fieldType = 'textbox';
  field = input.required<FormField<string>>();
  fieldConfig = input<FieldConfig>(new FieldConfig());
  form = model.required<FormGroup>();
  isValid = input<boolean>();

  uploadedFiles: any = [];

  value = model<string>();
  protected value$ = toObservable(this.value);

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

  ngOnChanges(changes: SimpleChanges): void {
    if (!(changes['field'] || {})?.firstChange) {
      this.InputField = this.#getInputField();
      this.component = this.#getInputField();
      this.render();
    }
  }

  #getInputField() {
    return (): React.JSX.Element => {
      const [value, setValue] = useState(
        this.form().get(this.field().id)?.value ||
          this.form().get(this.field().key)?.value
      );
      const [selected, setSelected] = useState();
      const [touched, setTouched] = useState(false);

      const onChange = (payload: {
        selected: React.SetStateAction<undefined>;
      }) => setSelected(payload.selected);

      const hasError = useMemo(() => {
        return (
          touched &&
          (
            this.form().get(this.field().id) ||
            this.form().get(this.field().key)
          )?.invalid
        );
      }, [value, touched]);

      const validationError = useMemo(() => {
        if (!touched) {
          return undefined;
        }

        const field = this.field();
        const error = (this.form().get(field.id) || this.form().get(field.key))
          ?.errors;

        if (!error) {
          return undefined;
        }

        if (error['min']) {
          return `${this.label() || 'Value'} should not be less than ${
            error['min'].min
          }!`;
        } else if (error['max']) {
          return `${this.label() || 'Value'} should not be greater than ${
            error['max'].max
          }!`;
        } else if (error['pattern']) {
          if (field.type === 'email') {
            return `The email address provided is not valid`;
          } else if (field.type === 'tel') {
            return 'Phone number provided is not valid';
          } else {
            return `${this.label() || 'Value'} should have appropriate format`;
          }
        }

        return error['required']
          ? `${this.label() || 'Value'} is required`
          : undefined;
      }, [hasError]);

      switch (this.field().controlType) {
        case 'textarea':
          return (
            <TextAreaField
              error={hasError}
              validationText={validationError}
              type={this.field().type}
              inputWidth={this.fieldConfig()?.inputWidth}
              required={this.field().required}
              name={this.field().id}
              label={this.label()}
              min={this.field().min?.toString()}
              max={this.field().max?.toString()}
              placeholder={this.placeholder()}
              value={value}
              onChange={(event: any) => {
                this.ngZone.run(() => {
                  (
                    this.form().get(this.field().id) ||
                    this.form().get(this.field().key)
                  )?.setValue(event.value);

                  this.immediateUpdate.emit({
                    form: this.form(),
                    value: event.value,
                  });
                });
                setValue(event.value);
                setTouched(true);
              }}
              onBlur={() => {
                this.ngZone.run(() => {
                  this.update.emit({ form: this.form(), value });
                });
              }}
            />
          );

        case 'transfer':
          return (
            <Transfer
              filterable
              filterPlaceholder="Search"
              selected={selected}
              error={hasError}
              validationText={validationError}
              type={this.field().type}
              inputWidth={this.fieldConfig()?.inputWidth}
              required={this.field().required}
              name={this.field().id}
              label={this.label()}
              placeholder={this.placeholder()}
              value={selected}
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
                onChange({ selected: event.selected });
                this.ngZone.run(() => {
                  (
                    this.form().get(this.field().id) ||
                    this.form().get(this.field().key)
                  )?.setValue(event.selected);
                });
                setValue(event.selected);
                setTouched(true);
                this.update.emit({ form: this.form(), value });
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
              onChange={(event: any) => {
                this.ngZone.run(() => {
                  (
                    this.form().get(this.field().id) ||
                    this.form().get(this.field().key)
                  )?.setValue(event.checked);
                });
                setValue(event.checked);
                setTouched(true);
              }}
              onBlur={() => {
                this.ngZone.run(() => {
                  this.update.emit({ form: this.form(), value });
                });
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
              required={this.field().required}
              name={this.field().id}
              className="select"
              label={this.label()}
              selected={value}
              onChange={(event: any) => {
                this.ngZone.run(() => {
                  (
                    this.form().get(this.field().id) ||
                    this.form().get(this.field().key)
                  )?.setValue(event.selected);
                  this.update.emit({
                    form: this.form(),
                    value: event.selected,
                  });
                });
                setValue(event.selected);
                setTouched(true);
              }}
            >
              {(this.field().options || []).map((option) => (
                <SingleSelectOption
                  key={option.key}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </SingleSelectField>
          );
        case 'file':
          return (
            <FileInputField
              accept="*"
              buttonLabel="Upload a file"
              label={this.label()}
              name={this.field().id}
              files={this.uploadedFiles}
              onChange={(event: any) => {
                this.uploadedFiles.push((event?.files || [])[0]);

                this.ngZone.run(() => {
                  this.form().get(this.field().id) ||
                    this.form()
                      .get(this.field().key)
                      ?.setValue((event?.files || [])[0]);
                  this.update.emit({
                    form: this.form(),
                    value: (event?.files || [])[0],
                  });
                });
                setValue((event?.files || [])[0]);
                setTouched(true);
              }}
              // placeholder={this.placeholder()}
            >
              {this.uploadedFiles.map((file: any, index: any) => (
                <FileListItem
                  key={index}
                  cancelText="Cancel"
                  label={file.name}
                  onCancel={() => {}}
                  onRemove={() => {
                    this.ngZone.run(() => {
                      this.uploadedFiles.splice(index, 1);
                      setValue(this.uploadedFiles);
                      setTouched(true);
                    });
                  }}
                  removeText="Remove"
                />
              ))}
            </FileInputField>
          );
        default:
          return (
            <InputField
              error={hasError}
              validationText={validationError}
              type={this.field().type as any}
              inputWidth={this.fieldConfig()?.inputWidth}
              required={this.field().required}
              name={this.field().id}
              label={this.label()}
              min={this.field().min?.toString()}
              max={this.field().max?.toString()}
              placeholder={this.placeholder()}
              value={value}
              readOnly={this.field().disabled}
              onChange={(event: any) => {
                this.ngZone.run(() => {
                  (
                    this.form().get(this.field().id) ||
                    this.form().get(this.field().key)
                  )?.setValue(event.value);
                  this.immediateUpdate.emit({
                    form: this.form(),
                    value: event.value,
                  });
                });
                setValue(event.value);
                setTouched(true);
              }}
              onBlur={() => {
                this.ngZone.run(() => {
                  this.update.emit({ form: this.form(), value });
                });
              }}
            />
          );
      }
    };
  }

  onChange(event: any): void {
    this.value.set(event);
  }
}
