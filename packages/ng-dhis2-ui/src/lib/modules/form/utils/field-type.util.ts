import { FieldType } from '../interfaces';

export class FormFieldTypeUtil {
  static getFieldType(valueType: string) {
    switch (valueType) {
      case FieldType.NUMBER:
        return 'number';
      case FieldType.INTEGER_ZERO_OR_POSITIVE:
        return 'number';
      case FieldType.ORG_UNIT:
        return 'org-unit';
      case FieldType.IMAGE:
        return 'image';
      case FieldType.FILE_RESOURCE:
        return 'file';
      case FieldType.COORDINATE:
        return 'coordinate';
      case FieldType.DATE_TIME:
        return 'date-time';
      default:
        return 'text';
    }
  }
}
