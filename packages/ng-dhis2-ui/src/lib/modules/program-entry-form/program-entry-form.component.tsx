import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  NgZone,
  Output,
  signal,
} from '@angular/core';
import {
  AutoAssignedValues,
  IProgramEntryFormMetaData,
  ProgramEntryFormConfig,
  ProgramEntryFormMetaData,
} from './models';
import { D2FormModule } from '../form';
import { CircularLoader, ButtonStrip, Button } from '@dhis2/ui';
import React, { useEffect, useState } from 'react';
import { ReactWrapperModule } from '../react-wrapper/react-wrapper.component';
import { firstValueFrom, Observable, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  BaseEventQuery,
  BaseTrackerQuery,
  D2EventResponse,
  D2TrackerResponse,
  D2Window,
  DHIS2Event,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';

@Component({
  selector: 'ng-dhis2-ui-program-entry-form',
  templateUrl: './program-entry-form.component.html',
  styleUrls: ['./program-entry-form.component.scss'],

  imports: [CommonModule, D2FormModule, ReactWrapperModule],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ProgramEntryFormModule {
  config = input.required<ProgramEntryFormConfig>();
  trackedEntity = input<string>();
  event = input<string>();
  enrollment = input<string>();
  orgUnit = input<string>();

  ngZone = inject(NgZone);
  d2 = (window as unknown as D2Window).d2Web;

  loading = signal<boolean>(false);
  metaData = signal<IProgramEntryFormMetaData | null>(null);
  isFormValid = signal<boolean>(true);
  isFormValid$: Observable<boolean> = toObservable(this.isFormValid);
  instance = signal<TrackedEntityInstance | DHIS2Event | null>(null);
  instanceQuery!:
    | BaseTrackerQuery<TrackedEntityInstance>
    | BaseEventQuery<DHIS2Event>;

  @Output() instanceSave = new EventEmitter<
    TrackedEntityInstance | DHIS2Event
  >();
  @Output() instanceSaveCompleted = new EventEmitter<
    | D2TrackerResponse<TrackedEntityInstance>
    | D2EventResponse<DHIS2Event>
    | null
  >();
  @Output() instanceUpdate = new EventEmitter<
    TrackedEntityInstance | DHIS2Event
  >();
  @Output() formValidityUpdate = new EventEmitter<boolean>();
  @Output() formCancel = new EventEmitter();

  FormLoader = () => {
    return <CircularLoader small />;
  };

  FormActionButtons = computed(() => {
    if (this.config().hideActionButtons) {
      return <></>;
    }

    return () => {
      const [isValid, setIsValid] = useState<boolean>();
      const [submitting, setSubmitting] = useState<boolean>(false);

      useEffect(() => {
        const isValidSubscription = this.isFormValid$.subscribe((isValid) => {
          setIsValid(isValid);
        });

        return () => {
          isValidSubscription.unsubscribe();
        };
      }, []);

      const onSave = () => {
        setSubmitting(true);
        this.ngZone.run(async () => {
          const saveResponse = await this.#saveInstance();

          this.instanceSaveCompleted.emit(saveResponse);

          setSubmitting(false);
        });
      };
      return (
        <ButtonStrip>
          {!this.config().hideSubmitButton && (
            <Button
              primary
              disabled={!isValid}
              loading={submitting}
              onClick={onSave}
            >
              {this.config().submitButtonLabel}
            </Button>
          )}
          {!this.config().hideCancelButton && (
            <Button
              onClick={() => {
                this.ngZone.run(() => {
                  this.onCancel();
                });
              }}
            >
              {this.config().cancelButtonLabel}
            </Button>
          )}
        </ButtonStrip>
      );
    };
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      // Loading metadata
      const metaData = await new ProgramEntryFormMetaData()
        .setConfig(this.config())
        .get();
      this.metaData.set(metaData);

      // Load initial instance information
      const instance = await this.#getInstance();
      this.instance.set(instance);

      if (this.config().autoAssignedValues) {
        this.#updateInstanceWithAutoAssignedValues(
          this.config().autoAssignedValues || []
        );
      }

      this.loading.set(false);
    } catch (err) {
      this.loading.set(false);
    }
  }

  onFormUpdate(dataValues: Record<string, unknown>) {
    this.#updateInstance(dataValues);
    if (this.instance()) {
      this.instanceUpdate.emit(
        this.instance() as TrackedEntityInstance | DHIS2Event
      );
    }
  }

  onValidityUpdate(isFormValid: boolean) {
    this.isFormValid.set(isFormValid);
    this.formValidityUpdate.emit(isFormValid);
  }

  onCancel() {
    this.formCancel.emit();
  }

  #updateInstanceWithAutoAssignedValues(
    autoAssignedValues: AutoAssignedValues[]
  ) {
    const assignedDataValues = autoAssignedValues.reduce(
      (entities, assignedValue) => {
        return {
          ...entities,
          [assignedValue.field]: assignedValue.value,
        };
      },
      {}
    );
    this.#updateInstance(assignedDataValues);
  }
  #updateInstance(dataValues: Record<string, unknown>) {
    this.instance.update((instance) => {
      instance?.updateDataValues(dataValues);

      return instance;
    });
  }

  async #saveInstance(): Promise<
    | D2TrackerResponse<TrackedEntityInstance>
    | D2EventResponse<DHIS2Event>
    | null
  > {
    switch (this.config().formType) {
      case 'TRACKER':
        return (this.instanceQuery as BaseTrackerQuery<TrackedEntityInstance>)
          .setData(this.instance() as TrackedEntityInstance)
          .save();

      case 'EVENT':
        return (this.instanceQuery as BaseEventQuery<DHIS2Event>)
          .setData(this.instance() as DHIS2Event)
          .save();

      default:
        return firstValueFrom(of(null));
    }
  }

  async #getTrackerInstance(): Promise<TrackedEntityInstance> {
    this.instanceQuery = this.d2.trackerModule.trackedEntity
      .setProgram(this.config().program)
      .setOrgUnit(this.orgUnit() as string);

    if (!this.trackedEntity) {
      return await this.instanceQuery.create();
    }

    const instance = (
      await this.instanceQuery
        .setTrackedEntity(this.trackedEntity() as string)
        .get()
    ).data as TrackedEntityInstance;

    if (!instance) {
      return await this.instanceQuery.create();
    }

    if (this.metaData()?.program) {
      instance.setFields(this.metaData()!.program);
    }

    return instance;
  }

  async #getEventInstance() {
    this.instanceQuery = this.d2.eventModule.event
      .setProgram(this.config().program)
      .setProgramStage(this.config().programStage as string)
      .setEnrollment(this.enrollment() as string)
      .setTrackedEntity(this.trackedEntity() as string)
      .setOrgUnit(this.orgUnit() as string);

    return this.event()
      ? ((await this.instanceQuery.setEvent(this.event() as string).get())
          .data as DHIS2Event) || (await this.instanceQuery.create())
      : await this.instanceQuery.create();
  }

  #getInstance(): Promise<TrackedEntityInstance | DHIS2Event | null> {
    switch (this.config().formType) {
      case 'TRACKER':
        return this.#getTrackerInstance();

      case 'EVENT':
        return this.#getEventInstance();

      default:
        return firstValueFrom(of(null));
    }
  }
}
