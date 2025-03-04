import {
  Component,
  EventEmitter,
  input,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { range } from 'lodash';
import { IFormFieldGroup } from '../../../form-models/interfaces';
import { Field, FormValue } from '../../../form-models/models';

@Component({
  selector: 'repeatable-form',
  templateUrl: './repeatable-form.component.html',
  styleUrls: ['./repeatable-form.component.scss'],
  standalone: false,
})
export class RepeatableFormComponent implements OnInit {
  @Input() formObject!: any;
  @Input() formData: any;
  fieldGroup = input.required<IFormFieldGroup>();
  @Input() form!: FormGroup;
  @Input() numberOfRows!: number | string;
  @Input() programRuleActions!: any[];
  @Input() events?: any[] | unknown;
  @Input() program!: string;
  @Input() programStage!: string;
  @Input() repeatDependentField!: string;
  dataEntities = input.required<Record<string, unknown>>();
  repeatableEvents: any[] = [];

  repeatableData: { [index: number]: FormValue } = {};

  @Output() repeatableStageUpdate = new EventEmitter<any>();

  repeatableFormEntities!: { [event: string]: FormGroup };

  get isValid(): boolean {
    return !Object.keys(this.repeatableData).some((index: any) => {
      const formValue = this.repeatableData[index];

      return !formValue?.isValid;
    });
  }

  ngOnInit(): void {
    this.repeatableEvents = (
      (this.events as any[])?.length > 0
        ? (this.events as any)
        : range(this.numberOfRows as number).map(() => ({}))
    ).map((event: any, index: number) => {
      const fieldControls = (this.fieldGroup().fields || []).reduce(
        (fieldObject: any, field: Field<string>) => {
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
    });

    this.repeatableStageUpdate.emit(this.repeatableData);
  }

  onFormUpdate(formValue: FormValue, eventIndex: number): void {
    this.repeatableData = { ...this.repeatableData, [eventIndex]: formValue };

    if (this.isValid) {
      this.repeatableStageUpdate.emit(this.repeatableData);
    }
  }
}
