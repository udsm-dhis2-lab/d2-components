import { FieldControlType, FieldType } from '../interfaces';

export class FieldControlTypeUtil {
  static getFieldControlType(
    valueType: string,
    hasOptions: boolean
  ): FieldControlType {
    if (hasOptions) {
      if (valueType === FieldType.MULTI_TEXT) {
        return 'multi-dropdown';
      }
      return 'dropdown';
    }

    switch (valueType) {
      case FieldType.TEXT:
        return 'textbox';
      case FieldType.MULTI_TEXT:
        return 'multi-dropdown';
      case FieldType.BOOLEAN:
        return 'dropdown';
      case FieldType.LONG_TEXT:
        return 'textarea';
      case FieldType.TRUE_ONLY:
        return 'checkbox';
      case FieldType.NUMBER:
        return 'textbox';
      case FieldType.INTEGER_ZERO_OR_POSITIVE:
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
}
