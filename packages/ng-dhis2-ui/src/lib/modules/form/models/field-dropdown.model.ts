import { sortBy } from 'lodash';
import { FieldType, FormFieldExtension, IFieldDropdown } from '../interfaces';

export class FieldDropdown implements IFieldDropdown {
  key!: string;
  value!: string;
  label!: string;
  order?: number | undefined;
  options?: FieldDropdown[];

  constructor(params: IFieldDropdown) {
    const rawParams = params as any;

    this.key = params.key ?? rawParams.id ?? rawParams.code ?? rawParams.name;
    this.value = params.value ?? rawParams.code ?? rawParams.name;
    this.label =
      params.label ?? rawParams.name ?? rawParams.displayName ?? rawParams.code;
    this.order = params.order ?? rawParams.sortOrder;
    this.options = params.options?.map(
      (option: IFieldDropdown) => new FieldDropdown(option)
    );
  }

  toJson(): IFieldDropdown {
    return {
      key: this.key,
      value: this.value,
      label: this.label,
      order: this.order,
      options: this.options?.map((option) => option.toJson()),
    };
  }

  static getDropdownOptions(field: any, locale?: string, extension?: FormFieldExtension): FieldDropdown[] {
        if (
      extension?.organisationUnits &&
      extension.organisationUnits.length > 0
    ) {
      return sortBy(
        extension.organisationUnits.map(
          (orgUnit: { id: any; name: any }) => {
            return new FieldDropdown({
              key: orgUnit.id,
              value: orgUnit.id,
              label: orgUnit.name,
            });
          }
        ),
        'label' 
      );
    }
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
            key: option.id ?? option.code ?? option.name,
            value: option.code ?? (option as any).value ?? option.name,
            label: option.name ?? (option as any).label ?? option.code,
            order: option.sortOrder,
            options: (option as any).options,
          });
        }
      ),
      'order'
    );
  }
}
