import {
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
}

export class MetadataRuleAction
  implements IMetadataRuleAction, JsonTransformer<IMetadataRuleAction>
{
  constructor(private ruleAction: ProgramRuleAction) {}
  get field(): string {
    return (
      (this.ruleAction.dataElement?.id as string) ||
      (this.ruleAction.trackedEntityAttribute?.id as string)
    );
  }

  get actionType(): string {
    return this.ruleAction.programRuleActionType;
  }

  toJson(): IMetadataRuleAction {
    return {
      field: this.field,
      actionType: this.actionType,
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
      (action) => new MetadataRuleAction(action)
    );
  }

  get condition(): string {
    const regex = /(A|#)\{([^}]+)\}/g;

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
