import {
  Option,
  ProgramRule,
  ProgramRuleAction,
  ProgramRuleVariable,
} from '@iapps/d2-web-sdk';
import { camelCase } from 'lodash';

interface JsonTransformer<T> {
  toJson: () => T;
}

export interface IMetadataRuleAction {
  field: string;
  actionType: string;
  assignedData?: string;
  displayedContent?: string;
  options?: Partial<Option>[];
}

export class MetadataRuleAction
  implements IMetadataRuleAction, JsonTransformer<IMetadataRuleAction>
{
  constructor(
    private ruleAction: ProgramRuleAction,
    private ruleVariables: ProgramRuleVariable[]
  ) {}
  get field(): string {
    return (
      (this.ruleAction.dataElement?.id as string) ||
      (this.ruleAction.trackedEntityAttribute?.id as string)
    );
  }

  get actionType(): string {
    return this.ruleAction.programRuleActionType;
  }

  get assignedData(): string | undefined {
    const regex = /(A|#|V)\{([^}]+)\}/g;

    return this.ruleAction?.data?.replace(regex, (match, _, dataVariable) => {
      const ruleVariableObject = this.ruleVariables?.find(
        (variable) => variable.name === dataVariable
      );

      if (!ruleVariableObject) {
        return `{${dataVariable}}`;
      }

      const code =
        camelCase(ruleVariableObject?.dataElement?.code) ||
        ruleVariableObject?.dataElement?.id ||
        camelCase(ruleVariableObject?.trackedEntityAttribute?.code) ||
        ruleVariableObject?.trackedEntityAttribute?.id;

      return `{${code}}`;
    });
  }

  get displayedContent(): string | undefined {
    return this.ruleAction.displayContent;
  }

  get options(): Partial<Option>[] | undefined {
    if (this.ruleAction.option) {
      return [this.ruleAction.option];
    }

    return this.ruleAction.optionGroup?.options || [];
  }

  toJson(): IMetadataRuleAction {
    return {
      field: this.field,
      actionType: this.actionType,
      assignedData: this.assignedData,
      displayedContent: this.ruleAction.displayContent,
      options: this.options,
    };
  }
}

export interface IMetadataRule {
  actions: IMetadataRuleAction[];
  condition: string;
}

export class MetadataRule
  implements IMetadataRule, JsonTransformer<IMetadataRule>
{
  constructor(
    private rule: ProgramRule,
    private ruleVariables: ProgramRuleVariable[]
  ) {}

  get actions(): MetadataRuleAction[] {
    return (this.rule?.programRuleActions || []).map(
      (action) => new MetadataRuleAction(action, this.ruleVariables)
    );
  }

  get condition(): string {
    const regex = /(A|#|V)\{([^}]+)\}/g;

    return this.rule?.condition?.replace(regex, (match, _, ruleVariable) => {
      const ruleVariableObject = this.ruleVariables?.find(
        (variable) => variable.name === ruleVariable
      );

      const code =
        camelCase(ruleVariableObject?.dataElement?.code) ||
        ruleVariableObject?.dataElement?.id ||
        camelCase(ruleVariableObject?.trackedEntityAttribute?.code) ||
        ruleVariableObject?.trackedEntityAttribute?.id;

      return `{${code}}`;
    });
  }

  toJson(): IMetadataRule {
    return {
      actions: this.actions.map((action) => action.toJson()),
      condition: this.condition,
    };
  }
}
