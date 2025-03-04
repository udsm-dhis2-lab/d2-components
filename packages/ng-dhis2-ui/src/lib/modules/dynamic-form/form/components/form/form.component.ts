import { FieldComponent } from '../field/field.component';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChildren,
  computed,
  input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { head } from 'lodash';
import {
  Field,
  FieldsData,
  FormConfig,
  FormValue,
} from '../../../form-models/models';

@Component({
  selector: 'form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: false,
})
export class FormComponent implements OnChanges {
  formConfig = input<FormConfig>();
  @Input() fields!: Field<string>[];
  @Input() form!: FormGroup;
  @Input() isFormHorizontal!: boolean;
  @Input() showSaveButton!: boolean;
  @Input() fieldsData!: FieldsData;
  @Input() fieldClass!: string;
  @Input() shouldRenderAsCheckBoxesButton!: boolean;
  @Input() programRuleActions!: any[];
  @Input() dataEntities: any;

  configuration = computed(() => {
    if (!this.formConfig()) {
      return new FormConfig({
        direction: this.isFormHorizontal ? 'horizontal' : 'vertical',
      });
    }

    return this.formConfig() as FormConfig;
  });

  @Output() formUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitNumberOfCountriesToStep: EventEmitter<number> =
    new EventEmitter<number>();

  @ViewChildren(FieldComponent) fieldComponents!: FieldComponent[];

  values: any;

  emitNumberOfCountries(data: any) {
    this.emitNumberOfCountriesToStep.emit(data);
  }

  get sanitizedFields(): Field<string>[] {
    return (this.fields || []).filter((field: any) => {
      if (field.hidden) {
        return false;
      }

      const type = field.isDataElement
        ? 'dataElement'
        : 'trackedEntityAttribute';
      const elementItem = field[type] || field;
      if (!elementItem) {
        return true;
      }

      const availableRule = head(
        (this.programRuleActions || []).filter((ruleAction) => {
          const fieldId = ruleAction.field || ruleAction[type]?.id;

          return (
            fieldId === elementItem.id &&
            (ruleAction.programRuleActionType === 'HIDEFIELD' ||
              ruleAction.actionType === 'HIDEFIELD')
          );
        })
      );

      if (!availableRule) {
        return true;
      }

      const actionType =
        availableRule?.programRuleActionType || availableRule?.actionType;

      return actionType !== 'HIDEFIELD';
    });
  }

  get layoutCssClass(): string {
    if (!this.isFormHorizontal) {
      return 'col-12';
    }

    const numberOfFields = this.sanitizedFields.length;

    if (numberOfFields === 2) {
      return 'col-sm-6';
    }

    if (numberOfFields === 1) {
      return 'col-12';
    }

    return 'col-sm-4';
  }

  onUpdateFields(programRuleActions: any) {
    this.fields = (this.fields || []).filter((field: any) => {
      const type = field.isDataElement
        ? 'dataElement'
        : 'trackedEntityAttribute';

      const elementItem = field[type] || field;
      if (!elementItem) {
        return true;
      }

      const availableRule: any = head(
        (programRuleActions || []).filter((rule: any) => {
          return (
            rule[type] &&
            rule[type].id === elementItem.id &&
            rule.programRuleActionType === 'HIDEFIELD'
          );
        })
      );

      if (!availableRule) {
        return true;
      }

      return (
        availableRule && availableRule.programRuleActionType !== 'HIDEFIELD'
      );
    });
  }

  ngOnChanges(): void {
    this.values = this.form.getRawValue();
  }

  onSubmit(): void {
    this.formUpdate.emit(this.form.getRawValue());
  }

  onFieldUpdate(form: FormGroup, field: Field<string>): void {
    if (!this.showSaveButton && form) {
      this.formUpdate.emit(new FormValue(this.form, this.fields, field));

      this.values = form.getRawValue();
    }
  }

  onClear(): void {
    this.form.reset();
  }

  isFormInValid() {
    return this.form.invalid;
  }

  onRunTimeOptionUpdate(result: any) {
    if (this.fieldComponents) {
      const fieldToUpdate = this.fieldComponents.find(
        (fieldComponent) =>
          fieldComponent?.field?.dependentField?.id === result?.field?.id
      );

      const parentOption = result?.options.find(
        (option: { code: any }) =>
          option.code === this.form?.value[result?.field?.id]
      );

      fieldToUpdate?.onUpdateRuntimeOptions(parentOption?.options || []);
    }
  }
}
