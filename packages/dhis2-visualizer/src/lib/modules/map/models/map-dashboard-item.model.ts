export interface MapDashboardItem {
    lastUpdated: string;
    id: string;
    created: string;
    type: string;
    externalAccess: boolean;
    contentCount: number;
    height: number;
    interpretationCount: number;
    sharing: Sharing;
    width: number;
    x: number;
    y: number;
    interpretationLikeCount: number;
    favorite: boolean;
    access: Access;
    map: Map;
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

export interface Map {
    lastUpdated: string;
    id: string;
    created: string;
    name: string;
    displayName: string;
    basemap: string;
    externalAccess: boolean;
    subscribed: boolean;
    sharing: Sharing;
    displayFormName: string;
    favorite: boolean;
    access: Access;
    lastUpdatedBy: CreatedBy;
    createdBy: CreatedBy;
    user: CreatedBy;
    favorites: any[];
    translations: any[];
    mapViews: MapView[];
    interpretations: any[];
    userGroupAccesses: any[];
    subscribers: any[];
    attributeValues: any[];
    userAccesses: any[];
}

export interface CreatedBy {
    displayName: string;
    name: string;
    id: string;
    username: string;
}

export interface MapView {
    lastUpdated: string;
    id: string;
    created: string;
    name: string;
    userOrganisationUnitChildren: boolean;
    subscribed: boolean;
    userOrganisationUnit: boolean;
    method: number;
    renderingStrategy: string;
    sortOrder: number;
    favorite: boolean;
    topLimit: number;
    userOrganisationUnitGrandChildren: boolean;
    displayName: string;
    layer: string;
    hideTitle: boolean;
    eventClustering: boolean;
    opacity: number;
    parentLevel: number;
    parentGraphMap: any;
    completedOnly: boolean;
    eventPointRadius: number;
    sharing: Sharing;
    displayFormName: string;
    thematicMapType: string;
    hideSubtitle: boolean;
    externalAccess: boolean;
    digitGroupSeparator: string;
    access: Access;
    relativePeriods: { [key: string]: boolean };
    legendSet: LegendSet;
    dataElementGroupSetDimensions: any[];
    attributeDimensions: any[];
    translations: any[];
    filterDimensions: string[];
    interpretations: any[];
    userGroupAccesses: any[];
    subscribers: any[];
    columns: any[];
    dataElementDimensions: any[];
    periods: any[];
    categoryDimensions: any[];
    itemOrganisationUnitGroups: any[];
    programIndicatorDimensions: any[];
    attributeValues: any[];
    columnDimensions: string[];
    userAccesses: any[];
    favorites: any[];
    dataDimensionItems: DataDimensionItem[];
    categoryOptionGroupSetDimensions: any[];
    organisationUnitGroupSetDimensions: any[];
    organisationUnitLevels: number[];
    organisationUnits: any[];
    filters: any[];
    rows: any[];
}

export interface DataDimensionItem {
    dataDimensionItemType: string;
    indicator: LegendSet;
}

export interface LegendSet {
    id: string;
}

export interface Sharing {
    external: boolean;
    users: any;
    userGroups: any;
    owner?: string;
}
