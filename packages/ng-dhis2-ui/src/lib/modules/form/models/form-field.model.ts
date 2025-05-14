import { format } from 'date-fns';
import {
  FieldControlType,
  FormFieldMetaType,
  IFormField,
  IFieldDropdown,
  FormFieldExtension,
} from '../interfaces';

interface FormFieldFunction<T> {
  setMax: (field: Partial<IFormField<T>>) => string | number | Date | undefined;
}

export class FormField<T> implements IFormField<T>, FormFieldFunction<T> {
  value?: T | '';
  id: string;
  code?: string;
  key: string;
  referenceKey?: string;
  label: string;
  required: boolean;
  order?: number;
  controlType: FieldControlType;
  type: string;
  disabled?: boolean;
  options?: IFieldDropdown[];
  placeholder?: string;
  min?: number | Date | string;
  max?: number | Date | string;
  maxLength?: number | string;
  hidden: boolean;
  units?: string;
  generated?: boolean;
  unique?: boolean;
  isDataElement?: boolean;
  isAttribute?: boolean;
  isOrgUnit?: boolean;
  isEnrollmentDate?: boolean;
  event?: string;
  programStage?: string;
  program?: string;
  trackedEntityInstance?: string;
  trackedEntityType?: string;
  hasOptions?: boolean;
  dependentField?: any;
  fieldOptionsDependsOn?: string;
  displayInList?: boolean;
  displayInReports?: boolean;
  searchable?: boolean;
  metaType?: FormFieldMetaType;
  stepId?: string;
  availableOptionsLabel?: string;
  selectedOptionsLabel?: string;
  allowFutureDate?: boolean;
  extension?: FormFieldExtension;

  constructor(options: Partial<FormField<T>> = {}) {
    this.value = options.value || '';
    this.key = options.key || '';
    this.referenceKey = options.referenceKey || '';
    this.id = options.id || '';
    this.code = options.code || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType as FieldControlType;
    this.type = options.type || '';
    this.options = options.options || [];
    this.disabled = options.disabled ?? false;
    this.placeholder = options.placeholder || '';
    this.min = options.min;
    this.max = this.setMax(options);
    this.maxLength = options.maxLength as number;
    this.hidden = options.hidden || false;
    this.unique = options.unique || false;
    this.generated = options.generated || false;
    this.isDataElement = options.isDataElement;
    this.isAttribute = options.isAttribute;
    this.isOrgUnit = options.isOrgUnit;
    this.isEnrollmentDate = options.isEnrollmentDate;
    this.event = options.event;
    this.programStage = options.programStage;
    this.program = options.program;
    this.trackedEntityInstance = options.trackedEntityInstance;
    this.trackedEntityType = options.trackedEntityType;
    this.hasOptions = options.hasOptions;
    this.dependentField = options.dependentField;
    this.displayInList = options.displayInList;
    this.displayInReports = options.displayInReports;
    this.searchable = options.searchable;
    this.unique = options.unique;
    this.metaType = options.metaType;
    this.stepId = options.stepId;
    this.availableOptionsLabel =
      options.availableOptionsLabel ?? 'Available options';
    this.selectedOptionsLabel =
      options.availableOptionsLabel ?? 'Selected options';
    this.allowFutureDate = options.allowFutureDate;
    this.extension = options.extension;
  }

  setMax(field: Partial<FormField<T>>): string | number | Date | undefined {
    if (field.controlType !== 'date') {
      return field.max;
    }

    if (field.allowFutureDate) {
      return undefined;
    }

    return format(new Date(), 'yyyy-MM-dd');
  }
}
