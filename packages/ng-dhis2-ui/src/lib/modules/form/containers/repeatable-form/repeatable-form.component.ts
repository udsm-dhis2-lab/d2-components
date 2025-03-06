import {
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  model,
  NgZone,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IFormFieldGroup } from '../../interfaces';
import { FormField, FormValue } from '../../models';
import { FormUtil } from '../../utils';

@Component({
  selector: 'ng-dhis2-ui-repeatable-form',
  templateUrl: './repeatable-form.component.html',
  styleUrls: ['./repeatable-form.component.scss'],
  standalone: false,
})
export class RepeatableFormComponent implements OnInit {
  ngZone = inject(NgZone);
  @Input() formObject!: any;
  @Input() formData: any;
  fieldGroup = input.required<IFormFieldGroup>();
  @Input() form!: FormGroup;
  @Input() numberOfRows!: number | string;
  @Input() programRuleActions!: any[];
  events = model<Record<string, unknown>[] | unknown>();
  @Input() program!: string;
  @Input() programStage!: string;
  @Input() repeatDependentField!: string;
  dataEntities = input.required<Record<string, unknown>>();
  repeatableEvents: any[] = [];

  repeatableData: { [index: number]: FormValue } = {};

  @Output() repeatableStageUpdate = new EventEmitter<any>();

  repeatableFormEntities!: { [event: string]: FormGroup };

  eventForm!: FormGroup;
  eventFormValue = signal<FormValue | null>(null);
  #eventFormValue$: Observable<FormValue | null>;

  showForm = signal<boolean>(false);
  #showForm$: Observable<boolean>;

  #events$: Observable<any>;
  eventIndex = signal<number>(0);

  constructor() {
    this.#eventFormValue$ = toObservable(this.eventFormValue);
    this.#showForm$ = toObservable(this.showForm);
    this.#events$ = toObservable(this.events);
  }

  get isValid(): boolean {
    return !Object.keys(this.repeatableData).some((index: any) => {
      const formValue = this.repeatableData[index];

      return !formValue?.isValid;
    });
  }

  ngOnInit(): void {
    this.eventForm = FormUtil.getFormGroup(this.fieldGroup().fields, {});
    this.eventFormValue.set(
      new FormValue(this.eventForm, this.fieldGroup().fields)
    );

    this.repeatableEvents = ((this.events() as any[]) || []).map(
      (event: any, index: number) => {
        const fieldControls = (this.fieldGroup().fields || []).reduce(
          (fieldObject: any, field: FormField<string>) => {
            const value = (event.dataValueEntities || {})[field.key] || '';

            return {
              ...fieldObject,
              [field.key]: new FormControl(
                value,
                field.required ? [Validators.required] : []
              ),
            };
          },
          {}
        );

        const form = new FormGroup(fieldControls);
        this.repeatableData[index] = new FormValue(
          form,
          this.fieldGroup().fields || []
        );
        return { ...event, form };
      }
    );

    this.repeatableStageUpdate.emit(this.repeatableData);
  }

  onFormUpdate(formValue: FormValue): void {
    this.eventFormValue.set(formValue);
    this.repeatableData = {
      ...this.repeatableData,
      [this.eventIndex()]: formValue,
    };
  }
}
