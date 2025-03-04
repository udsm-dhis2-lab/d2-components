import {
  Component,
  EventEmitter,
  NgZone,
  Output,
  Signal,
  SimpleChanges,
  computed,
  input,
  model,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import React, { useMemo, useState } from 'react';
import { FormField, FieldConfig } from '../../models';

@Component({
  selector: 'ng-dhis2-ui-dropdown-field',
  templateUrl: '../base-field.component.html',
  styleUrls: ['./dropdown-field.component.scss'],
  standalone: false,
})
export class DropdownFieldComponent {
  field = input.required<FormField<string>>();
  fieldConfig = input<FieldConfig>(new FieldConfig());
  form = model.required<FormGroup>();
  isValid = input<boolean>();

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

  constructor(protected ngZone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!(changes['field'] || {})?.firstChange) {
      this.InputField = this.#getInputField();
    }
  }

  #getInputField() {
    return (): React.JSX.Element => {
      const [value, setValue] = useState(
        this.form().get(this.field().id)?.value ||
          this.form().get(this.field().key)?.value
      );
      const [touched, setTouched] = useState(false);

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
              this.update.emit({ form: this.form(), value: event.selected });
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
    };
  }

  onChange(event: any): void {
    this.value.set(event);
  }
}
