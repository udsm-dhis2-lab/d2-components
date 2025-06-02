import {
  Component,
  EffectRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  effect,
  input,
  signal,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { find } from 'lodash';
import moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { IFormField } from '../../interfaces';
import { FieldConfig, IMetadataRuleAction } from '../../models';

@Component({
  selector: 'ng-dhis2-ui-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  standalone: false,
})
export class FormFieldComponent implements OnInit, OnChanges, OnDestroy {
  field = input.required<IFormField<string>>();
  fieldConfig = input.required<FieldConfig>();
  @Input() form!: FormGroup;
  isCheckBoxButton = input<boolean>();
  fieldClass = input<string>('');
  programRuleActions = input<IMetadataRuleAction[]>([]);
  dataEntities = input<any>({});
  minDate = input<any>();
  maxDate = input(new Date());
  dataId = input<string>();
  color = 'primary';
  @Output() fieldUpdate: EventEmitter<FormGroup> =
    new EventEmitter<FormGroup>();

  @Output() immediateFieldUpdate: EventEmitter<{ value: string }> =
    new EventEmitter<{ value: string }>();

  @Output() runtimeOptionChange: EventEmitter<any> = new EventEmitter<any>();

  value = signal<any>('');
  runtimeError = signal<string | undefined>(undefined);

  private _runtimeOptions: any[] = [];
  runtimeOptions: any = [];
  fieldFilterControl: FormControl = new FormControl();
  protected _onDestroy = new Subject<void>();
  optionSearchTerm!: string;
  isValueAssigned = signal<boolean>(false);

  ruleProcessor: EffectRef;
  constructor() {
    this.ruleProcessor = effect(() => {
      this.#processRules(this.programRuleActions());
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['dataEntities'] && this.field()?.dependentField) {
      if (this._runtimeOptions?.length === 0) {
        const parentOption = find(
          this.field()?.dependentField?.optionSet?.options,
          ['code', (this.form?.value || {})[this.field()?.dependentField?.id]]
        );

        this.runtimeOptions = parentOption?.options || [];

        this.runtimeOptionChange.emit({
          field: this.field(),
          options: this.runtimeOptions,
        });
      } else {
        this.runtimeOptions = this._runtimeOptions;
      }
    }
  }

  ngOnInit() {
    this.value.set(this.form?.get(this.field()?.id)?.value);
    this.fieldFilterControl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.optionSearchTerm = this.fieldFilterControl.value;
      });
  }

  #processRules(ruleActions: IMetadataRuleAction[]) {
    const fieldRuleActions = ruleActions.filter(
      (ruleAction) => ruleAction.field === this.field().id
    );

    let runtimeError;
    let isValueAssigned = false;
    fieldRuleActions.forEach((ruleAction) => {
      switch (ruleAction.actionType) {
        case 'ASSIGN': {
          if (ruleAction.assignedData) {
            const currentValue = this.form?.get(this.field().key)?.value;

            if (currentValue != ruleAction.assignedData) {
              this.form
                ?.get(this.field().key)
                ?.setValue(ruleAction.assignedData);
              isValueAssigned = true;
              this.onValueChange();
            }
          }
          break;
        }

        case 'SHOWERROR': {
          runtimeError = ruleAction.displayedContent;
          (
            this.form.controls[this.field().id] ||
            this.form.controls[this.field().key]
          )?.setErrors({
            customError: runtimeError,
          });

          break;
        }

        default:
          break;
      }
    });

    this.runtimeError.set(runtimeError);
    this.isValueAssigned.set(isValueAssigned);
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
    this.ruleProcessor.destroy();
  }

  get isValid(): boolean {
    return this.form?.controls[this.field().id]?.valid;
  }

  get fieldError(): string | undefined {
    const error = this.form?.controls[this.field()?.id]?.errors;

    if (!error) {
      return undefined;
    }

    if (error['min']) {
      return `${this.field().label} should not be less than ${
        error['min'].min
      }!`;
    } else if (error['max']) {
      return `${this.field().label} should not be greater than ${
        error['max'].max
      }!`;
    } else if (error['pattern']) {
      if (this.field().type === 'email') {
        return `The email address provided is not valid`;
      } else if (this.field().type === 'tel') {
        return 'Phone number provided is not valid';
      } else {
        return `${this.field().label} should have appropriate format`;
      }
    }

    return error['required'] ? `${this.field()?.label} is required` : undefined;
  }

  get minErrorText(): string | undefined {
    const minError = this.form?.controls[this.field()?.id]?.errors?.['min'];

    return minError ? `${this.field()?.label} is min` : undefined;
  }

  get maxErrorText(): string | undefined {
    const maxError = this.form?.controls[this.field()?.id]?.errors?.['max'];

    return maxError ? `${this.field()?.label} is required` : undefined;
  }

  get isInvalid(): boolean {
    return (
      this.form?.controls[this.field().id]?.invalid &&
      !this.form?.controls[this.field().id].pristine
    );
  }

  get isDate(): boolean {
    return this.field().controlType === 'date';
  }

  get isDateTime(): boolean {
    return this.field().controlType === 'date-time';
  }

  get isBoolean(): boolean {
    return this.field().controlType === 'boolean';
  }

  get isCheckbox(): boolean {
    return this.field()?.controlType === 'checkbox';
  }

  get isCommonField(): boolean {
    return !this.isCheckbox && !this.isDate && !this.isDateTime;
  }

  get fieldId(): string {
    return this.field()?.id;
  }

  onValueChange() {
    this.fieldUpdate.emit(this.form);
  }

  onImmediateChange(event: { value: string }) {
    this.immediateFieldUpdate.emit({ value: event?.value || '' });
  }

  onFieldUpdate(e?: any, isDate?: boolean, isDateTime?: boolean): void {
    if (e && e.value) {
      const dateValue = new Date(e.value);
      if (isDate) {
        const dateValue = new Date(e.value);
        const formattedDate = moment(e.value).format('YYYY-MM-DD');
        let dateTimeString = formattedDate;

        if (isDateTime) {
          const hours =
            dateValue.getHours() < 10
              ? '0' + dateValue.getHours()
              : dateValue.getHours();
          const minutes =
            dateValue.getMinutes() < 10
              ? '0' + dateValue.getMinutes()
              : dateValue.getMinutes();
          const seconds =
            dateValue.getSeconds() < 10
              ? '0' + dateValue.getSeconds()
              : dateValue.getSeconds();

          const timeValue = `${hours}:${minutes}:${seconds}`;
          dateTimeString = `${formattedDate}T${timeValue}`;
        }

        const formControl = this.form.get(this.field().key);
        if (formControl) {
          formControl.setValue(dateTimeString);
        }
      } else {
        const formControl = this.form.get(this.field().key);
        if (formControl) {
          formControl.setValue(e.value);
        }
      }
    }

    this.fieldUpdate.emit(this.form);
  }

  onUpdateRuntimeOptions(options: any[]) {
    this._runtimeOptions = [...options];
  }
}
