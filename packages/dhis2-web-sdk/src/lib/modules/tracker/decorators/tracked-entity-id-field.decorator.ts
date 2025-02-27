import { TrackedEntityInstance } from '../models';

export function TrackedEntityIdField(): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newValue) {
        const instance = this as TrackedEntityInstance;

        instance.trackedEntity = newValue;
        instance.trackedEntityInstance = newValue;
      },
      get() {
        const instance = this as TrackedEntityInstance;
        return instance?.trackedEntity;
      },
    };

    return adjustedDescripter;
  };
}
