export interface SelectionFiltersProps {
    actionOptions: ActionOption[];
    programAttributesFilters: ProgramAttributesFilter[];
    programStageDataElementFilters: ProgramStageDataElementFilter[];
    startDate: string;
    endDate: string;
    program: string;
    organisationUnit: string;
}

export interface ActionOption {
    label: string;
    onClick: () => void;
}

export interface Option {
    id: string;
    code: string;
    name: string;
}

export interface ProgramAttributesFilter {
    attribute: string;
    program: string;
    operator: string;
    valueType?: string;
    name: string;
    hasOptions: boolean;
    shortName: string;
    formName: string;
    code: string;
    value: string;
    options: Option[];
}

export interface ProgramStageDataElementFilter {
    programStage: string;
    program: string;
    dataElement: string;
    hasOptions: boolean;
    valueType?: string;
    name: string;
    operator: string;
    shortName: string;
    formName: string;
    value: string;
    options: Option[];
}

export interface TableRow {
    [key: string]: string | number;
    index: number;
}

export interface ColumnDefinition {
    column: string;
    display: string;
    index?: string;
    visible?: boolean;
}
