import {
  Component,
  EffectRef,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChildren,
  computed,
  effect,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { head } from 'lodash';
import { FormFieldComponent } from '../form-field/form-field.component';
import { CustomOrgUnitConfig } from '../../models/org-unit.model';

import { FormConfig } from '../../models/form-config.model';
import { IFormField } from '../../interfaces/form-field.interface';
import { FieldsData } from '../../models/fields-data.model';
import { IMetadataRuleAction } from '../../models/form-metadata-rule.model';
import { FormValue } from '../../models/form-value.model';
import { ProgramSection, ProgramStageSection } from '@iapps/d2-web-sdk';
import {
  CascadeConfigMap,
  CascadeKind,
  OptionsPathCascadeConfig,
} from '../../models/field-cascade.types';
import { FieldCascadeUtil } from '../../utils/field-cascade.util';
import { CoordinatePickerGeoConfig } from '../../components/coordinate-field-component';
import { FieldConfig } from '../../models';

//TODO: To move this to shared interface problaly use type from the metadata rule model since they have already been defined
type SectionRuleTargetType = 'PROGRAM_SECTION' | 'PROGRAM_STAGE_SECTION';
@Component({
  selector: 'ng-dhis2-ui-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FormComponent implements OnChanges, OnDestroy, OnInit {
  programEntryFormConfig = input<any>();
  formConfig = input<FormConfig>();
  fields = input.required<IFormField<string>[]>();
  form = input.required<FormGroup>();
  isFormHorizontal = input<boolean>(false);
  showSaveButton = input<boolean>(false);
  fieldsData = input<FieldsData>();
  formMetaData = input<any>();
  programEntryFormMetaData = input<any>();
  fieldClass = input<string>('');
  shouldRenderAsCheckBoxesButton = input<boolean>(false);
  programRuleActions = input<IMetadataRuleAction[]>([]);
  dataEntities = input<any>(undefined);
  dataId = input<string>();
  customOrgUnitRoots = input<CustomOrgUnitConfig[]>();
  optionCascadeConfigs = input<OptionsPathCascadeConfig[]>([]);
  coordinatePickerGeoConfig = input<CoordinatePickerGeoConfig>();

  /** ✅ Build map once when configs change */
  optionCascadeConfigMap = computed<CascadeConfigMap>(() => {
    const configs = this.optionCascadeConfigs() ?? [];

    // (optional) guard if you later widen union types
    const optionPathConfigs = configs.filter(
      (c): c is OptionsPathCascadeConfig => c?.kind === CascadeKind.OPTIONS_PATH
    );

    // util returns: Readonly<Record<string, OptionsPathCascadeConfig>>
    return FieldCascadeUtil.buildConfigByChildFieldId(
      optionPathConfigs
    ) as unknown as CascadeConfigMap;
  });

  //TODO: FIND BETTER WAY TO PASS PROGRAM TO FIELDS i.e field extensions
  program = input<string>();

  collapsibleSections = input<boolean>(false);
  private openSectionId = signal<string | number | null>(null);

  configuration = computed(() => {
    if (!this.formConfig()) {
      const fieldConfig = new FieldConfig({
        fieldDescriptionLabel:
          this.programEntryFormConfig()?.fieldDescriptionLabel,
      });

      return new FormConfig({
        direction: this.isFormHorizontal() ? 'horizontal' : 'vertical',
        fieldConfig,
      });
    }

    return this.formConfig() as FormConfig;
  });

  @Output() formUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Output() formValidityUpdate: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  @ViewChildren(FormFieldComponent) fieldComponents!: FormFieldComponent[];

  values: any;

  // get sanitizedFields(): IFormField<string>[] {
  //   return (this.fields() || []).filter((field: any) => {
  //     if (field.hidden) {
  //       return false;
  //     }

  //     const type = field.isDataElement
  //       ? 'dataElement'
  //       : 'trackedEntityAttribute';
  //     const elementItem = field[type] || field;
  //     if (!elementItem) {
  //       return true;
  //     }

  //     const availableRule = head(
  //       (this.programRuleActions() || []).filter((ruleAction) => {
  //         return (
  //           ruleAction.field === elementItem.id &&
  //           ruleAction.actionType === 'HIDEFIELD'
  //         );
  //       })
  //     );

  //     if (!availableRule) {
  //       return true;
  //     }

  //     return availableRule.actionType !== 'HIDEFIELD';
  //   });
  // }

  readonly fieldControlKeyById = computed<Record<string, string>>(() => {
    const list = this.fields() ?? []; // or sanitizedFields
    const map: Record<string, string> = Object.create(null);

    for (const f of list) {
      if (!f?.id) continue;

      // Prefer explicit key if present, else fall back to id.
      map[f.id] = f.key || f.id;
    }

    return map;
  });

  get layoutCssClass(): string {
    if (!this.isFormHorizontal()) {
      return 'col-12';
    }

    const numberOfFields = this.sanitizedFields.length;

    if (numberOfFields === 2) {
      return 'col-sm-6';
    }

    if (numberOfFields === 1) {
      return 'col-12';
    }

    return 'col-sm-4';
  }

  ruleProcessor: EffectRef;

  constructor() {
    this.ruleProcessor = effect(() => {
      this.#processRules(this.programRuleActions());
    });

    effect(() => {
      if (!this.collapsibleSections()) return;

      const meta = this.programEntryFormMetaData?.();

      const sections =
        Array.isArray(meta?.programStageSections) &&
        meta.programStageSections.length > 0
          ? meta.programStageSections
          : Array.isArray(meta?.sections) && meta.sections.length > 0
          ? meta.sections
          : [];

      if (!sections.length) return;

      if (this.openSectionId() == null) {
        const firstId = sections[0]?.id ?? 0;
        this.openSectionId.set(firstId);
      }
    });
  }

  resolveSections(meta: any): any {
    if (!meta) return [];
    const stageSections: ProgramStageSection[] =
      meta.programStageSections ?? [];
    const genericSections: ProgramSection[] = meta.sections ?? [];

    const sections: any =
      (stageSections?.length ? stageSections : genericSections) ?? [];

    return sections.map((s: any) => ({
      id: s?.id ?? s?.uid ?? crypto?.randomUUID?.() ?? String(Math.random()),
      name: s?.name ?? s?.displayName ?? 'Section',
      description: s?.description ?? '',
      formFields: s?.formFields ?? [],
    }));
  }

  // // NEW: open a section; keep at least one open at all times
  // openSection(section: { id?: string | number }, index: number): void {
  //   if (!this.collapsibleSections()) return;

  //   const id = section?.id ?? index;
  //   // if clicking the already-open section, do nothing (always keep one open)
  //   if (this.openSectionId() === id) return;

  //   this.openSectionId.set(id);
  // }

  private getSections(): any[] {
    const meta = this.programEntryFormMetaData?.();
    if (!meta) return [];

    // Normalize to array only if it's valid and non-empty
    if (
      Array.isArray(meta.programStageSections) &&
      meta.programStageSections.length > 0
    ) {
      return meta.programStageSections;
    }

    if (Array.isArray(meta.sections) && meta.sections.length > 0) {
      return meta.sections;
    }

    return [];
  }

  openSection(section: { id?: string | number }, index: number): void {
    if (!this.collapsibleSections()) return;

    const sections = this.getSections();
    if (!sections.length) return;

    const clickedId = section?.id ?? index;
    const currentId = this.openSectionId();

    if (currentId === clickedId) {
      // clicked the currently open section → open the next one (wrap to first)
      const nextIndex = (index + 1) % sections.length;

      // ToDo: Get Backward | Un-comment Below
      // const nextIndex = index === sections.length - 1 ? 0 : index + 1;

      const nextId = sections[nextIndex]?.id ?? nextIndex;
      this.openSectionId.set(nextId);
    } else {
      // clicked a different section → open it
      this.openSectionId.set(clickedId);
    }
  }

  // NEW: helper used in template
  isSectionOpen(section: { id?: string | number }, index: number): boolean {
    if (!this.collapsibleSections()) return true;
    const id = section?.id ?? index;
    return this.openSectionId() === id;
  }

  //TODO: To move the section visible check to a custom rule implementation for program sections
  isSectionVisible(
    section: { id?: string } | null | undefined,
    expectedSectionType: SectionRuleTargetType
  ): boolean {
    const sectionId = section?.id;
    if (!sectionId) return true;

    if (expectedSectionType === 'PROGRAM_SECTION') {
      return this.getVisibleSectionFields(section).length > 0;
    }

    const sectionActions = (this.programRuleActions() || []).filter(
      (action: IMetadataRuleAction) =>
        action.section === sectionId &&
        action.sectionType === expectedSectionType
    );

    const hasShowSectionAction = sectionActions.some(
      (action) => action.actionType === 'SHOWSECTION'
    );

    const hasHideSectionAction = sectionActions.some(
      (action) => action.actionType === 'HIDESECTION'
    );

    return hasShowSectionAction || !hasHideSectionAction;
  }

  ngOnInit(): void {
    this.values = this.form().getRawValue();

    // TODO: This is uneccesary emit at this stage of execution, since nothing has changes at initiation and potentially break some of implementation that depends formUpdate, which also is triggered when there is actual change in the form apart form initial values that came with it
    this.formUpdate.emit(new FormValue(this.form(), this.fields()));
    this.formValidityUpdate.emit(
      new FormValue(this.form(), this.fields()).isValid
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.values = this.form().getRawValue();
  }

  #processRules(ruleActions: IMetadataRuleAction[]) {
    ruleActions.forEach((ruleAction) => {
      switch (ruleAction.actionType) {
        case 'HIDEFIELD': {
          const fieldToRemove = this.fields().find(
            (field) => field.id === ruleAction.field
          );

          if (fieldToRemove) {
            const form = this.form();
            const currentValue = form.get(fieldToRemove.key)?.value;
            const shouldPreserveValue =
              fieldToRemove.disabled || fieldToRemove.generated;

            if (currentValue != null && !shouldPreserveValue) {
              form.get(fieldToRemove.key)?.setValue(null);
              this.onFieldUpdate(form, fieldToRemove);
            }
          }
          break;
        }

        default:
          break;
      }
    });
  }

  onSubmit(): void {
    this.formUpdate.emit(this.form().getRawValue());
    this.formValidityUpdate.emit(this.form().valid);
    this.formValidityUpdate.emit(
      new FormValue(this.form(), this.fields()).isValid
    );
  }

  onFieldUpdate(form: FormGroup, field: IFormField<string>): void {
    if (!this.showSaveButton() && form) {
      this.formUpdate.emit(new FormValue(this.form(), this.fields(), field));
      this.formValidityUpdate.emit(this.form().valid);

      this.values = form.getRawValue();
    }
  }

  onClear(): void {
    this.form().reset();
  }

  isFormInValid() {
    return this.form().invalid;
  }

  private getOptionValue(option: any): string {
    return String(
      option?.value ?? option?.code ?? option?.key ?? option?.id ?? ''
    );
  }

  onRunTimeOptionUpdate(result: any) {
    if (this.fieldComponents) {
      const fieldToUpdate = this.fieldComponents.find(
        (fieldComponent) =>
          fieldComponent?.field()?.dependentField?.id === result?.field?.id
      );

      const selectedValue = String(
        this.form()?.value[result?.field?.id] ??
          this.form()?.value[result?.field?.key] ??
          ''
      );

      const parentOption = result?.options.find(
        (option: any) => this.getOptionValue(option) === selectedValue
      );

      fieldToUpdate?.onUpdateRuntimeOptions(parentOption?.options || []);
    }
  }

  ngOnDestroy(): void {
    this.ruleProcessor.destroy();
  }

  // get sanitizedFields(): IFormField<string>[] {
  //   return (this.fields() || []).filter(
  //     (field) => !this.isFieldHiddenByRules(field)
  //   );
  // }

  // getVisibleSectionFields(section: any): IFormField<string>[] {
  //   const rawFields: IFormField<string>[] = section?.formFields ?? [];
  //   return rawFields.filter((field) => !this.isFieldHiddenByRules(field));
  // }

  // private isFieldHiddenByRules(field: IFormField<string>): boolean {
  //   if (field.hidden) {
  //     return true;
  //   }

  //   const type = (field as any).isDataElement
  //     ? 'dataElement'
  //     : 'trackedEntityAttribute';

  //   const elementItem = (field as any)[type] || field;
  //   if (!elementItem) return false;

  //   const rule = (this.programRuleActions() || []).find(
  //     (ruleAction) =>
  //       ruleAction.field === elementItem.id &&
  //       ruleAction.actionType === 'HIDEFIELD'
  //   );

  //   return !!rule;
  // }

  // 1) Precompute the hidden field ids from programRuleActions()
  private readonly hiddenFieldIds = computed<Set<string>>(() => {
    const actions = this.programRuleActions() || [];

    return new Set(
      actions
        .filter((ruleAction) => ruleAction.actionType === 'HIDEFIELD')
        .map((ruleAction) => ruleAction.field)
        .filter((id): id is string => !!id)
    );
  });

  get sanitizedFields(): IFormField<string>[] {
    return (this.fields() || []).filter(
      (field) => !this.isFieldHiddenByRules(field)
    );
  }

  getVisibleSectionFields(section: any): IFormField<string>[] {
    const rawFields: IFormField<string>[] = section?.formFields ?? [];
    return rawFields.filter((field) => !this.isFieldHiddenByRules(field));
  }

  private isFieldHiddenByRules(field: IFormField<string>): boolean {
    if ((field as IFormField<string>).hidden) {
      return true;
    }

    const type = (field as IFormField<string>).isDataElement
      ? 'dataElement'
      : 'trackedEntityAttribute';

    const elementItem = (field as IFormField<string>) || field;
    if (!elementItem || !elementItem.id) {
      return false;
    }

    return this.hiddenFieldIds().has(elementItem.id);
  }
}
