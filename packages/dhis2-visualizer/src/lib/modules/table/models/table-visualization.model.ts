export interface TableVisualization {
    lastUpdated: string;
    href: string;
    id: string;
    created: string;
    name: string;
    legend: Legend;
    publicAccess: string;
    userOrganisationUnitChildren: boolean;
    legendDisplayStyle: string;
    type: string;
    hideEmptyColumns: boolean;
    subscribed: boolean;
    userOrganisationUnit: boolean;
    rowSubTotals: boolean;
    cumulativeValues: boolean;
    showDimensionLabels: boolean;
    sortOrder: number;
    fontSize: string;
    favorite: boolean;
    topLimit: number;
    userOrganisationUnitGrandChildren: boolean;
    displayName: string;
    percentStackedValues: boolean;
    noSpaceBetweenColumns: boolean;
    showHierarchy: boolean;
    hideTitle: boolean;
    skipRounding: boolean;
    showData: boolean;
    numberType: string;
    hideEmptyRows: boolean;
    parentGraphMap: any;
    displayDensity: string;
    completedOnly: boolean;
    colTotals: boolean;
    sharing: Sharing;
    displayFormName: string;
    aggregationType: string;
    hideSubtitle: boolean;
    hideLegend: boolean;
    externalAccess: boolean;
    legendDisplayStrategy: string;
    colSubTotals: boolean;
    rowTotals: boolean;
    digitGroupSeparator: string;
    regression: boolean;
    access: Access;
    reportingParams: ReportingParams;
    lastUpdatedBy: CreatedBy;
    relativePeriods: { [key: string]: boolean };
    createdBy: CreatedBy;
    legendSet: LegendSet;
    user: CreatedBy;
    dataElementGroupSetDimensions: any[];
    attributeDimensions: any[];
    translations: any[];
    yearlySeries: any[];
    filterDimensions: any[];
    interpretations: any[];
    userGroupAccesses: any[];
    subscribers: any[];
    optionalAxes: any[];
    columns: LegendSet[];
    dataElementDimensions: any[];
    periods: any[];
    categoryDimensions: any[];
    rowDimensions: string[];
    itemOrganisationUnitGroups: any[];
    programIndicatorDimensions: any[];
    attributeValues: any[];
    columnDimensions: string[];
    userAccesses: any[];
    favorites: any[];
    dataDimensionItems: DataDimensionItem[];
    categoryOptionGroupSetDimensions: any[];
    organisationUnitGroupSetDimensions: any[];
    organisationUnitLevels: any[];
    organisationUnits: any[];
    filters: any[];
    rows: LegendSet[];
}

export interface Access {
    read: boolean;
    update: boolean;
    externalize: boolean;
    delete: boolean;
    write: boolean;
    manage: boolean;
}

export interface LegendSet {
    id: string;
}

export interface CreatedBy {
    displayName: string;
    name: string;
    id: string;
    username: string;
}

export interface DataDimensionItem {
    dataDimensionItemType: string;
    indicator: LegendSet;
}

export interface Legend {
    hidden: boolean;
}

export interface ReportingParams {
    parentOrganisationUnit: boolean;
    reportingPeriod: boolean;
    organisationUnit: boolean;
    grandParentOrganisationUnit: boolean;
}

export interface Sharing {
    owner?: string;
    external: boolean;
    users: any;
    userGroups: any;
    public?: string;
}
