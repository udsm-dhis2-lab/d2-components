import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IFormFieldGroup, IFormMetadata } from '../../interfaces';
import { ProgramRuleEngine } from '@iapps/d2-web-sdk';
import { FormValue } from '../../models';
import { FormUtil } from '../../utils';

@Component({
  selector: 'ng-dhis2-ui-section-form',
  templateUrl: './section-form.component.html',
  standalone: false,
})
export class SectionFormComponent implements OnInit {
  loading = input<boolean>();
  @Input() isLab?: boolean;
  @Input() isLabResulst = false;
  @Input() clientId?: string;
  isloading!: boolean;
  @Input() labNumber?: any;
  formMetaData = input.required<IFormMetadata>();
  dataValueEntities = input.required<Record<string, unknown>>();
  formGroups: Record<string, FormGroup> = {};
  formValueEntity: Record<string, FormValue> = {};
  repeatableFormValueEntity: Record<string, Record<number, FormValue>> = {};
  ruleActions: Record<string, unknown>[] = [];

  @Output() save = new EventEmitter<Record<string, unknown>>();
  @Output() formUpdate = new EventEmitter<Record<string, unknown>>();
  @Output() cancel = new EventEmitter();

  get inValid(): boolean {
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

    return valueValidity && repeatableDataValidity;
  }

  ngOnInit(): void {
    if (this.formMetaData().sections) {
      (this.formMetaData().sections || []).forEach((formSection) => {
        (formSection.fieldGroups || []).forEach((fieldGroup) => {
          const formGroup = FormUtil.getFormGroup(
            fieldGroup.fields,
            this.dataValueEntities()
          );

          // Set bookingId as default value for `travelerReferenceId` after search refLabNum
          const refLabNum = formGroup.get('refLabNum');
          const travelerReferenceIdControl = formGroup.get(
            'travelerReferenceId'
          );
          if (travelerReferenceIdControl) {
            const defaultValue = this.clientId ? this.clientId : '';
            travelerReferenceIdControl.setValue(defaultValue);
          } else if (refLabNum) {
            const defaultValue = this.labNumber ? this.labNumber : '';
            refLabNum.setValue(defaultValue);
          }

          const formValue = new FormValue(formGroup, fieldGroup.fields);
          this.formValueEntity[fieldGroup.id] = formValue;
          this.formGroups[fieldGroup.id] = formGroup;
        });
      });

      this.ruleActions = new ProgramRuleEngine()
        .setRules(this.formMetaData().rules)
        .setDataValues(this.#getDataValue())
        .execute();
    }
  }

  onUpdateRepeatableStage(
    repeatableData: Record<number, FormValue>,
    fieldGroup: IFormFieldGroup
  ) {
    this.repeatableFormValueEntity[fieldGroup.dataKey || fieldGroup.id] =
      repeatableData;
    const dataValues = this.#getDataValue();

    this.formUpdate.emit(dataValues);
  }

  onFormUpdate(formValue: FormValue, fieldGroupId: string) {
    this.formValueEntity[fieldGroupId] = formValue;
    const dataValues = this.#getDataValue();

    this.ruleActions = new ProgramRuleEngine()
      .setRules(this.formMetaData().rules)
      .setDataValues(dataValues)
      .execute();

    this.formUpdate.emit(dataValues);
  }

  onSubmit(event: MouseEvent) {
    event.stopPropagation();
    const dataValues = this.#getDataValue();

    this.save.emit(dataValues);
  }

  onCancel(event: MouseEvent) {
    event.stopPropagation();
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
}
