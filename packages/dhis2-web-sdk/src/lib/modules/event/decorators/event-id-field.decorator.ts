import { DHIS2Event } from '../models';

export function EventIdFieldDecorator(): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newValue) {
        const event = this as DHIS2Event;
        event.event = newValue;
      },
      get() {
        const event = this as DHIS2Event;
        return event?.event;
      },
    };

    return adjustedDescripter;
  };
}
