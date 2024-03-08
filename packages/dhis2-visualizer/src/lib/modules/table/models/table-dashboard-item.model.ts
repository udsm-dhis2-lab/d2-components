export interface TableDashboardItem {
    lastUpdated: string;
    id: string;
    created: string;
    type: string;
    externalAccess: boolean;
    contentCount: number;
    height: number;
    interpretationCount: number;
    sharing: LegendSharing;
    width: number;
    x: number;
    y: number;
    interpretationLikeCount: number;
    favorite: boolean;
    visualization: ReportTable;
    access: Access;
    reportTable: ReportTable;
    favorites: any[];
    reports: any[];
    translations: any[];
    userGroupAccesses: any[];
    attributeValues: any[];
    resources: any[];
    users: any[];
    userAccesses: any[];
}

export interface Access {
    read: boolean;
    update: boolean;
    externalize: boolean;
    delete: boolean;
    write: boolean;
    manage: boolean;
}

export interface ReportTable {
    lastUpdated: string;
    id: string;
    created: string;
    name: string;
    numberType: string;
    publicAccess: string;
    userOrganisationUnitChildren: boolean;
    legendDisplayStyle: string;
    hideEmptyColumns: boolean;
    subscribed: boolean;
    hideEmptyRows: boolean;
    parentGraphMap: ParentGraphMap;
    userOrganisationUnit: boolean;
    rowSubTotals: boolean;
    displayDensity: string;
    completedOnly: boolean;
    sharing: LegendSetSharing;
    colTotals: boolean;
    displayFormName: string;
    showDimensionLabels: boolean;
    sortOrder: number;
    fontSize: string;
    favorite: boolean;
    topLimit: number;
    aggregationType: string;
    userOrganisationUnitGrandChildren: boolean;
    displayName: string;
    hideSubtitle: boolean;
    externalAccess: boolean;
    legendDisplayStrategy: string;
    colSubTotals: boolean;
    showHierarchy: boolean;
    rowTotals: boolean;
    cumulative?: boolean;
    digitGroupSeparator: string;
    hideTitle: boolean;
    regression: boolean;
    skipRounding: boolean;
    lastUpdatedBy: CreatedBy;
    access: Access;
    relativePeriods: { [key: string]: boolean };
    createdBy: CreatedBy;
    legendSet?: LegendSet;
    user: CreatedBy;
    dataElementGroupSetDimensions: any[];
    attributeDimensions: any[];
    translations: any[];
    filterDimensions: any[];
    interpretations: any[];
    itemOrganisationUnitGroups: any[];
    userGroupAccesses: any[];
    programIndicatorDimensions: any[];
    subscribers: any[];
    attributeValues: any[];
    columnDimensions: string[];
    userAccesses: any[];
    favorites: any[];
    dataDimensionItems: DataDimensionItem[];
    categoryOptionGroupSetDimensions: any[];
    columns: any[];
    organisationUnitGroupSetDimensions: any[];
    organisationUnitLevels: any[];
    dataElementDimensions: any[];
    periods: any[];
    organisationUnits: any[];
    categoryDimensions: any[];
    filters: any[];
    rows: any[];
    rowDimensions: string[];
    type?: string;
    cumulativeValues?: boolean;
    percentStackedValues?: boolean;
    noSpaceBetweenColumns?: boolean;
    showData?: boolean;
    regressionType?: string;
    hideEmptyRowItems?: string;
    hideLegend?: boolean;
    axes?: any[];
    yearlySeries?: any[];
    optionalAxes?: any[];
    series?: any[];
}

export interface CreatedBy {
    displayName: string;
    name: string;
    id: string;
    username: string;
}

export interface DataDimensionItem {
    dataDimensionItemType: string;
    indicator?: CommonMetadata;
    dataElement?: CommonMetadata;
}

export interface CommonMetadata {
    id: string;
}

export interface LegendSet {
    created: string;
    lastUpdated: string;
    name: string;
    id: string;
    displayName: string;
    publicAccess: string;
    sharing: LegendSetSharing;
    externalAccess: boolean;
    favorite: boolean;
    lastUpdatedBy: CreatedBy;
    access: Access;
    createdBy: CreatedBy;
    user: CreatedBy;
    favorites: any[];
    userGroupAccesses: any[];
    attributeValues: any[];
    legends: Legend[];
    translations: any[];
    userAccesses: any[];
}

export interface Legend {
    lastUpdated: string;
    id: string;
    created: string;
    name: string;
    endValue: number;
    color: string;
    displayName: string;
    externalAccess: boolean;
    startValue: number;
    sharing: LegendSharing;
    favorite: boolean;
    access: Access;
    favorites: any[];
    translations: any[];
    userGroupAccesses: any[];
    attributeValues: any[];
    userAccesses: any[];
}

export interface LegendSharing {
    external: boolean;
    users: ParentGraphMap;
    userGroups: ParentGraphMap;
}

export interface ParentGraphMap { }

export interface LegendSetSharing {
    owner: string;
    external: boolean;
    users: ParentGraphMap;
    userGroups: ParentGraphMap;
    public: string;
}
