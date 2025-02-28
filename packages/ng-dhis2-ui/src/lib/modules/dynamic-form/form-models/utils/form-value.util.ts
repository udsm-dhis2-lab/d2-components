import { FormValue } from '../models/form-value.model';

export class FormValueUtil {
  static getFormDataEntities(formValueEntities: Record<string, FormValue>) {
    const formValueKeys = Object.keys(formValueEntities);

    return formValueKeys.reduce((entity, key) => {
      const formValue = formValueEntities[key];

      const formRawValues = formValue.form.getRawValue() || {};
      const dataValueEntities = Object.keys(formRawValues).reduce(
        (valueObject, key) => {
          const field = formValue.fields.find((field) => field.id === key);

          if (!field) {
            return valueObject;
          }

          return {
            ...valueObject,
            [key]: {
              ...field,
              value: formRawValues[key],
              attribute: field?.isAttribute ? field.id : undefined,
              dataElement: field?.isDataElement ? field.id : undefined,
            },
          };
        },
        {}
      );
      return { ...entity, ...dataValueEntities };
    }, {});
  }
}
