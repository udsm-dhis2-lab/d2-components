// Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import {
  Directive,
  effect,
  EffectRef,
  EventEmitter,
  inject,
  input,
  NgZone,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import { ProgramRuleEngine } from '@iapps/d2-web-sdk';
import { CustomOrgUnitConfig } from '../../models/org-unit.model';
import { IFormMetadata } from '../../interfaces/form-metadata.interface'
import { IProgramEntryFormMetaData } from '../../../program-entry-form/models/program-entry-form-metadata';
import { IFormField } from '../../interfaces/form-field.interface';
import { IMetadataRule, IMetadataRuleAction } from '../../models/form-metadata-rule.model';

@Directive()
export class BaseFormWrapperComponent implements OnDestroy {
  ngZone = inject(NgZone);
  name = input<string>();
  fields = input.required<IFormField<string>[]>();
  rules = input<IMetadataRule[]>([]);
  dataValues = input<Record<string, unknown>>({});
  dataId = input<string>();
  customOrgUnitRoots = input<CustomOrgUnitConfig[]>();
  formMetaData = input<IFormMetadata>();
  programEntryFormMetaData = input<IProgramEntryFormMetaData>();
  programStage = input<string>();
 //TODO: FIND BETTER WAY TO PASS PROGRAM TO FIELDS i.e field extensions
  program = input<string>();


  ruleActions = signal<IMetadataRuleAction[]>([]);
  isFormValid = signal<boolean>(true);
  #updatedDataValues = signal<Record<string, unknown>>({});

  @Output() formSave = new EventEmitter<Record<string, unknown>>();
  @Output() formUpdate = new EventEmitter<Record<string, unknown>>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formValidityUpdate = new EventEmitter<boolean>();

  ruleProcessor: EffectRef;
  constructor() {
    this.ruleProcessor = effect(() => {
      if (this.#updatedDataValues()) {
        this.executeRules();
      }
    });
  }

  updateDataValues(dataValues: Record<string, unknown>) {
    this.#updatedDataValues.set(dataValues);
    this.formUpdate.emit(this.#updatedDataValues());
  }

  updateFormValidity(isFormValid: boolean) {
    this.isFormValid.set(isFormValid);
    this.formValidityUpdate.emit(isFormValid);
  }

  protected executeRules() {
    this.ruleActions.set(
      new ProgramRuleEngine()
        .setRules(this.rules())
        .setDataValues(this.#updatedDataValues())
        .execute()
    );
  }

  ngOnDestroy(): void {
    this.ruleProcessor.destroy();
  }
}
