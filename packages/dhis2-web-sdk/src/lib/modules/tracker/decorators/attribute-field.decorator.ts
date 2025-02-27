import { TrackedEntityInstance } from '../models';
import { AttributeUtil } from '../utils';

export function AttributeField(
  attributeId: string,
  generated?: boolean
): PropertyDecorator {
  return function (target: any, propertyKey: any) {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newValue) {
        const instance = this as TrackedEntityInstance;
        // TODO: This is a hack to capture attribute ID, find better way to do this
        instance.fields = {
          ...(instance.fields || {}),
          [propertyKey]: {
            id: attributeId,
            type: 'ATTRIBUTE',
            generated,
          },
        };

        instance.setAttributeValue(attributeId, newValue);
      },
      get() {
        const instance = this as TrackedEntityInstance;

        return AttributeUtil.getAttributeValue(
          attributeId,
          instance['attributes']
        ) as string;
      },
    };

    return adjustedDescripter;
  };
}
