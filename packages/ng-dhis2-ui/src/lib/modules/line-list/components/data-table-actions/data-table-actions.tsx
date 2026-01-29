/* eslint-disable @typescript-eslint/no-explicit-any */
// // Copyright 2025 UDSM DHIS2 Lab. All rights reserved.
// // Use of this source code is governed by a BSD-style
// // license that can be found in the LICENSE file.

// import {
//   ActionOptionOrientation,
//   DropdownMenuOption,
//   LineListActionOption,
// } from '../../models';
// import { DropdownMenu } from '../dropdown-menu';
// import React from 'react';
// import { ButtonStrip, Button, colors } from '@dhis2/ui';
// import { TableRow } from '../../models/line-list.models';
// import { LineListRowActionFilterConfig } from '@iapps/d2-web-sdk';

// export const DataTableActions = (props: {
//   data: TableRow;
//   actionOptions: LineListActionOption[];
//   rowActionFilterConfig: LineListRowActionFilterConfig;
//   actionOptionOrientation: ActionOptionOrientation;
//   onClick: (dropdownOption: LineListActionOption) => void;
// }) => {
//   const {
//     data,
//     actionOptions,
//     rowActionFilterConfig,
//     actionOptionOrientation,
//     onClick,
//   } = props;

//   console.log(
//     'REACHED HERE AND IMPROVE THE FOLLOWING::: ',
//     // JSON.stringify(data),
//     rowActionFilterConfig
//   );

//   switch (actionOptionOrientation) {
//     case 'BUTTON':
//       return (
//         <ButtonStrip>
//           {actionOptions.map((option) => (
//             <Button
//               key={option.label}
//               onClick={() => onClick(option)}
//               icon={option.icon ? <option.icon /> : <></>}
//               small
//               destructive={option.destructive}
//             >
//               {!option.iconOnly ? option.label : ''}
//             </Button>
//           ))}
//         </ButtonStrip>
//       );

//     case 'DROPDOWN':
//       return (
//         <DropdownMenu
//           dropdownOptions={actionOptions}
//           onClick={(option) => {
//             onClick(option);
//           }}
//         />
//       );

//     case 'LINK':
//       return (
//         <div
//           style={{
//             display: 'flex',
//             gap: 16,
//             alignItems: 'center',
//           }}
//         >
//           {actionOptions.map((option) => (
//             <a
//               style={{
//                 cursor: 'pointer',
//                 textDecoration: 'underline',
//                 fontSize: 14,
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: 4,
//                 color: option.destructive ? colors.red700 : colors.grey900,
//               }}
//               key={option.label}
//               onClick={(event: any) => {
//                 event.stopPropagation();
//                 onClick(option);
//               }}
//             >
//               {option.icon ? <option.icon /> : <></>}
//               {!option.iconOnly ? <span>{option.label}</span> : <></>}
//             </a>
//           ))}
//         </div>
//       );

//     default:
//       return <></>;
//   }
// };

import React, { useMemo } from 'react';
import { ButtonStrip, Button, colors } from '@dhis2/ui';

import { ActionOptionOrientation, LineListActionOption } from '../../models';
import { DropdownMenu } from '../dropdown-menu';
import { TableRow } from '../../models/line-list.models';

import type {
  GuardOperator,
  LineListRowActionFilterConfig,
  ActionFilterRule,
} from '@iapps/d2-web-sdk';

/**
 * Row payload is TEI-like in your line-list rows (responseData.value).
 * Keep it intentionally narrow for safety and performance.
 */
type TeiRowPayload = {
  trackedEntity?: string;
  enrollments?: Array<{
    program?: string;
    events?: Array<{
      programStage?: string;
      program?: string;
      event?: string;
    }>;
  }>;
  attributes?: Array<{
    attribute?: string;
    code?: string;
    value?: any;
  }>;
};

const extractTeiPayloadFromRow = (row: TableRow): TeiRowPayload | null =>
  ((row as any)?.responseData?.value as TeiRowPayload) ?? null;

