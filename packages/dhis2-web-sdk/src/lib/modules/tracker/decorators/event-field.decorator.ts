// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DHIS2Event, TrackedEntityInstance } from '../models';
import { isEmpty } from 'lodash';

export function EventField(
  programStage: string,
  EventClass?: typeof DHIS2Event,
  multiple?: boolean
): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newEvent: DHIS2Event | DHIS2Event[]) {
        if (!isEmpty(newEvent)) {
          const instance = this as TrackedEntityInstance;

          if (multiple) {
            const events = newEvent as DHIS2Event[];

            events.forEach((event) => {
              event.programStage = programStage;
              event.program = instance.program;
              event.enrollment = instance.latestEnrollment?.enrollment;
              event.orgUnit = instance.orgUnit;
              event.trackedEntity = instance.trackedEntity;
              instance.setEvent(event);
            });
          } else {
            const event = newEvent as DHIS2Event;
            event.programStage = programStage;
            event.program = instance.program;
            event.enrollment = instance.latestEnrollment.enrollment;
            event.orgUnit = instance.orgUnit;
            event.trackedEntity = instance.trackedEntity;
            instance.setEvent(event);
          }
        }
      },
      get() {
        const instance = this as TrackedEntityInstance;
        const events = (instance?.latestEnrollment?.events || []).filter(
          (event) => event.programStage === programStage
        );

        if (EventClass) {
          return multiple
            ? events.map((event) => new EventClass(event))
            : new EventClass((events || [])[0] || {});
        }

        return (events || [])[0];
      },
    };

    return adjustedDescripter;
  };
}
