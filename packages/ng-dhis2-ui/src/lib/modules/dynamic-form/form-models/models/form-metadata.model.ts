import { flatten } from 'lodash';
import { IFormMetadataSection, IFormMetadata } from '../interfaces';
import { FormMetadataSection } from './form-metadata-section.model';
import { IMetadataRule, MetadataRule } from './form-metadata-rule.model';
import { Field } from './field.model';
import { Program, ProgramRule, ProgramRuleVariable } from '@iapps/d2-web-sdk';
import { TranslationUtil } from '../utils/translation.util';

export class FormMetaData implements IFormMetadata {
  id!: string;
  name!: string;
  description?: string | undefined;
  downloadSqlView?: string | undefined;

  constructor(
    private params: {
      formMetaData: Partial<FormMetaData>;
      programs: Program[];
      locale?: string;
    }
  ) {}

  get sections(): IFormMetadataSection[] {
    return (this.params.formMetaData.sections || [])
      .map((section) => {
        const program = this.params.programs.find(
          (program) => section.program === program['id']
        );

        if (!program) {
          return null;
        }

        return new FormMetadataSection({
          section,
          program,
          locale: this.params.locale,
        }).toJson();
      })
      .filter((section) => section !== null) as IFormMetadataSection[];
  }

  get fields(): Field<string>[] {
    return flatten(
      flatten(
        this.sections.map((section) =>
          section.fieldGroups.map((fieldGroup) => fieldGroup.fields || [])
        )
      )
    );
  }

  get rules(): IMetadataRule[] {
    let ruleVariables: ProgramRuleVariable[] = [];
    return [
      ...(this.params.formMetaData.rules || []),
      ...(
        flatten(
          this.params.programs.map((program) => {
            ruleVariables = [
              ...ruleVariables,
              ...(program.programRuleVariables as ProgramRuleVariable[]),
            ];
            return program.programRules;
          })
        ) || []
      ).map((rule) =>
        new MetadataRule(rule as ProgramRule, ruleVariables).toJson()
      ),
    ];
  }

  toJson(): IFormMetadata {
    return {
      id: this.params.formMetaData?.id as string,
      name: TranslationUtil.getTranslatedFormName(
        this.params.formMetaData,
        this.params.locale
      ),
      fields: this.fields,
      sections: this.sections,
      rules: this.rules,
    };
  }
}