/** Operator matcher (fast + predictable) */
const matchesOperator = (
  actual: unknown,
  op: GuardOperator,
  expected?: string | string[]
): boolean => {
  const actualStr = actual == null ? '' : String(actual);
  const expectedList = Array.isArray(expected)
    ? expected.map(String)
    : expected != null
    ? [String(expected)]
    : [];

  switch (op) {
    case 'EXISTS':
      return actual != null;
    case 'NOT_EXISTS':
      return actual == null;
    case 'HAS_VALUE':
      return actualStr.trim().length > 0;
    case 'NO_VALUE':
      return actualStr.trim().length === 0;
    case 'EQ':
      return actualStr === (expectedList[0] ?? '');
    case 'NEQ':
      return actualStr !== (expectedList[0] ?? '');
    case 'IN':
      return expectedList.includes(actualStr);
    case 'NOT_IN':
      return !expectedList.includes(actualStr);
    default:
      return false;
  }
};

type TeiFacts = {
  enrolledProgramIds: Set<string>;
  eventCountByStageId: Record<string, number>;
  attributeValueById: Record<string, any>;
  attributeValueByCode: Record<string, any>;
};

/**
 * Extract facts needed for rule evaluation from the TEI payload.
 * This is O(enrollments + events + attributes) and uses plain objects for speed.
 */
const buildTeiFacts = (teiPayload: TeiRowPayload): TeiFacts => {
  const enrolledProgramIds = new Set<string>();
  const eventCountByStageId: Record<string, number> = Object.create(null);
  const attributeValueById: Record<string, any> = Object.create(null);
  const attributeValueByCode: Record<string, any> = Object.create(null);

  const enrollments = teiPayload.enrollments ?? [];
  for (const enrollment of enrollments) {
    if (enrollment?.program) enrolledProgramIds.add(enrollment.program);

    const events = enrollment?.events ?? [];
    for (const ev of events) {
      const stageId = ev?.programStage;
      if (!stageId) continue;
      eventCountByStageId[stageId] = (eventCountByStageId[stageId] ?? 0) + 1;
    }
  }

  const attributes = teiPayload.attributes ?? [];
  for (const attr of attributes) {
    const attrId = attr?.attribute;
    const attrCode = attr?.code;
    const value = attr?.value;

    if (attrId) attributeValueById[attrId] = value;
    if (attrCode) attributeValueByCode[attrCode] = value;
  }

  return {
    enrolledProgramIds,
    eventCountByStageId,
    attributeValueById,
    attributeValueByCode,
  };
};

const doesRuleMatchFacts = (
  rule: ActionFilterRule,
  facts: TeiFacts
): boolean => {
  // Enrollment condition
  if (rule.enrollment) {
    const hasEnrollment = facts.enrolledProgramIds.has(
      rule.enrollment.programId
    );
    if (hasEnrollment !== rule.enrollment.mustExist) return false;
  }

  // Stage event existence condition
  if (rule.stageEvent) {
    const count =
      facts.eventCountByStageId[rule.stageEvent.programStageId] ?? 0;
    const hasStageEvent = count > 0;
    if (hasStageEvent !== rule.stageEvent.mustExist) return false;
  }

  // Attribute condition (support by id OR code)
  if (rule.attribute) {
    const value = rule.attribute.attributeId
      ? facts.attributeValueById[rule.attribute.attributeId]
      : undefined;

    if (!matchesOperator(value, rule.attribute.op, rule.attribute.value))
      return false;
  }

  return true;
};

type CompiledFilterConfig = {
  enabled: boolean;
  fallback: LineListRowActionFilterConfig['fallback'];
  combine: LineListRowActionFilterConfig['combine'];
  rulesSorted: ActionFilterRule[];
};

