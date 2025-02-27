import { DHIS2Event } from '../models';

export function EventDateField(): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newValue) {
        const event = this as DHIS2Event;
        event.setEventDate(newValue);
      },
      get() {
        const event = this as DHIS2Event;
        return event?.occurredAt || event.eventDate;
      },
    };

    return adjustedDescripter;
  };
}
