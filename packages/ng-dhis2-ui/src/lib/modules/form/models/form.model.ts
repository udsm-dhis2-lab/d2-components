import { DropdownOption } from '../../form-field/models/dropdown-option.model';
import { FormField } from '../../form-field/models/form-field.model';

export interface EocForm {
  id: string;
  uuid: string;
  name: string;
  setMembers: EocForm[];
  options?: DropdownOption[];
  dataType?: string;
  formClass: string;
  formField?: FormField<string>;
  formFields: FormField<string>[];
  concept?: any;
}
