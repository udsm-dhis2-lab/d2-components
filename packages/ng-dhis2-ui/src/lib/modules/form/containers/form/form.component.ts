import {
  Component,
  EffectRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChildren,
  computed,
  effect,
  input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { head } from 'lodash';
import {
  FieldsData,
  FormConfig,
  FormField,
  FormValue,
  IMetadataRuleAction,
} from '../../models';
import { FormFieldComponent } from '../form-field/form-field.component';

@Component({
  selector: 'ng-dhis2-ui-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: false,
})
export class FormComponent implements OnChanges, OnDestroy {
  formConfig = input<FormConfig>();
  @Input() fields!: FormField<string>[];
  @Input() form!: FormGroup;
  @Input() isFormHorizontal!: boolean;
  @Input() showSaveButton!: boolean;
  @Input() fieldsData!: FieldsData;
  @Input() fieldClass!: string;
  @Input() shouldRenderAsCheckBoxesButton!: boolean;
  programRuleActions = input<IMetadataRuleAction[]>([]);
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

  @ViewChildren(FormFieldComponent) fieldComponents!: FormFieldComponent[];

  values: any;

  get sanitizedFields(): FormField<string>[] {
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
        (this.programRuleActions() || []).filter((ruleAction) => {
          return (
            ruleAction.field === elementItem.id &&
            ruleAction.actionType === 'HIDEFIELD'
          );
        })
      );

      if (!availableRule) {
        return true;
      }

      return availableRule.actionType !== 'HIDEFIELD';
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

  ruleProcessor: EffectRef;
  constructor() {
    this.ruleProcessor = effect(() => {
      this.#processRules(this.programRuleActions());
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.values = this.form.getRawValue();
  }

  #processRules(ruleActions: IMetadataRuleAction[]) {
    ruleActions.forEach((ruleAction) => {
      switch (ruleAction.actionType) {
        case 'HIDEFIELD': {
          const fieldToRemove = this.fields.find(
            (field) => field.id === ruleAction.field
          );

          if (fieldToRemove) {
            this.form.get(fieldToRemove.key)?.setValue('');
            this.onFieldUpdate(this.form, fieldToRemove);
          }
          break;
        }

        default:
          break;
      }
    });
  }

  onSubmit(): void {
    this.formUpdate.emit(this.form.getRawValue());
  }

  onFieldUpdate(form: FormGroup, field: FormField<string>): void {
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
          fieldComponent?.field()?.dependentField?.id === result?.field?.id
      );

      const parentOption = result?.options.find(
        (option: { code: any }) =>
          option.code === this.form?.value[result?.field?.id]
      );

      fieldToUpdate?.onUpdateRuntimeOptions(parentOption?.options || []);
    }
  }

  ngOnDestroy(): void {
    this.ruleProcessor.destroy();
  }
}
