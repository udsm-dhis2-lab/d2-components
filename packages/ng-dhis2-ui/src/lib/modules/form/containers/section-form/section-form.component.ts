/* eslint-disable @angular-eslint/no-output-native */
import {
  Component,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ProgramRuleEngine } from '@iapps/d2-web-sdk';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { IFormFieldGroup, IFormMetadata } from '../../interfaces';
import { FormValue } from '../../models';
import { FormUtil } from '../../utils';

@Component({
  selector: 'ng-dhis2-ui-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss'],
  standalone: false,
})
export class SectionFormComponent implements OnInit {
  ngZone = inject(NgZone);
  loading = input<boolean>();
  isloading!: boolean;
  formMetaData = input.required<IFormMetadata>();
  dataValueEntities = input.required<Record<string, unknown>>();
  formGroups: Record<string, FormGroup> = {};
  formValueEntity: Record<string, FormValue> = {};
  repeatableFormValueEntity: Record<string, Record<number, FormValue>> = {};
  ruleActions = signal<any[]>([]);

  @Output() save = new EventEmitter<Record<string, unknown>>();
  @Output() formUpdate = new EventEmitter<Record<string, unknown>>();
  @Output() cancel = new EventEmitter();
  @Output() formValidityUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();

  inValid = signal<boolean>(true);
  inValid$: Observable<boolean>;

  constructor() {
    this.inValid$ = toObservable(this.inValid);
  }

  ngOnInit(): void {
    if (this.formMetaData().sections) {
      (this.formMetaData().sections || []).forEach((formSection) => {
        (formSection.fieldGroups || []).forEach((fieldGroup) => {
          const formGroup = FormUtil.getFormGroup(
            fieldGroup.fields,
            this.dataValueEntities()
          );

          const formValue = new FormValue(formGroup, fieldGroup.fields);
          this.formGroups[fieldGroup.id] = formGroup;

          if (!fieldGroup.repeatableStage) {
            this.formValueEntity[fieldGroup.id] = formValue;
          } else {
            this.repeatableFormValueEntity[
              fieldGroup.dataKey || fieldGroup.id
            ] = {
              0: formValue,
            };
          }
        });
      });

      this.inValid.set(this.checkIfInValid());

      this.ruleActions.set(
        new ProgramRuleEngine()
          .setRules(this.formMetaData().rules)
          .setDataValues(this.#getDataValue())
          .execute()
      );
    }
  }

  onUpdateRepeatableStage(
    repeatableData: Record<number, FormValue>,
    fieldGroup: IFormFieldGroup
  ) {
    if (!isEmpty(repeatableData)) {
      this.repeatableFormValueEntity[fieldGroup.dataKey || fieldGroup.id] =
        repeatableData;
      this.inValid.set(this.checkIfInValid());
      const dataValues = this.#getDataValue();

      this.formUpdate.emit(dataValues);
      this.formValidityUpdate.emit(this.checkIfInValid());
    }
  }

  onFormUpdate(formValue: FormValue, fieldGroupId: string) {
    this.formValueEntity[fieldGroupId] = formValue;
    this.inValid.set(this.checkIfInValid());

    const dataValues = this.#getDataValue();

    this.ruleActions.set(
      new ProgramRuleEngine()
        .setRules(this.formMetaData().rules)
        .setDataValues(dataValues)
        .execute()
    );

    this.formUpdate.emit(dataValues);
    this.formValidityUpdate.emit(this.checkIfInValid());
  }

  onSubmit() {
    const dataValues = this.#getDataValue();

    this.save.emit(dataValues);
  }

  onCancel(event?: MouseEvent) {
    event?.stopPropagation();
    this.cancel.emit();
  }

  #getDataValue() {
    const dataValues = Object.keys(this.formValueEntity).reduce(
      (valueObject, key) => {
        const values = this.formValueEntity[key]?.form?.getRawValue();
        return { ...valueObject, ...(values || {}) };
      },
      {}
    );

    const repeatableValues = Object.keys(this.repeatableFormValueEntity).reduce(
      (repeatableObject, key) => {
        const formValueEntity = this.repeatableFormValueEntity[key];

        const values = Object.keys(formValueEntity)
          .map((valueIndex) => {
            return (formValueEntity[+valueIndex] || {}).form?.getRawValue();
          })
          .filter((value) => value);

        return { ...repeatableObject, [key]: values };
      },
      {}
    );

    return { ...dataValues, ...repeatableValues };
  }

  checkIfInValid() {
    const valueValidity = Object.keys(this.formValueEntity)
      .map((key) => {
        return (this.formValueEntity[key] || {}).isValid;
      })
      .some((validity) => !validity);

    const repeatableDataValidity = Object.keys(this.repeatableFormValueEntity)
      .map((key) => {
        return Object.keys(this.repeatableFormValueEntity[key]).some(
          (valueIndex) => {
            return (
              (this.repeatableFormValueEntity[key] || {})[+valueIndex] || {}
            ).isValid;
          }
        );
      })
      .some((validity) => !validity);

    return valueValidity || repeatableDataValidity;
  }
}
