// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { DHIS2Event, IDHIS2Event, TrackedEntityInstance } from '../models';

export function DataElementField(
  dataElement: string,
  programStage?: string,
  fromTracker = false
): PropertyDecorator {
  return function () {
    const adjustedDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      set(this, newValue) {
        setDataElementField(
          this as TrackedEntityInstance | DHIS2Event,
          dataElement,
          fromTracker,
          newValue,
          programStage
        );
      },
      get() {
        return getDataElementField(
          this as TrackedEntityInstance | DHIS2Event,
          dataElement,
          fromTracker,
          programStage
        );
      },
    };

    return adjustedDescripter;
  };
}

export function getDataElementField(
  instance: TrackedEntityInstance | DHIS2Event,
  dataElement: string,
  fromTracker: boolean,
  programStage?: string
) {
  if (fromTracker) {
    const event: IDHIS2Event | undefined = (
      (instance as TrackedEntityInstance).latestEnrollment?.events || []
    ).find((event) => event.programStage === programStage);

    if (!event) {
      return undefined;
    }

    return (event as DHIS2Event).getDataValue(dataElement)?.value;
  }

  return (instance as DHIS2Event).getDataValue
    ? instance.getDataValue(dataElement)?.value
    : undefined;
}

export function setDataElementField(
  instance: TrackedEntityInstance | DHIS2Event,
  dataElement: string,
  fromTracker: boolean,
  value: unknown,
  programStage?: string
) {
  if (fromTracker) {
    instance?.setProgramStageData(programStage as string, [
      {
        dataElement,
        value,
      },
    ]);
  } else {
    (instance as DHIS2Event)?.setDataValue({
      dataElement: dataElement,
      value: value as string,
    });
  }
}
