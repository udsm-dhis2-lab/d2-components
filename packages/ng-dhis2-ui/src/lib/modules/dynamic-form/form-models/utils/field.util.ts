import { DropdownOption } from '../models/dropdown-option.model';
import { flatten, sortBy } from 'lodash';
import { FieldControlType, FieldType } from '../interfaces';
//import { Program } from '@eoc/d2-web-sdk';
import { Field } from '../models';

export class FieldUtil {
  static getFieldDropdownOptions(field: any): DropdownOption[] {
    if (field.valueType === FieldType.BOOLEAN) {
      return [
        {
          key: 'Yes',
          value: 'true',
          label: 'Yes',
          order: 1,
        },
        {
          key: 'No',
          value: 'false',
          label: 'No',
          order: 2,
        },
      ];
    }

    return FieldUtil.sanitizeOptions(field.optionSet?.options || []);
  }

  static sanitizeOptions(options: any[]): any {
    return sortBy(
      (options || []).map((option) => ({
        key: option.id,
        value: option.code,
        label: option.name,
        order: option.sortOrder,
        color: option.style?.color,
        attributeValues: option.attributeValues,
        options: FieldUtil.sanitizeOptions(option.options),
      })),
      'order'
    );
  }

  static getFieldType(valueType: string) {
    switch (valueType) {
      case FieldType.NUMBER:
        return 'number';
      case FieldType.PHONE_NUMBER:
        return 'tel';
      case FieldType.ORG_UNIT:
        return 'org-unit';
      case FieldType.DATE:
        return 'date';
      case FieldType.FILE_RESOURCE:
        return 'file';
      default:
        return 'text';

    }
  }

  static getFieldControlType(
    valueType: string,
    hasOptions: boolean
  ): FieldControlType {
    if (hasOptions) {
      return 'dropdown';
    }

    switch (valueType) {
      case FieldType.TEXT:
        return 'textbox';
      case FieldType.LONG_TEXT:
        return 'textarea';
      case FieldType.TRUE_ONLY:
        return 'checkbox';
      case FieldType.NUMBER:
        return 'textbox';
      case FieldType.PHONE_NUMBER:
        return 'textbox';
      case FieldType.ORG_UNIT:
        return 'org-unit';
      case FieldType.DATE:
        return 'date';
      case FieldType.DATE_TIME:
        return 'date-time';
      case FieldType.IMAGE:
        return 'image';
      case FieldType.FILE_RESOURCE:
        return 'file';
      default:
        return 'textbox';
    }
  }

  static getOptionEntities?(options: any[]) {
    return (options || []).reduce((entity, option) => {
      return { ...entity, [option.value]: option.label };
    }, {});
  }
}
