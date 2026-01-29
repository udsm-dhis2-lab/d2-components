export type ActionKey = string;

export type GuardOperator =
    | 'EXISTS'
    | 'NOT_EXISTS'
    | 'HAS_VALUE'
    | 'NO_VALUE'
    | 'EQ'
    | 'NEQ'
    | 'IN'
    | 'NOT_IN';

export interface ActionFilterRule {
    id: string;
    description?: string;

    /** Which actions this rule affects */
    actions: ActionKey[];

    /** If rule matches, how to apply */
    effect: 'HIDE' | 'SHOW_ONLY';

    /** Optional: require enrollment for a program */
    enrollment?: {
        programId: string;
        mustExist: boolean;
    };

    /** Optional: require an event existence for a stage (within that program enrollment) */
    stageEvent?: {
        programId: string;
        programStageId: string;
        mustExist: boolean;
    };

    /** Optional: attribute check */
    attribute?: {
        attributeId: string;
        op: GuardOperator;
        value?: string | string[];
    };

    /** Rule ordering */
    priority?: number;
}

export interface LineListRowActionFilterConfig {
    enabled: boolean;

    /** If no rules match: keep original actions (your requirement) */
    fallback: 'NO_FILTER' | 'HIDE_ALL';

    /** Apply all matching rules or only the first (by priority) */
    combine: 'APPLY_ALL' | 'FIRST_MATCH';

    rules: ActionFilterRule[];
}
