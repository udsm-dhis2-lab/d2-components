// import {
//   Option,
//   ProgramRule,
//   ProgramRuleAction,
//   ProgramRuleVariable,
// } from '@iapps/d2-web-sdk';
// import { camelCase } from 'lodash';

// interface JsonTransformer<T> {
//   toJson: () => T;
// }

// export interface IMetadataRuleAction {
//   field: string;
//   actionType: string;
//   assignedData?: string;
//   displayedContent?: string;
//   options?: Partial<Option>[];
// }

// export class MetadataRuleAction
//   implements IMetadataRuleAction, JsonTransformer<IMetadataRuleAction>
// {
//   constructor(
//     private ruleAction: ProgramRuleAction,
//     private ruleVariables: ProgramRuleVariable[]
//   ) {}
//   get field(): string {
//     return (
//       (this.ruleAction.dataElement?.id as string) ||
//       (this.ruleAction.trackedEntityAttribute?.id as string)
//     );
//   }

//   get actionType(): string {
//     return this.ruleAction.programRuleActionType;
//   }

//   get assignedData(): string | undefined {
//     const regex = /(A|#|V)\{([^}]+)\}/g;

//     return this.ruleAction?.data?.replace(regex, (match, _, dataVariable) => {
//       const ruleVariableObject = this.ruleVariables?.find(
//         (variable) => variable.name === dataVariable
//       );

//       if (!ruleVariableObject) {
//         return `{${dataVariable}}`;
//       }

//       const code =
//         camelCase(ruleVariableObject?.dataElement?.code) ||
//         ruleVariableObject?.dataElement?.id ||
//         camelCase(ruleVariableObject?.trackedEntityAttribute?.code) ||
//         ruleVariableObject?.trackedEntityAttribute?.id;

//       return `{${code}}`;
//     });
//   }

//   get displayedContent(): string | undefined {
//     return this.ruleAction.displayContent;
//   }

//   get options(): Partial<Option>[] | undefined {
//     if (this.ruleAction.option) {
//       return [this.ruleAction.option];
//     }

//     return this.ruleAction.optionGroup?.options || [];
//   }

//   toJson(): IMetadataRuleAction {
//     return {
//       field: this.field,
//       actionType: this.actionType,
//       assignedData: this.assignedData,
//       displayedContent: this.ruleAction.displayContent,
//       options: this.options,
//     };
//   }
// }

// export interface IMetadataRule {
//   actions: IMetadataRuleAction[];
//   condition: string;
// }

// export class MetadataRule
//   implements IMetadataRule, JsonTransformer<IMetadataRule>
// {
//   constructor(
//     private rule: ProgramRule,
//     private ruleVariables: ProgramRuleVariable[]
//   ) {}

//   get actions(): MetadataRuleAction[] {
//     return (this.rule?.programRuleActions || []).map(
//       (action) => new MetadataRuleAction(action, this.ruleVariables)
//     );
//   }

//   get condition(): string {
//     const regex = /(A|#|V)\{([^}]+)\}/g;

//     return this.rule?.condition?.replace(regex, (match, _, ruleVariable) => {
//       const ruleVariableObject = this.ruleVariables?.find(
//         (variable) => variable.name === ruleVariable
//       );

//       if (!ruleVariableObject) {
//         return `{${ruleVariable}}`;
//       }

//       const code =
//         camelCase(ruleVariableObject?.dataElement?.code) ||
//         ruleVariableObject?.dataElement?.id ||
//         camelCase(ruleVariableObject?.trackedEntityAttribute?.code) ||
//         ruleVariableObject?.trackedEntityAttribute?.id;

//       return `{${code}}`;
//     });
//   }

//   toJson(): IMetadataRule {
//     return {
//       actions: this.actions.map((action) => action.toJson()),
//       condition: this.condition,
//     };
//   }
// }

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

