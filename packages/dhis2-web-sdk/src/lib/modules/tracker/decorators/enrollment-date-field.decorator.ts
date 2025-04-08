import { TrackedEntityInstance } from '../models';

export function EnrollmentDateFieldDecorator(): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newValue) {
        const instance = this as TrackedEntityInstance;
        instance.setEnrollmentDate(newValue);
      },
      get() {
        const instance = this as TrackedEntityInstance;
        return instance?.latestEnrollment?.enrollmentDate;
      },
    };

    return adjustedDescripter;
  };
}
