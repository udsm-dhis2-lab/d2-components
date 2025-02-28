import { DropdownOption } from './dropdown-option.model';
import { Field } from './field.model';

export interface EocForm {
  id: string;
  uuid: string;
  name: string;
  setMembers: EocForm[];
  options?: DropdownOption[];
  dataType?: string;
  formClass: string;
  formField?: Field<string>;
  formFields: Field<string>[];
  concept?: any;
}