const RULE_VAR_REGEX = /(A|#|V)\{([^}]+)\}/g;

export type ProgramRuleActionType =
  | 'HIDEFIELD'
  | 'SHOWFIELD'
  | 'ASSIGN'
  | 'HIDESECTION'
  | 'SHOWSECTION'
  | 'HIDEPROGRAMSTAGE'
  | 'SHOWPROGRAMSTAGE'
  | 'WARNINGONCOMPLETE'
  | 'WARNINGONCREATE'
  | 'ERRORONCOMPLETE'
  | 'ERRORONCREATE'
  | string;

export interface IMetadataRuleAction {
  field: string;
  actionType: ProgramRuleActionType;
  assignedData?: string;
  displayedContent?: string;
  options?: Partial<Option>[];
  programRule?: { id: string };
  evaluationTime?: 'ALWAYS' | 'ON_COMPLETE' | 'ON_CREATE' | string;
}

export interface IMetadataRule {
  actions: IMetadataRuleAction[];
  condition: string;
  programRule: { id: string };
}

function buildRuleVariableMap(
  ruleVariables: ProgramRuleVariable[]
): Map<string, string> {
  const map = new Map<string, string>();

  for (const v of ruleVariables ?? []) {
    if (!v?.name) continue;

    const code =
      camelCase(v?.dataElement?.code) ||
      v?.dataElement?.id ||
      camelCase(v?.trackedEntityAttribute?.code) ||
      v?.trackedEntityAttribute?.id;

    if (code) map.set(v.name, code);
  }

  return map;
}

function replaceRuleVariables(
  input: string | undefined,
  variableMap: Map<string, string>
): string | undefined {
  if (!input) return input;

  return input.replace(RULE_VAR_REGEX, (_match, _prefix, varName: string) => {
    const code = variableMap.get(varName);
    return code ? `{${code}}` : `{${varName}}`;
  });
}

export class MetadataRuleAction
  implements IMetadataRuleAction, JsonTransformer<IMetadataRuleAction>
{
  private variableMap: Map<string, string>;

  constructor(
    private ruleAction: ProgramRuleAction,
    ruleVariables: ProgramRuleVariable[]
  ) {
    this.variableMap = buildRuleVariableMap(ruleVariables);
  }

  get field(): string {
    const fieldId =
      (this.ruleAction?.dataElement?.id as string) ||
      (this.ruleAction?.trackedEntityAttribute?.id as string);

    if (!fieldId) {
      console.warn(
        `ProgramRuleAction is missing both dataElement.id and trackedEntityAttribute.id (action id: ${
          this.ruleAction?.id ?? 'unknown'
        })`
      );
    }

    return fieldId;
  }

  get programRule(): { id: string } {
    return { id: this.ruleAction.programRule?.id };
  }

  get evaluationTime(): string {
    return this.ruleAction?.evaluationTime ?? 'ALWAYS';
  }

  get actionType(): ProgramRuleActionType {
    return this.ruleAction.programRuleActionType;
  }

  get assignedData(): string | undefined {
    return replaceRuleVariables(this.ruleAction?.data, this.variableMap);
  }

  get displayedContent(): string | undefined {
    return this.ruleAction.displayContent;
  }

  get options(): Partial<Option>[] | undefined {
    if (this.ruleAction.option) return [this.ruleAction.option];
    return this.ruleAction.optionGroup?.options || [];
  }

  toJson(): IMetadataRuleAction {
    return {
      field: this.field,
      actionType: this.actionType,
      assignedData: this.assignedData,
      displayedContent: this.displayedContent,
      options: this.options,
      evaluationTime: this.evaluationTime,
      programRule: this.programRule,
    };
  }
}

export class MetadataRule
  implements IMetadataRule, JsonTransformer<IMetadataRule>
{
  private variableMap: Map<string, string>;

  constructor(private rule: ProgramRule, ruleVariables: ProgramRuleVariable[]) {
    this.variableMap = buildRuleVariableMap(ruleVariables);
  }

  get actions(): IMetadataRuleAction[] {
    return (this.rule?.programRuleActions || [])
      .map((action) => new MetadataRuleAction(action, []))
      .map((a) => a.toJson());
  }

  get programRule(): { id: string } {
    return { id: this.rule.id };
  }

  get condition(): string {
    return (
      replaceRuleVariables(this.rule?.condition ?? '', this.variableMap) ?? ''
    );
  }

  toJson(): IMetadataRule {
    return {
      actions: (this.rule?.programRuleActions || [])
        .map((action) => new MetadataRuleAction(action, []))
        .map((a) => a.toJson()),
      condition: this.condition,
      programRule: { id: this.programRule.id ?? this.rule.id },
    };
  }
}
