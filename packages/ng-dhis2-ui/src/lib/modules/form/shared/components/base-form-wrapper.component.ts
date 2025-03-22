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
import { IFormField } from '../../interfaces';
import { FormValue, IMetadataRule, IMetadataRuleAction } from '../../models';
import { ProgramRuleEngine } from '@iapps/d2-web-sdk';

@Directive()
export class BaseFormWrapperComponent implements OnDestroy {
  ngZone = inject(NgZone);
  name = input<string>();
  fields = input.required<IFormField<string>[]>();
  rules = input<IMetadataRule[]>([]);
  dataValues = input<Record<string, unknown>>({});

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