const compileFilterConfig = (
  config?: LineListRowActionFilterConfig
): CompiledFilterConfig | null => {
  if (!config?.enabled) return null;

  // Sort once, not per row render
  const rulesSorted = [...(config.rules ?? [])].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );

  return {
    enabled: true,
    fallback: config.fallback ?? 'NO_FILTER',
    combine: config.combine ?? 'APPLY_ALL',
    rulesSorted,
  };
};

const computeAllowedActionIdsForRow = (
  baseActionIds: string[],
  compiled: CompiledFilterConfig,
  facts: TeiFacts
): string[] => {
  const matchedRules: ActionFilterRule[] = [];

  for (const rule of compiled.rulesSorted) {
    if (doesRuleMatchFacts(rule, facts)) {
      matchedRules.push(rule);
      if (compiled.combine === 'FIRST_MATCH') break;
    }
  }

  // If nothing matched: return base or empty depending on fallback
  if (matchedRules.length === 0) {
    return compiled.fallback === 'NO_FILTER' ? baseActionIds : [];
  }

  let allowed = new Set(baseActionIds);

  for (const rule of matchedRules) {
    if (rule.effect === 'HIDE') {
      for (const actionId of rule.actions) allowed.delete(actionId);
    } else {
      // SHOW_ONLY
      allowed = new Set(rule.actions.filter((id) => allowed.has(id)));
    }
  }

  return Array.from(allowed);
};

export const DataTableActions = (props: {
  data: TableRow;
  actionOptions: LineListActionOption[];
  rowActionFilterConfig?: LineListRowActionFilterConfig;
  actionOptionOrientation: ActionOptionOrientation;
  onClick: (action: LineListActionOption) => void;
}) => {
  const {
    data: row,
    actionOptions,
    rowActionFilterConfig,
    actionOptionOrientation: orientation,
    onClick: onActionClick,
  } = props;

  const compiledConfig = useMemo(
    () => compileFilterConfig(rowActionFilterConfig),
    [rowActionFilterConfig]
  );

  const visibleActions = useMemo(() => {
    const base = actionOptions ?? [];

    // No config => show base
    if (!compiledConfig) return base;

    // Extract embedded TEI payload (already available in row)
    const teiPayload = extractTeiPayloadFromRow(row);

    // If no payload => do not filter (your requirement)
    if (!teiPayload) return base;

    // Prefer stable action id; fallback to label as legacy
    const baseActionIds = base.map((a) => a.id ?? a.label);

    const facts = buildTeiFacts(teiPayload);
    const allowedIds = computeAllowedActionIdsForRow(
      baseActionIds,
      compiledConfig,
      facts
    );

    // If allowedIds equals baseActionIds, this filter is basically no-op,
    // but we keep a cheap Set to filter objects correctly.
    const allowedSet = new Set(allowedIds);
    return base.filter((a) => allowedSet.has(a.id ?? a.label));
  }, [actionOptions, row, compiledConfig]);

  switch (orientation) {
    case 'BUTTON':
      return (
        <ButtonStrip>
          {visibleActions.map((action) => (
            <Button
              key={action.id ?? action.label}
              onClick={() => onActionClick(action)}
              icon={action.icon ? <action.icon /> : <></>}
              small
              destructive={action.destructive}
            >
              {!action.iconOnly ? action.label : ''}
            </Button>
          ))}
        </ButtonStrip>
      );

    case 'DROPDOWN':
      return (
        <DropdownMenu
          dropdownOptions={visibleActions}
          onClick={(action) => onActionClick(action)}
        />
      );

    case 'LINK':
      return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {visibleActions.map((action) => (
            <a
              key={action.id ?? action.label}
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: action.destructive ? colors.red700 : colors.grey900,
              }}
              onClick={(event: any) => {
                event.stopPropagation();
                onActionClick(action);
              }}
            >
              {action.icon ? <action.icon /> : <></>}
              {!action.iconOnly ? <span>{action.label}</span> : <></>}
            </a>
          ))}
        </div>
      );

    default:
      return <></>;
  }
};
