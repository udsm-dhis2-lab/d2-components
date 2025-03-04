import { IFieldDropdown } from '../interfaces';
import { sortBy } from 'lodash';
import { FieldType } from '../interfaces';

export class FieldDropdown implements IFieldDropdown {
  key!: string;
  value!: string;
  label!: string;
  order?: number | undefined;

  constructor(params: IFieldDropdown) {
    this.key = params.key;
    this.value = params.value;
    this.label = params.label;
    this.order = params.order;
  }

  toJson(): IFieldDropdown {
    return {
      key: this.key,
      value: this.value,
      label: this.label,
      order: this.order,
    };
  }

  static getDropdownOptions(field: any, locale?: string): FieldDropdown[] {
    if (field?.valueType === FieldType.BOOLEAN) {
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
      ].map((dropdown) => new FieldDropdown(dropdown));
    }

    return sortBy(
      (field?.optionSet?.options || []).map(
        (option: { id: any; code: any; name: any; sortOrder: any }) => {
          return new FieldDropdown({
            key: option.id,
            value: option.code,
            label: option.name,
            order: option.sortOrder,
          });
        }
      ),
      'order'
    );
  }
}
