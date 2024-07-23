export interface TableAnalytics {
    headers: Header[];
    metaData: MetaData;
    rows: Array<string[]>;
    width: number;
    height: number;
    headerWidth: number;
}

export interface Header {
    name: string;
    column: string;
    valueType: string;
    type: string;
    hidden: boolean;
    meta: boolean;
}

export interface MetaData {
    items: { [key: string]: Item };
    dimensions: Dimensions;
}

export interface Dimensions {
    dx: string[];
    pe: string[];
    ou: string[];
    co: any[];
}

export interface Item {
    name: string;
}
