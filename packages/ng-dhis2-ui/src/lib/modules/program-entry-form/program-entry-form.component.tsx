import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  NgZone,
  Output,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Button, ButtonStrip, CircularLoader } from '@dhis2/ui';
import {
  BaseEventQuery,
  BaseTrackerQuery,
  D2EventResponse,
  D2TrackerResponse,
  D2Window,
  DHIS2Event,
  Program,
  TrackedEntityInstance,
} from '@iapps/d2-web-sdk';
import React, { useEffect, useState } from 'react';
import { firstValueFrom, Observable, of } from 'rxjs';
import { D2FormModule } from '../form/form.module';
import { IFormMetadata } from '../form/interfaces/form-metadata.interface';
import { CustomOrgUnitConfig } from '../form/models/org-unit.model';
import { ReactWrapperModule } from '../react-wrapper/react-wrapper.component';
import {
  AutoAssignedValues,
  IProgramEntryFormMetaData,
  ProgramEntryFormConfig,
  ProgramEntryFormMetaData,
} from './models';

@Component({
  selector: 'ng-dhis2-ui-program-entry-form',
  templateUrl: './program-entry-form.component.html',
  styleUrls: ['./program-entry-form.component.scss'],

  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [D2FormModule, ReactWrapperModule],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ProgramEntryFormModule {
  config = input.required<ProgramEntryFormConfig>();
  trackedEntity = input<string>();
  event = input<string>();
  enrollment = input<string>();
  orgUnit = input<string>();
  codeGeneratorOrgUnit = input<string>();
  customOrgUnitRoots = input<CustomOrgUnitConfig[]>();
  formMetaData = input<IFormMetadata>();
  collapsibleSections = input<boolean>(false);

  ngZone = inject(NgZone);
  d2 = (window as unknown as D2Window).d2Web;

  loading = signal<boolean>(false);
  metaData = signal<IProgramEntryFormMetaData | null>(null);
  isFormValid = signal<boolean>(true);
  isFormValid$: Observable<boolean> = toObservable(this.isFormValid);
  instance = signal<TrackedEntityInstance | DHIS2Event | null>(null);
  trackedEntityInstance = signal<TrackedEntityInstance | null>(null);
  instanceQuery!:
    | BaseTrackerQuery<TrackedEntityInstance>
    | BaseEventQuery<DHIS2Event>;

  preprocess =
    input<
      (payload: { instance: TrackedEntityInstance | DHIS2Event }) => void
    >();

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

  dataId = computed(() => {
    if (this.config().formType === 'EVENT') {
      return this.instance()?.event;
    }
    if (this.config().formType === 'TRACKER') {
      return this.instance()?.trackedEntity;
    }
    return undefined;
  });

  dataEntities = computed<Record<string, unknown>>(() => {
    if (!this.instance()) {
      return {};
    }

    const attributeDataValues = this.trackedEntityInstance()
      ? this.#getTrackedEntityDataValues(this.trackedEntityInstance()!)
      : {};

    // TODO: Consider refactoring this logic to avoid potential issues with nested data values. The current implementation may not handle deeply nested structures correctly, which could lead to unexpected behavior when updating the instance with new data values.
    const currentInstanceDataValues =
      this.config().formType === 'TRACKER'
        ? this.#getTrackedEntityDataValues(
            this.instance() as TrackedEntityInstance
          )
        : this.instance();

    return {
      ...attributeDataValues,
      ...(currentInstanceDataValues || {}),
    };
  });

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
          {!(this.config().hideSubmitButton || this.config().disableForm) && (
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

  #getTrackedEntityDataValues(trackedEntity: TrackedEntityInstance) {
    const attributeDataValues = Object.keys(
      trackedEntity?.attributeEntities ?? {}
    ).reduce((acc, key) => {
      acc[key] = trackedEntity?.attributeEntities?.[key]?.value;
      return acc;
    }, {} as Record<string, unknown>);

    return {
      ...attributeDataValues,
      ...(trackedEntity?.reportEntities ?? {}),
    };
  }

  async ngOnInit() {
    this.loading.set(true);

    try {
      const config = this.config();

      const metaData = await new ProgramEntryFormMetaData()
        .setConfig(config)
        .get();

      if (!metaData) {
        console.error('ProgramEntryFormMetaData.get() returned null');
        return;
      }

      this.metaData.set(metaData);

      const instance = await this.#getInstance();

      if (!instance) {
        console.error(
          'Failed to create or load instance for program entry form'
        );
        return;
      }

      this.instance.set(instance);

      const autoAssigned = config.autoAssignedValues;
      if (autoAssigned?.length) {
        this.#updateInstanceWithAutoAssignedValues(autoAssigned);
      }
    } catch (error) {
      console.error('Error during ProgramEntryForm initialization', error);
    } finally {
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

  #resolveFieldRuntimeId(
    configuredKey: string,
    metaData?: IProgramEntryFormMetaData | null
  ): string {
    const formFields = metaData?.formFields;
    if (!formFields || formFields.length === 0) {
      return configuredKey;
    }

    for (let index = 0; index < formFields.length; index++) {
      const currentField = formFields[index] as any;

      if (currentField.id === configuredKey) {
        return currentField.id;
      }

      if (
        currentField.attribute === configuredKey ||
        currentField.trackedEntityAttribute === configuredKey
      ) {
        return currentField.id;
      }

      if (currentField.dataElement === configuredKey) {
        return currentField.id;
      }
    }

    return configuredKey;
  }

  #updateInstanceWithAutoAssignedValues(
    autoAssignedValues: AutoAssignedValues[]
  ) {
    const trackedEntityId = this.trackedEntity?.();
    if (
      typeof trackedEntityId === 'string' &&
      trackedEntityId.trim().length > 0
    ) {
      return;
    }

    const valueCount = autoAssignedValues?.length ?? 0;
    if (valueCount === 0) {
      return;
    }

    const metaData = this.metaData();
    const aggregatedValues: Record<string, unknown> = {};

    for (let index = 0; index < valueCount; index++) {
      const { field: configuredKey, value } = autoAssignedValues[index];

      const semanticKey = metaData
        ? this.#resolveFieldRuntimeId(configuredKey, metaData)
        : configuredKey;

      aggregatedValues[semanticKey] = value;

      if (configuredKey !== semanticKey) {
        aggregatedValues[configuredKey] = value;
      }
    }

    if (Object.keys(aggregatedValues).length === 0) {
      return;
    }

    this.#updateInstance(aggregatedValues);
  }

  #updateInstance(dataValues: Record<string, unknown>) {
    if (!dataValues || Object.keys(dataValues).length === 0) {
      return;
    }

    const shouldUpdateOrgUnit = this.config().updateTeiOrgUnit;

    this.instance.update((instance) => {
      if (!instance) {
        return instance;
      }

      for (const key in dataValues) {
        if (Object.prototype.hasOwnProperty.call(dataValues, key)) {
          (instance as TrackedEntityInstance | DHIS2Event)[key] =
            dataValues[key];
        }
      }

      instance.updateDataValues(dataValues, shouldUpdateOrgUnit);

      return instance;
    });
  }

  async #saveInstance(): Promise<
    | D2TrackerResponse<TrackedEntityInstance>
    | D2EventResponse<DHIS2Event>
    | null
  > {
    if (this.preprocess() && this.instance()) {
      this.preprocess()!({
        instance: this.instance()!,
      });
    }

    switch (this.config().formType) {
      case 'TRACKER': {
        if (this.config().autoComplete) {
          this.instance()!.complete();
        }
        const instanceQuery = this.#getQuery(
          'TRACKER'
        ) as BaseTrackerQuery<TrackedEntityInstance>;

        return instanceQuery
          .setData(this.instance() as TrackedEntityInstance)
          .save();
      }

      case 'EVENT': {
        if (this.config().autoComplete) {
          this.instance()!.complete();
        }
        const instanceQuery = this.#getQuery(
          'EVENT'
        ) as BaseEventQuery<DHIS2Event>;

        return instanceQuery.setData(this.instance() as DHIS2Event).save();
      }

      default:
        return firstValueFrom(of(null));
    }
  }

  async #setReservedValuesForCodeGeneration(
    instance: TrackedEntityInstance
  ): Promise<TrackedEntityInstance> {
    const orgUnitForCodeGeneration =
      this.codeGeneratorOrgUnit() || this.orgUnit();

    const reservedValueQuery = this.d2.trackerModule.trackedEntity.setProgram(
      this.config().program
    );

    if (orgUnitForCodeGeneration) {
      reservedValueQuery.setOrgUnit(orgUnitForCodeGeneration);
    }

    const reservedValues = await reservedValueQuery.generateReservedValues(
      instance
    );

    reservedValues.forEach((reserved) => {
      instance.setAttributeValue(reserved.ownerUid, reserved.value);
    });

    return instance;
  }

  #getQuery(instanceType: 'TRACKER' | 'EVENT') {
    const d2 = (window as unknown as D2Window).d2Web;
    switch (instanceType) {
      case 'TRACKER':
        return d2.trackerModule.trackedEntity
          .setProgram(this.config().program)
          .setOrgUnit(this.orgUnit() as string);

      case 'EVENT':
        return d2.eventModule.event
          .setProgram(this.config().program)
          .setProgramStage(this.config().programStage as string)
          .setEnrollment(this.enrollment() as string)
          .setTrackedEntity(this.trackedEntity() as string)
          .setOrgUnit(this.orgUnit() as string);

      default:
        throw new Error('Invalid form type');
    }
  }

  async #getTrackerInstance(): Promise<TrackedEntityInstance> {
    const instanceQuery = this.#getQuery(
      'TRACKER'
    ) as BaseTrackerQuery<TrackedEntityInstance>;

    if (!instanceQuery) {
      throw new Error('Could not initialize tracker query');
    }

    if (!this.trackedEntity()) {
      return await instanceQuery.create();
    }

    const instanceResult = (
      await instanceQuery.setTrackedEntity(this.trackedEntity() as string).get()
    ).data as TrackedEntityInstance;

    if (!instanceResult) {
      return await instanceQuery.create();
    }

    instanceQuery.setInstanceFields(this.metaData()?.program as Program);

    const instance = await instanceQuery.setReservedValues();

    if (this.orgUnit()) {
      instance.setOrgUnit(this.orgUnit() as string);
    }

    return instance;
  }

  async #getEventInstance() {
    const instanceQuery = this.#getQuery('EVENT') as BaseEventQuery<DHIS2Event>;

    if (!this.event()) {
      return await instanceQuery.create();
    }

    const instance = (
      await instanceQuery.setEvent(this.event() as string).get()
    ).data as DHIS2Event;

    if (!instance) {
      return await instanceQuery.create();
    }

    if (this.metaData()?.program) {
      instance.setFields(this.metaData()!.program);
    }

    return instance;
  }

  async #getInstance(): Promise<TrackedEntityInstance | DHIS2Event | null> {
    switch (this.config().formType) {
      case 'TRACKER':
        return this.#getTrackerInstance();

      case 'EVENT': {
        if (this.trackedEntity()) {
          const trackedEntityInstance = await this.#getTrackerInstance();

          this.trackedEntityInstance.set(trackedEntityInstance);
        }

        return this.#getEventInstance();
      }

      default:
        return firstValueFrom(of(null));
    }
  }
}
