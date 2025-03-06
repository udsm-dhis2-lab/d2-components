export interface SelectionFiltersProps {
    actionOptions: ActionOption[];
    attributeFilters: AttributeFilter[];
    dataElementFilters: DataElementFilter[];
    startDate: string;
    endDate: string;
}

export interface ActionOption {
    label: string;
    onClick: () => void;
}

export interface DataElementFilter {
    programStage: string;
    dataElement: string;
    name: string;
    valueType: string;
    hasOptions: boolean;
    operator: string;
    value: string;
    options: Option[];
}

export interface Option {
    id: string;
    code: string;
    name: string;
}

export interface AttributeFilter {
    attribute: string;
    operator: string;
    name: string;
    valueType: string;
    hasOptions: boolean;
    code: string;
    value: string;
    options: Option[];
}

