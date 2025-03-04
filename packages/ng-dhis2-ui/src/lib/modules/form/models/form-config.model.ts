import { FieldConfig } from '../../form-field/models/field-config.model';

export type FormDirection = 'horizontal' | 'vertical';

export class FormConfig {
  direction: FormDirection;
  showSaveButton: boolean;
  formName?: string;
  fieldConfig!: FieldConfig;

  constructor(config?: Partial<FormConfig>) {
    this.direction = config?.direction || 'vertical';
    this.showSaveButton = config?.showSaveButton ?? true;
    this.fieldConfig = config?.fieldConfig || new FieldConfig();
    this.formName = config?.formName;
  }

  get directionClassName() {
    return this.direction === 'vertical' ? 'form-vertical' : 'form-horizontal';
  }
}
